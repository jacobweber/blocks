import { decorate, observable, computed, action, runInAction } from 'mobx';
import { createContext, useContext } from 'react';

import { PreferencesStore, Preferences } from 'stores/PreferencesStore';
import { NewGameStore } from 'stores/NewGameStore';
import { HighScoresStore, HighScore } from 'stores/HighScoresStore';
import { GameState, Actions, logAction, getKeyStr, getModifiedKeyStr, getDownDelayMS, getLevel } from 'utils/helpers';
import { PointSymbolID, BlockType, BlockDef, PointXY, BlockRotations, BlockColor, calculateBlockRotations, calculateBlockWeights } from 'utils/blocks';

const log = false;
const numClearRowsBonus = 4;
const animDelayMS = 5;
const junkOdds = 3;
const downTimerPauseWhenMovingMS = 500;

export interface PositionedPoint {
	x: number;
	y: number;
	id: PointSymbolID;
}

export interface PositionedBlock {
	type: BlockType;
	x: number;
	y: number;
	rotation: number;
}

type UndoFrame = { block: PositionedBlock; score: number };

export interface FilledPoint {
	id: PointSymbolID;
}

class MainStore {
	preferencesStore: PreferencesStore = new PreferencesStore();
	highScoresStore: HighScoresStore = new HighScoresStore();
	newGameStore: NewGameStore = new NewGameStore();

	positionedBlock: PositionedBlock | null = null;
	filledPoints: Array<Array<FilledPoint | null>> = []; // [y][x]
	undoStack: Array<UndoFrame> = [];
	nextBlockTypes: Array<BlockType> = [];

	actionQueue: Array<Actions> = [];
	heldAction: Actions | null = null;
	heldKey: string | null = null;
	heldTimeout: number | undefined = undefined;

	gameState: GameState = GameState.Reset;
	animating = false;
	downTimeout: number | undefined = undefined;
	lastMoveAboveBlockedSpace: Date | null = null;
	score = 0;
	rows = 0;
	startLevel = 1;
	totalTime = 0;
	unpausedStart = 0;

	gameBlockDefs: Array<BlockDef> = [];
	width: number = 0;
	height: number = 0;

	constructor() {
		this.preferencesStore.load();
		this.highScoresStore.load();
		this.lockGamePrefs();
		this.resetGameCompletely();
	}

	initWindowEvents() {
		let wasActive = false;
		window.addEventListener('blur', e => {
			wasActive = this.gameState === GameState.Active;
			this.pause();
		});
		window.addEventListener('focus', e => {
			if (wasActive) {
				this.resume();
			}
		});
		window.addEventListener('keydown', e => this.keyDown(e));
		window.addEventListener('keyup', e => this.keyUp(e));
	}

	get prefs(): Preferences {
		return this.preferencesStore.prefs;
	}

	showPrefs(): void {
		const wasActive = this.gameState === GameState.Active;
		this.pause();
		this.preferencesStore.dialogShow(() => {
			if (wasActive) {
				this.resume();
			}
		});
	}

	showHighScores(): void {
		const wasActive = this.gameState === GameState.Active;
		this.pause();
		this.highScoresStore.dialogShow(() => {
			if (wasActive) {
				this.resume();
			}
		});
	}

	get blockColors(): Array<BlockColor> {
		return [
			{ id: 'flashOn', color: '#000000' },
			{ id: 'flashOff', color: '#FFFFFF' },
			...this.gameBlockDefs
		];
	}

	get gameBlockRotations(): Array<BlockRotations> {
		return this.gameBlockDefs.map(def => calculateBlockRotations(def));
	}

	get weightedBlockTypes() {
		return calculateBlockWeights(this.gameBlockDefs);
	}

	getRandomBlockType(): BlockType {
		const index = Math.floor(Math.random() * this.weightedBlockTypes.length);
		return this.weightedBlockTypes[index];
	}

	get downDelayMS(): number {
		return getDownDelayMS(this.level);
	}

	get nextBlockType(): BlockType | null {
		if (this.nextBlockTypes.length === 0) return null;
		return this.nextBlockTypes[this.nextBlockTypes.length - 1];
	}

	getBlockDef(type: BlockType): BlockDef {
		return this.gameBlockDefs[type]!;
	}

	getBlockRotations(type: BlockType): BlockRotations {
		return this.gameBlockRotations[type]!;
	}

	lockGamePrefs() {
		this.gameBlockDefs = [ ...this.prefs.blockDefs ];
		this.width = this.prefs.width;
		this.height = this.prefs.height;
	}

	resetGameLeavingBoard(): void {
		if (log) console.clear();
		window.clearTimeout(this.downTimeout);
		this.downTimeout = undefined;
		window.clearTimeout(this.heldTimeout);
		this.heldTimeout = undefined;
		this.actionQueue = [];
		this.animating = false;
		this.heldAction = null;
		this.heldKey = null;
		this.positionedBlock = null;
		this.undoStack = [];
		this.nextBlockTypes = [];
		this.lastMoveAboveBlockedSpace = null;
		this.unpausedStart = 0;
	}

	resetGameCompletely() {
		this.resetGameLeavingBoard();
		this.filledPoints = Array.from({ length: this.height }, () => Array.from({ length: this.width }));
		this.score = 0;
		this.rows = 0;
		this.totalTime = 0;
	}

	newGame(): void {
		if (this.gameState === GameState.Paused || this.gameState === GameState.Active) return;
		this.lockGamePrefs();
		this.resetGameCompletely();

		this.startLevel = this.prefs.startLevel;
		this.fillRowsWithJunk();
		this.gameState = GameState.Active;
		this.unpausedStart = (new Date()).getTime();
		this.updateDownTimer();
		this.newBlock();
	}

	newGameOptions(): void {
		if (this.gameState === GameState.Paused || this.gameState === GameState.Active) return;
		this.newGameStore.dialogShow(
			this.prefs.startLevel, this.prefs.rowsJunk,
			(result, level, rows) => {
				if (result) {
					this.preferencesStore.saveNewGameOptions(level, rows);
					this.newGame();
				}
			}
		);
	}

	fillRowsWithJunk() {
		if (this.prefs.rowsJunk === 0) return;
		for (let y = this.height - 1; y >= this.height - this.prefs.rowsJunk; y--) {
			for (let x = 0; x < this.width; x++) {
				if (Math.floor(Math.random() * junkOdds) === 0) {
					const type = this.getRandomBlockType();
					this.filledPoints[y][x] = {
						id: this.getBlockDef(type).id
					};
				}
			}
		}
	}

	endGame(): void {
		if (this.gameState === GameState.Ended) {
			this.gameState = GameState.Reset;
			this.resetGameCompletely();
			return;
		}

		if (this.gameState === GameState.Reset) return;
		this.gameState = GameState.Ended;
		const unpausedTime = (new Date()).getTime() - this.unpausedStart;
		this.totalTime += unpausedTime;
		this.updateDownTimer();
		this.resetGameLeavingBoard();

		const entry: HighScore = {
			name: this.prefs.name,
			score: this.score,
			rows: this.rows,
			startLevel: this.startLevel,
			endLevel: this.level,
			totalTime: this.totalTime,
			time: (new Date().getTime())
		};
		const newPosition = this.highScoresStore.recordIfHighScore(entry);
		if (newPosition !== null) {
			window.setTimeout(() => {
				this.highScoresStore.dialogShow();
			}, 500);
		}
	}

	updateDownTimer(): void {
		if (this.gameState !== GameState.Active || this.animating) {
			if (this.downTimeout) {
				this.stopDownTimer();
			}
		} else {
			if (!this.downTimeout) {
				this.startDownTimer();
			}
		}
	}

	stopDownTimer(): void {
		window.clearTimeout(this.downTimeout);
		this.downTimeout = undefined;
	}

	startDownTimer(): void {
		if (this.gameState !== GameState.Active) return;
		this.downTimeout = window.setTimeout(() => {
			this.down(true);
			this.startDownTimer();
		}, this.downDelayMS);
	}

	setAnimating(animating: boolean): void {
		this.animating = animating;
		this.updateDownTimer();
		if (!animating) {
			this.handleQueuedAction();
		}
	}

	pause(): void {
		if (this.gameState !== GameState.Active) return;
		this.gameState = GameState.Paused;
		const unpausedTime = (new Date()).getTime() - this.unpausedStart;
		this.totalTime += unpausedTime;
		this.updateDownTimer();
	}

	resume(): void {
		if (this.gameState !== GameState.Paused) return;
		this.gameState = GameState.Active;
		this.unpausedStart = (new Date()).getTime();
		this.updateDownTimer();
	}

	pauseResume(): void {
		if (this.gameState === GameState.Paused) {
			this.resume();
		} else if (this.gameState === GameState.Active) {
			this.pause();
		}
	}

	getPoints(block: PositionedBlock): Array<PointXY> {
		return this.getBlockRotations(block.type)[block.rotation].points.map(point => [
			block.x + point[0],
			block.y + point[1]
		]);
	}

	canRotate(block: PositionedBlock) {
		const def = this.getBlockDef(block.type);
		return block.x >= 0
			&& block.x + def.size <= this.width
			&& block.y + def.size <= this.height;
	}

	inBounds(block: PositionedBlock): boolean {
		const extent = this.getBlockRotations(block.type)[block.rotation].extent;
		return block.x + extent[0] >= 0
			// && block.y - extent[1] >= 0
			&& block.x + extent[2] < this.width
			&& block.y + extent[3] < this.height;
	}

	positionFree(block: PositionedBlock): boolean {
		const points = this.getPoints(block);
		for (let i = 0; i < points.length; i++) {
			const point = points[i];
			if (point[1] >= 0 && this.filledPoints[point[1]][point[0]]) {
				return false;
			}
		}
		return true;
	}

	markPositionFilled(block: PositionedBlock): void {
		const points = this.getPoints(block);
		points.forEach(point => {
			if (point[1] >= 0) {
				this.filledPoints[point[1]][point[0]] = {
					id: this.getBlockDef(block.type).id
				}
			}
		});
	}

	markPositionUnfilled(block: PositionedBlock): void {
		const points = this.getPoints(block);
		points.forEach(point => {
			if (point[1] >= 0) {
				this.filledPoints[point[1]][point[0]] = null;
			}
		});
	}

	newBlock(): void {
		let type;
		if (this.nextBlockTypes.length > 0) {
			type = this.nextBlockTypes[this.nextBlockTypes.length - 1];
			this.nextBlockTypes = this.nextBlockTypes.slice(0, -1);
		} else {
			type = this.getRandomBlockType();
		}
		if (this.nextBlockTypes.length === 0) {
			this.nextBlockTypes = [ this.getRandomBlockType() ];
		}
		const rotation = 0;
		const extent = this.getBlockRotations(type)[rotation].extent;
		const blockWidth = extent[2] - extent[0] + 1;
		const x = Math.ceil((this.width - blockWidth) / 2);
		const y = -extent[1];
		const nextBlock = { x, y, type, rotation };
		if (this.positionFree(nextBlock)) {
			this.positionedBlock = nextBlock;
		} else {
			this.endGame();
		}
	}

	getClearedRows(): number[] {
		const rows: number[] = [];
		if (!this.positionedBlock) return rows;
		for (let checkOffset = 0; checkOffset < this.getBlockDef(this.positionedBlock.type).size; checkOffset++) {
			const y = this.positionedBlock.y + checkOffset;
			if (y < 0 || y >= this.height) continue;
			const checkRow = this.filledPoints[y];
			let rowComplete = true;
			for (let x = 0; x < this.width; x++) {
				if (!checkRow[x]) {
					rowComplete = false;
					break;
				}
			}
			if (rowComplete) {
				rows.push(y);
			}
		}
		return rows;
	}

	async clearRowsDisplay(rows: number[]): Promise<void> {
		if (rows.length === 0) return;
		this.undoStack = [];
		const hasBonus = rows.length === numClearRowsBonus;
		const numFlashes = hasBonus ? 1 : 1;
		let count = 0;
		const flash = action(() => {
			const id = count % 2 === 0 ? 'flashOn' : 'flashOff';
			for (let row = 0; row < rows.length; row++) {
				this.filledPoints[rows[row]] = Array.from({ length: this.width }, () => ({
					id: id
				}));
			}
			count++;
		});

		this.setAnimating(true);
		flash();
		for (var i = 0; i < numFlashes; i++) {
			await this.delay(100);
			flash();
		}
		this.setAnimating(false);
	}

	clearRows(rows: number[]): void {
		if (rows.length === 0) return;
		for (let row = rows.length - 1; row >= 0; row--) {
			this.filledPoints.splice(rows[row], 1);
		}
		for (let row = 0; row < rows.length; row++) {
			this.filledPoints.unshift(Array.from({ length: this.width }));
		}
	}

	async freezeBlock(points: number = 0): Promise<void> {
		if (!this.positionedBlock) return;
		if (this.prefs.allowUndo) {
			this.undoStack.push({
				block: this.positionedBlock,
				score: this.score
			});
		}
		this.markPositionFilled(this.positionedBlock);
		const clearedRows = this.getClearedRows();
		this.positionedBlock = null;
		this.scoreDrop(points);
		this.scoreClearedRows(clearedRows.length);
		await this.clearRowsDisplay(clearedRows);
		runInAction(() => {
			this.clearRows(clearedRows);
			this.newBlock();
		});
	}

	scoreDrop(points: number): void {
		this.score += points;
	}

	scoreClearedRows(rows: number): void {
		if (rows === 0) return;
		const mult = (rows === 1 ? 40
			: (rows === 2 ? 100
				: (rows === 3 ? 300
					: (rows === 4 ? 1200 : 0))));
		this.score += this.level * mult;
		// score based on level before adding rows
		this.rows += rows;
		this.stopDownTimer();
		this.startDownTimer();
	}

	get level(): number {
		return Math.max(this.startLevel, getLevel(this.rows));
	}

	checkAboveBlockedSpace(): void {
		if (!this.positionedBlock) return;
		const nextBlock: PositionedBlock = {
			...this.positionedBlock,
			y: this.positionedBlock.y + 1
		}
		if (!this.inBounds(nextBlock) || !this.positionFree(nextBlock)) {
			this.lastMoveAboveBlockedSpace = new Date();
		}
	}

	recentlyAboveBlockedSpace(): boolean {
		if (!this.prefs.delayFinalDrop) return false;
		return this.lastMoveAboveBlockedSpace !== null && this.lastMoveAboveBlockedSpace.getTime() + downTimerPauseWhenMovingMS >= (new Date()).getTime();
	}

	rotateCW(): void {
		if (this.gameState !== GameState.Active || !this.positionedBlock || !this.canRotate(this.positionedBlock)) return;
		const numRotations = this.getBlockRotations(this.positionedBlock.type).length;
		const nextRotation = this.positionedBlock.rotation + 1 >= numRotations ? 0 : this.positionedBlock.rotation + 1;
		const nextBlock: PositionedBlock = {
			...this.positionedBlock,
			rotation: nextRotation
		}
		if (this.positionFree(nextBlock)) {
			this.checkAboveBlockedSpace();
			this.positionedBlock = nextBlock;
		}
	}

	rotateCCW(): void {
		if (this.gameState !== GameState.Active || !this.positionedBlock || !this.canRotate(this.positionedBlock)) return;
		const numRotations = this.getBlockRotations(this.positionedBlock.type).length;
		const nextRotation = this.positionedBlock.rotation - 1 < 0 ? numRotations - 1 : this.positionedBlock.rotation - 1;
		const nextBlock: PositionedBlock = {
			...this.positionedBlock,
			rotation: nextRotation
		}
		if (this.positionFree(nextBlock)) {
			this.checkAboveBlockedSpace();
			this.positionedBlock = nextBlock;
		}
	}

	left(): boolean {
		if (this.gameState !== GameState.Active || !this.positionedBlock) return false;
		const nextBlock: PositionedBlock = {
			...this.positionedBlock,
			x: this.positionedBlock.x - 1
		}
		if (this.inBounds(nextBlock) && this.positionFree(nextBlock)) {
			this.checkAboveBlockedSpace();
			this.positionedBlock = nextBlock;
			return true;
		}
		return false;
	}

	right(): boolean {
		if (this.gameState !== GameState.Active || !this.positionedBlock) return false;
		const nextBlock: PositionedBlock = {
			...this.positionedBlock,
			x: this.positionedBlock.x + 1
		}
		if (this.inBounds(nextBlock) && this.positionFree(nextBlock)) {
			this.checkAboveBlockedSpace();
			this.positionedBlock = nextBlock;
			return true;
		}
		return false;
	}

	async leftAccel(): Promise<void> {
		this.setAnimating(true);
		let done = false;
		while (!done) {
			done = !this.left();
			await this.delay(animDelayMS);
		}
		this.setAnimating(false);
	}

	async rightAccel(): Promise<void> {
		this.setAnimating(true);
		let done = false;
		while (!done) {
			done = !this.right();
			await this.delay(animDelayMS);
		}
		this.setAnimating(false);
	}

	async down(fromTimer: boolean = false): Promise<void> {
		if (this.gameState !== GameState.Active || !this.positionedBlock) return;
		const nextBlock: PositionedBlock = {
			...this.positionedBlock,
			y: this.positionedBlock.y + 1
		}
		if (fromTimer && this.recentlyAboveBlockedSpace()) {
			return;
		}
		if (this.inBounds(nextBlock) && this.positionFree(nextBlock)) {
			this.positionedBlock = nextBlock;
		} else {
			await this.freezeBlock();
		}
	}

	async drop(): Promise<void> {
		if (this.gameState !== GameState.Active || !this.positionedBlock) return;
		let done = false;
		const nextDrop = () => {
			if (!this.positionedBlock) return;
			const nextBlock: PositionedBlock = {
				...this.positionedBlock,
				y: this.positionedBlock.y + 1
			}
			if (this.inBounds(nextBlock) && this.positionFree(nextBlock)) {
				this.positionedBlock = nextBlock;
			} else {
				done = true;
			}
		};

		const extent = this.getBlockRotations(this.positionedBlock.type)[this.positionedBlock.rotation].extent;
		const points = this.height - (this.positionedBlock.y + extent[3]) - 1;

		this.setAnimating(true);
		while (!done) {
			runInAction(nextDrop);
			await this.delay(animDelayMS);
		}
		await this.freezeBlock(points);
		this.setAnimating(false);
	}

	async undo(): Promise<void> {
		if (this.gameState !== GameState.Active || !this.prefs.allowUndo || this.undoStack.length === 0) return;
		if (this.positionedBlock) {
			this.nextBlockTypes = [ ...this.nextBlockTypes, this.positionedBlock.type ];
		}
		const undoFrame = this.undoStack.pop();
		if (!undoFrame) return;
		this.score = undoFrame.score;
		const unfrozenBlock = undoFrame.block;
		this.markPositionUnfilled(unfrozenBlock);
		const lastY = this.getBlockDef(unfrozenBlock.type).size === 2 ? 0 : -1;

		let done = false;
		let y = unfrozenBlock.y - 1;
		const nextLift = () => {
			const nextBlock: PositionedBlock = {
				...unfrozenBlock,
				y
			};
			this.positionedBlock = nextBlock;
			if (y <= lastY) {
				done = true;
			} else {
				y--;
			}
		};

		this.setAnimating(true);
		while (!done) {
			runInAction(nextLift);
			await this.delay(animDelayMS);
		}
		this.setAnimating(false);
	}

	delay(ms: number): Promise<void> {
		return new Promise(function (resolve, reject) {
			setTimeout(resolve, ms);
		});
	}

	async startHeldAction(action: Actions, key: string): Promise<void> {
		this.heldAction = action;
		this.heldKey = key;

		if (log) console.log('press', logAction(action));
		this.heldTimeout = window.setTimeout(() => {
			if (log) console.log('accel', logAction(action));
			this.heldAction = null;
			this.heldKey = null;
			const accelAction = action === Actions.Left ? Actions.LeftAccel : Actions.RightAccel;
			if (this.animating) {
				this.accelLastQueuedAction(accelAction);
			} else {
				this.handleAction(accelAction);
			}
		}, this.prefs.leftRightAccelAfterMS);
	}

	accelLastQueuedAction(action: Actions.LeftAccel | Actions.RightAccel): void {
		for (let i = this.actionQueue.length - 1; i >= 0; i--) {
			if (this.actionQueue[i] === Actions.Left && action === Actions.LeftAccel) {
				this.actionQueue[i] = action;
				return;
			} else if (this.actionQueue[i] === Actions.Right && action === Actions.RightAccel) {
				this.actionQueue[i] = action;
				return;
			}
		}
	}

	cancelHeldAction(): void {
		if (log && this.heldAction) console.log('release', logAction(this.heldAction));
		window.clearTimeout(this.heldTimeout);
		this.heldAction = null;
		this.heldKey = null;
		this.handleQueuedAction();
	}

	handleQueuedAction() {
		if (this.animating) return;
		const queuedAction = this.actionQueue.shift();
		if (queuedAction) {
			if (log) console.log('unqueue', logAction(queuedAction));
			this.handleAction(queuedAction);
		}
	}

	async handleAction(action: Actions) {
		if (log) console.log('action', logAction(action));
		switch (action) {
			case Actions.NewGame: this.newGame(); break;
			case Actions.NewGameOptions: this.newGameOptions(); break;
			case Actions.EndGame: this.endGame(); break;
			case Actions.PauseResumeGame: this.pauseResume(); break;
			case Actions.Undo: await this.undo(); break;
			case Actions.Left: this.left(); break;
			case Actions.LeftAccel: await this.leftAccel(); break;
			case Actions.Right: this.right(); break;
			case Actions.RightAccel: await this.rightAccel(); break;
			case Actions.Down: await this.down(); break;
			case Actions.Drop: await this.drop(); break;
			case Actions.RotateCCW: this.rotateCCW(); break;
			case Actions.RotateCW: this.rotateCW(); break;
		}

		// in case any more actions were queued
		this.handleQueuedAction();
	}

	keyDown(e: KeyboardEvent) {
		if (this.newGameStore.visible || this.preferencesStore.visible || this.highScoresStore.visible) return;
		let keyStr = getModifiedKeyStr(e);

		let action = this.preferencesStore.gameKeyMap[keyStr];
		if (action === undefined) {
			keyStr = getKeyStr(e);
			action = this.preferencesStore.moveKeyMap[keyStr];
			if (action === undefined) {
				return;
			}
		}

		e.preventDefault();

		const noRepeat = action === Actions.Drop || action === Actions.NewGame || action === Actions.NewGameOptions || action === Actions.PauseResumeGame;
		if (noRepeat && e.repeat) return;

		const canHoldKey = (action === Actions.Left || action === Actions.Right)
			&& this.prefs.leftRightAccelAfterMS !== 0;

		// ignore repeated left/right keys; use tracking instead
		if (canHoldKey && e.repeat) return;

		if (this.animating || this.heldAction) {
			if (log) console.log('queue', logAction(action));
			this.actionQueue.push(action);
		} else {
			this.handleAction(action);
		}

		if (canHoldKey && !this.heldAction) {
			this.startHeldAction(action, keyStr);
		}
	}

	keyUp(e: KeyboardEvent) {
		const keyStr = getKeyStr(e);
		if (this.heldKey !== null && this.heldKey === keyStr) {
			this.cancelHeldAction();
		}
	}

	getFrozenPoints(): Array<PositionedPoint> {
		const points: Array<PositionedPoint> = [];
		for (let x = 0; x < this.width; x++) {
			for (let y = 0; y < this.height; y++) {
				const point = this.filledPoints[y][x];
				if (point) {
					points.push({
						x,
						y,
						id: point.id
					});
				}
			}
		}
		return points;
	}

	getPositionedBlockPoints(): Array<PositionedPoint> {
		if (!this.positionedBlock) return [];
		const positionedBlockPoints = this.getPoints(this.positionedBlock);
		const id = this.getBlockDef(this.positionedBlock.type).id;
		return positionedBlockPoints.map(point => ({
			x: point[0],
			y: point[1],
			id
		})).filter(point => point.y >= 0);
	}

	getNextBlockPoints(): Array<PositionedPoint> {
		if (this.nextBlockType === null) return [];
		const rotation = this.getBlockRotations(this.nextBlockType)[0];
		const top = rotation.extent[1];
		const id = this.getBlockDef(this.nextBlockType).id;
		return rotation.points.map(point => ({
			x: point[0],
			y: point[1] - top,
			id: id
		}));
	}
}

decorate(MainStore, {
	animating: observable,
	score: observable,
	rows: observable,
	level: computed,
	startLevel: observable,
	downDelayMS: computed,
	gameState: observable,
	positionedBlock: observable.ref,
	gameBlockDefs: observable,
	width: observable,
	height: observable,
	gameBlockRotations: computed,
	weightedBlockTypes: computed,
	prefs: computed,
	nextBlockType: computed,
	nextBlockTypes: observable.ref,
	filledPoints: observable,
	blockColors: computed,
	lockGamePrefs: action,
	resetGameLeavingBoard: action,
	resetGameCompletely: action,
	newGame: action,
	fillRowsWithJunk: action,
	endGame: action,
	pause: action,
	resume: action,
	newBlock: action,
	freezeBlock: action,
	scoreDrop: action,
	scoreClearedRows: action,
	clearRows: action,
	undo: action,
	rotateCW: action,
	rotateCCW: action,
	left: action,
	right: action,
	down: action,
	drop: action
});

export { MainStore };

export const StoreContext = createContext<MainStore>({} as MainStore);
export const useStore = (): MainStore => useContext(StoreContext);
