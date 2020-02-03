import { decorate, observable, computed, action, runInAction } from 'mobx';
import { createContext, useContext } from 'react';
import { PreferencesStore, Preferences } from './PreferencesStore';
import { GameState, KeyActions } from '../utils/types';
import { getKeyStr, getModifiedKeyStr } from '../utils/helpers';

const log = false;
const numClearRowsBonus = 4;
const animDelayMS = 5;

type PointXY = [number, number];
type ExtentLTRB = [ number, number, number, number ];
type Rotation = { points: Array<PointXY>, extent: ExtentLTRB };

export interface PositionedPoint {
	x: number;
	y: number;
	id: PointID;
}

export interface BlockDef {
	id: PointID;
	size: number;
	rotations: Array<Rotation>; // index is rotation number
}

export enum PointID {
	Line = 'line',
	Square = 'square',
	Are = 'are',
	Ell = 'ell',
	Ess = 'ess',
	Zee = 'zee',
	Tee = 'tee',
	FlashOn = 'flashOn',
	FlashOff = 'flashOff'
}

const line: BlockDef = {
	id: PointID.Line,
	size: 4,
	rotations: [
		{ points: [[0,1], [1,1], [2,1], [3,1]], extent: [0,1,3,1] },
		{ points: [[2,0], [2,1], [2,2], [2,3]], extent: [2,0,2,3] }
	]
};
const square: BlockDef = {
	id: PointID.Square,
	size: 2,
	rotations: [
		{ points: [[0,0], [1,0], [0,1], [1,1]], extent: [0,0,1,1] }
	]
};
const are: BlockDef = {
	id: PointID.Are,
	size: 3,
	rotations: [
		{ points: [[0,1], [1,1], [2,1], [2,2]], extent: [0,1,2,2] },
		{ points: [[1,0], [1,1], [0,2], [1,2]], extent: [0,0,1,2] },
		{ points: [[0,0], [0,1], [1,1], [2,1]], extent: [0,0,2,1] },
		{ points: [[1,0], [2,0], [1,1], [1,2]], extent: [1,0,2,2] }
	]
};
const ell: BlockDef = {
	id: PointID.Ell,
	size: 3,
	rotations: [
		{ points: [[0,1], [1,1], [2,1], [0,2]], extent: [0,1,2,2] },
		{ points: [[0,0], [1,0], [1,1], [1,2]], extent: [0,0,1,2] },
		{ points: [[2,0], [0,1], [1,1], [2,1]], extent: [0,0,2,1] },
		{ points: [[1,0], [1,1], [1,2], [2,2]], extent: [1,0,2,2] }
	]
};
const ess: BlockDef = {
	id: PointID.Ess,
	size: 3,
	rotations: [
		{ points: [[1,1], [2,1], [0,2], [1,2]], extent: [0,1,2,2] },
		{ points: [[1,0], [1,1], [2,1], [2,2]], extent: [1,0,2,2] }
	]
};
const zee: BlockDef = {
	id: PointID.Zee,
	size: 3,
	rotations: [
		{ points: [[0,1], [1,1], [1,2], [2,2]], extent: [0,1,2,2] },
		{ points: [[2,0], [1,1], [2,1], [1,2]], extent: [1,0,2,2] }
	]
};
const tee: BlockDef = {
	id: PointID.Tee,
	size: 3,
	rotations: [
		{ points: [[0,1], [1,1], [2,1], [1,2]], extent: [0,1,2,2] },
		{ points: [[1,0], [0,1], [1,1], [1,2]], extent: [0,0,1,2] },
		{ points: [[1,0], [0,1], [1,1], [2,1]], extent: [0,0,2,1] },
		{ points: [[1,0], [1,1], [2,1], [1,2]], extent: [1,0,2,2] }
	]
};

enum BlockType { Line, Square, Are, Ell, Ess, Zee, Tee }

const blockDefs = new Map<BlockType, BlockDef>([
	[BlockType.Line, line],
	[BlockType.Square, square],
	[BlockType.Are, are],
	[BlockType.Ell, ell],
	[BlockType.Ess, ess],
	[BlockType.Zee, zee],
	[BlockType.Tee, tee]
]);

export interface PositionedBlock {
	type: BlockType;
	x: number;
	y: number;
	rotation: number;
}

type UndoFrame = { block: PositionedBlock; score: number };

export interface FilledPoint {
	id: PointID;
}

class MainStore {
	preferencesStore: PreferencesStore = new PreferencesStore();

	width: number = 10;
	height: number = 20;
	windowHeight: number = 0;

	positionedBlock: PositionedBlock | null = null;
	filledPoints: Array<Array<FilledPoint | null>> = []; // [y][x]
	undoStack: Array<UndoFrame> = [];
	nextBlockTypes: Array<BlockType> = [];

	actionQueue: Array<KeyActions> = [];
	heldAction: KeyActions | null = null;
	heldTimeout: number | undefined = undefined;

	gameState: GameState = GameState.Stopped;
	animating = false;
	downTimeout: number | undefined = undefined;
	lastMoveAboveBlockedSpace: Date | null = null;
	score = 0;
	rows = 0;

	constructor() {
		this.preferencesStore.load();
		this.resetGame();
	}

	initWindowEvents() {
		this.updateWindowHeight();
		window.addEventListener('blur', e => this.pause());
		window.addEventListener('keydown', e => this.keyDown(e));
		window.addEventListener('keyup', e => this.keyUp(e));
		window.addEventListener('resize', e => this.updateWindowHeight());
	}

	get prefs(): Preferences {
		return this.preferencesStore.prefs;
	}

	showPrefs(): void {
		this.pause();
		this.preferencesStore.dialogShow();
	}

	get downDelayMS(): number {
		return 800 - (this.level * 50);
	}

	updateWindowHeight() {
		this.windowHeight = window.innerHeight;
	}

	get pointSize(): number {
		return Math.min(Math.max(Math.floor((this.windowHeight - 50) / this.height), 10), 30);
	}

	get nextBlockDef(): BlockDef | null {
		if (this.nextBlockTypes.length === 0) return null;
		return this.getBlockDef(this.nextBlockTypes[this.nextBlockTypes.length - 1]);
	}

	getRandomBlockType(): BlockType {
		return Math.floor(Math.random() * blockDefs.size);
	}

	getBlockDef(type: BlockType): BlockDef {
		return blockDefs.get(type)!;
	}

	resetGame(): void {
		if (log) console.clear();
		this.gameState = GameState.Stopped;
		window.clearTimeout(this.downTimeout);
		this.downTimeout = undefined;
		window.clearTimeout(this.heldTimeout);
		this.heldTimeout = undefined;
		this.actionQueue = [];
		this.animating = false;
		this.heldAction = null;
		this.filledPoints = Array.from({ length: this.height }, () => Array.from({ length: this.width }));
		this.positionedBlock = null;
		this.undoStack = [];
		this.nextBlockTypes = [];
		this.lastMoveAboveBlockedSpace = null;
		this.score = 0;
		this.rows = 0;
	}

	newGame(): void {
		if (this.gameState !== GameState.Stopped) return;
		this.resetGame();
		this.setGameState(GameState.Active);
		this.newBlock();
	}

	endGame(): void {
		if (this.gameState === GameState.Stopped) return;
		this.resetGame();
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

	setGameState(gameState: GameState): void {
		this.gameState = gameState;
		this.updateDownTimer();
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
		this.setGameState(GameState.Paused);
	}

	resume(): void {
		if (this.gameState !== GameState.Paused) return;
		this.setGameState(GameState.Active);
	}

	pauseResume(): void {
		if (this.gameState === GameState.Paused) {
			this.resume();
		} else if (this.gameState === GameState.Active) {
			this.pause();
		}
	}

	getPoints(block: PositionedBlock): Array<PointXY> {
		return this.getBlockDef(block.type).rotations[block.rotation].points.map(point => [
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
		const extent = this.getBlockDef(block.type).rotations[block.rotation].extent;
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
			this.filledPoints[point[1]][point[0]] = null;
		});
	}

	getRandomPosition(type: BlockType): PositionedBlock | null {
		let tries = 20;
		const def = this.getBlockDef(type);
		const rotation = Math.floor(Math.random() * def.rotations.length);
		const extent = def.rotations[rotation].extent;
		const blockWidth = extent[2] - extent[0] + 1;
		const blockHeight = extent[3] - extent[1] + 1;
		while (tries > 0) {
			const x = Math.floor(Math.random() * (this.width - blockWidth + 1)) - extent[0];
			const y = Math.floor(Math.random() * (this.height - blockHeight + 1)) - extent[1];
			const positioned: PositionedBlock = { x, y, type, rotation }
			if (this.positionFree(positioned)) {
				return positioned;
			}
			tries--;
		}
		return null;
	}

	randomize(numBlocks: number = 20): void {
		this.resetGame();
		for (let i = 0; i < numBlocks; i++) {
			const type = this.getRandomBlockType();
			const positioned = this.getRandomPosition(type);
			if (positioned) {
				this.markPositionFilled(positioned);
			}
		}
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
		const extent = this.getBlockDef(type).rotations[rotation].extent;
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
			const id = count % 2 === 0 ? PointID.FlashOn : PointID.FlashOff;
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
		if (this.rows < 10) return 1;
		if (this.rows < 30) return 2;
		if (this.rows < 60) return 3;
		if (this.rows < 100) return 4;
		if (this.rows < 150) return 5;
		if (this.rows < 210) return 6;
		if (this.rows < 280) return 7;
		if (this.rows < 360) return 8;
		if (this.rows < 450) return 9;
		return 10;
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
		const downTimerPauseWhenMovingMS = this.prefs.downTimerPauseWhenMovingMS;
		return this.lastMoveAboveBlockedSpace !== null && this.lastMoveAboveBlockedSpace.getTime() + downTimerPauseWhenMovingMS >= (new Date()).getTime();
	}

	rotateCW(): void {
		if (this.gameState !== GameState.Active || !this.positionedBlock || !this.canRotate(this.positionedBlock)) return;
		const numRotations = this.getBlockDef(this.positionedBlock.type).rotations.length;
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
		const numRotations = this.getBlockDef(this.positionedBlock.type).rotations.length;
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

		const extent = this.getBlockDef(this.positionedBlock.type).rotations[this.positionedBlock.rotation].extent;
		const points = this.height -  (this.positionedBlock.y + extent[3]) - 1;

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
			if (y === lastY) {
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

	async startTrackingKey(action: KeyActions): Promise<void> {
		this.heldAction = action;

		if (log) console.log('press', this.getActionName(action));
		this.heldTimeout = window.setTimeout(() => {
			if (log) console.log('accel', this.getActionName(action));
			this.heldAction = null;
			const accelAction = action === KeyActions.Left ? KeyActions.LeftAccel : KeyActions.RightAccel;
			if (this.animating) {
				this.accelLastQueuedAction(accelAction);
			} else {
				this.handleAction(accelAction);
			}
		}, this.prefs.leftRightAccelAfterMS);
	}

	accelLastQueuedAction(action: KeyActions.LeftAccel | KeyActions.RightAccel): void {
		for (let i = this.actionQueue.length - 1; i >= 0; i--) {
			if (this.actionQueue[i] === KeyActions.Left && action === KeyActions.LeftAccel) {
				this.actionQueue[i] = action;
				return;
			} else if (this.actionQueue[i] === KeyActions.Right && action === KeyActions.RightAccel) {
				this.actionQueue[i] = action;
				return;
			}
		}
	}

	stopTrackingKey(): void {
		// TODO: if queued, keyup happens before we start tracking, so ignored
		if (log && this.heldAction) console.log('release', this.getActionName(this.heldAction));
		window.clearTimeout(this.heldTimeout);
		this.heldAction = null;
		this.handleQueuedAction();
	}

	handleQueuedAction() {
		if (this.animating) return;
		const queuedAction = this.actionQueue.shift();
		if (queuedAction) {
			if (log) console.log('unqueue', this.getActionName(queuedAction));
			this.handleAction(queuedAction);
		}
	}

	getActionName(action: KeyActions): string {
		switch (action) {
			case KeyActions.NewGame: return 'newGame';
			case KeyActions.EndGame: return 'endGame';
			case KeyActions.PauseResumeGame: return 'pauseResumeGame';
			case KeyActions.Undo: return 'undo';
			case KeyActions.Left: return 'left';
			case KeyActions.LeftAccel: return 'leftAccel';
			case KeyActions.Right: return 'right';
			case KeyActions.RightAccel: return 'rightAccel';
			case KeyActions.Down: return 'down';
			case KeyActions.Drop: return 'drop';
			case KeyActions.RotateCCW: return 'rotateCCW';
			case KeyActions.RotateCW: return 'rotateCW';
		}
	}

	async handleAction(action: KeyActions) {
		if (log) console.log('action', this.getActionName(action));
		switch (action) {
			case KeyActions.NewGame: this.newGame(); break;
			case KeyActions.EndGame: this.endGame(); break;
			case KeyActions.PauseResumeGame: this.pauseResume(); break;
			case KeyActions.Undo: await this.undo(); break;
			case KeyActions.Left: this.left(); break;
			case KeyActions.LeftAccel: await this.leftAccel(); break;
			case KeyActions.Right: this.right(); break;
			case KeyActions.RightAccel: await this.rightAccel(); break;
			case KeyActions.Down: await this.down(); break;
			case KeyActions.Drop: await this.drop(); break;
			case KeyActions.RotateCCW: this.rotateCCW(); break;
			case KeyActions.RotateCW: this.rotateCW(); break;
		}

		// in case any more actions were queued
		this.handleQueuedAction();
	}

	keyDown(e: KeyboardEvent) {
		if (this.preferencesStore.visible) return;
		let keyStr = getModifiedKeyStr(e);

		// ignore browser keys
		if (keyStr === 'Meta+ArrowLeft' || keyStr === 'Meta+ArrowRight' || keyStr === 'Meta+[' || keyStr === 'Meta+]') {
			if (log) console.log('ignore browser key');
			e.preventDefault();
			return;
		}

		let action = this.preferencesStore.gameKeyMap[keyStr];
		if (action === undefined) {
			keyStr = getKeyStr(e);
			action = this.preferencesStore.moveKeyMap[keyStr];
			if (action === undefined) return;
		}

		e.preventDefault();

		const noRepeat = action === KeyActions.Drop || action === KeyActions.NewGame || action === KeyActions.PauseResumeGame;
		if (noRepeat && e.repeat) return;

		const canHoldKey = (action === KeyActions.Left || action === KeyActions.Right)
			&& this.prefs.leftRightAccelAfterMS !== 0;

		// ignore repeated left/right keys; use tracking instead
		if (canHoldKey && e.repeat) return;

		if (this.animating || this.heldAction) {
			if (log) console.log('queue', this.getActionName(action));
			this.actionQueue.push(action);
		} else {
			this.handleAction(action);
		}

		if (canHoldKey && !this.heldAction) {
			this.startTrackingKey(action);
		}
	}

	keyUp(e: KeyboardEvent) {
		const keyStr = getKeyStr(e);
		const moveAction = this.preferencesStore.moveKeyMap[keyStr];
		if (moveAction === undefined) return;
		if (this.heldAction && this.heldAction === moveAction) {
			this.stopTrackingKey();
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
		}));
	}

	getNextBlockPoints(): Array<PositionedPoint> {
		if (!this.nextBlockDef) return [];
		const rotation = this.nextBlockDef.rotations[0];
		const top = rotation.extent[1];
		const id = this.nextBlockDef.id;
		return rotation.points.map(point => ({
			x: point[0],
			y: point[1] - top,
			id: id
		}));
	}
}

decorate(MainStore, {
	width: observable,
	height: observable,
	windowHeight: observable,
	animating: observable,
	score: observable,
	rows: observable,
	level: computed,
	downDelayMS: computed,
	gameState: observable,
	pointSize: computed,
	positionedBlock: observable.ref,
	prefs: computed,
	nextBlockDef: computed,
	nextBlockTypes: observable.ref,
	filledPoints: observable,
	updateWindowHeight: action,
	resetGame: action,
	newGame: action,
	endGame: action,
	pause: action,
	resume: action,
	randomize: action,
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
