import { observable, computed, action, runInAction } from 'mobx';
import { createContext, useContext } from 'react';

import { PreferencesStore, Preferences } from 'stores/PreferencesStore';
import { NewGameStore } from 'stores/NewGameStore';
import { HighScoresStore, HighScore } from 'stores/HighScoresStore';
import { GameState, getDownDelayMS, getLevel, Actions, getClearRowsScore, delay } from 'utils/helpers';
import { BlockType, BlockDef, PointXY, BlockRotations, BlockColor, calculateBlockRotations, calculateBlockWeights } from 'utils/blocks';
import { BoardStore, PositionedPoint } from './BoardStore';
import { InputStore } from './InputStore';

const animDelayMS = 5;
const junkOdds = 3;
const downTimerPauseWhenMovingMS = 500;

export interface PositionedBlock {
	type: BlockType;
	x: number;
	y: number;
	rotation: number;
}

type UndoFrame = { block: PositionedBlock; score: number };

class MainStore {
	boardStore: BoardStore = new BoardStore();
	preferencesStore: PreferencesStore = new PreferencesStore();
	highScoresStore: HighScoresStore = new HighScoresStore();
	newGameStore: NewGameStore = new NewGameStore();
	inputStore: InputStore = new InputStore(this, this.preferencesStore);

	@observable.ref positionedBlock: PositionedBlock | null = null;
	undoStack: Array<UndoFrame> = [];
	@observable.ref nextBlockTypes: Array<BlockType> = [];
	@observable touchDemoVisible: boolean = false;

	@observable gameState: GameState = GameState.Reset;
	@observable pauseTimer = false;
	@observable pauseInput = false;
	downTimeout: number | undefined = undefined;
	lastMoveAboveBlockedSpace: Date | null = null;
	@observable score = 0;
	@observable rows = 0;
	@observable startLevel = 1;
	totalTime = 0;
	unpausedStart = 0;

	@observable.ref gameBlockDefs: Array<BlockDef> = [];

	constructor() {
		this.preferencesStore.load();
		this.highScoresStore.load();
		this.lockGamePrefs();
		this.resetGameCompletely();
	}

	initWindowEvents() {
		this.boardStore.initWindowEvents();
		this.inputStore.initWindowEvents();
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
	}

	@computed get prefs(): Preferences {
		return this.preferencesStore.prefs;
	}

	@action showTouchDemo(): void {
		this.touchDemoVisible = !this.touchDemoVisible;
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

	@computed get blockColors(): Array<BlockColor> {
		return [
			...this.gameBlockDefs
		];
	}

	@computed get gameBlockRotations(): Array<BlockRotations> {
		return this.gameBlockDefs.map(def => calculateBlockRotations(def));
	}

	@computed get weightedBlockTypes() {
		return calculateBlockWeights(this.gameBlockDefs);
	}

	@computed get blockMaxInitialHeight(): number {
		const blockRotations = this.gameBlockRotations;
		let max = 0;
		blockRotations.forEach(rotations => {
			max = Math.max(max, rotations[0].extent[3] - rotations[0].extent[1] + 1);
		});
		return max;
	}

	@computed get blockMaxInitialWidth(): number {
		const blockRotations = this.gameBlockRotations;
		let max = 0;
		blockRotations.forEach(rotations => {
			max = Math.max(max, rotations[0].extent[2] - rotations[0].extent[0] + 1);
		});
		return max;
	}

	getRandomBlockType(): BlockType {
		const index = Math.floor(Math.random() * this.weightedBlockTypes.length);
		return this.weightedBlockTypes[index];
	}

	@computed get downDelayMS(): number {
		return getDownDelayMS(this.level);
	}

	@computed get nextBlockType(): BlockType | null {
		if (this.nextBlockTypes.length === 0) return null;
		return this.nextBlockTypes[this.nextBlockTypes.length - 1];
	}

	getBlockDef(type: BlockType): BlockDef {
		return this.gameBlockDefs[type]!;
	}

	getBlockRotations(type: BlockType): BlockRotations {
		return this.gameBlockRotations[type]!;
	}

	@action lockGamePrefs() {
		this.gameBlockDefs = [ ...this.prefs.blockDefs ];
		this.boardStore.lockSize(this.prefs.width, this.prefs.height);
	}

	@action resetGameLeavingBoard(): void {
		window.clearTimeout(this.downTimeout);
		this.downTimeout = undefined;
		this.inputStore.reset();
		this.pauseTimer = false;
		this.pauseInput = false;
		this.positionedBlock = null;
		this.undoStack = [];
		this.nextBlockTypes = [];
		this.lastMoveAboveBlockedSpace = null;
		this.unpausedStart = 0;
	}

	@action resetGameCompletely() {
		this.resetGameLeavingBoard();
		this.boardStore.reset();
		this.score = 0;
		this.rows = 0;
		this.totalTime = 0;
	}

	@action newGame(): void {
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

	@action fillRowsWithJunk() {
		if (this.prefs.rowsJunk === 0) return;
		for (let y = this.boardStore.height - 1; y >= this.boardStore.height - this.prefs.rowsJunk; y--) {
			for (let x = 0; x < this.boardStore.width; x++) {
				if (Math.floor(Math.random() * junkOdds) === 0) {
					const type = this.getRandomBlockType();
					this.boardStore.fillPoint(x, y, {
						id: this.getBlockDef(type).id
					});
				}
			}
		}
	}

	@action endGame(): void {
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
				if (this.gameState === GameState.Active) return;
				this.highScoresStore.dialogShow();
			}, 500);
		}
	}

	updateDownTimer(): void {
		if (this.gameState !== GameState.Active || this.pauseTimer) {
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

	setPauseTimer(pauseTimer: boolean): void {
		this.pauseTimer = pauseTimer;
		this.updateDownTimer();
	}

	setPauseInput(pauseInput: boolean): void {
		this.pauseInput = pauseInput;
		if (!pauseInput) {
			this.inputStore.handleQueuedAction();
		}
	}

	canHandleInput(): boolean {
		return !this.newGameStore.visible && !this.preferencesStore.visible && !this.highScoresStore.visible;
	}

	@action pause(): void {
		if (this.gameState !== GameState.Active) return;
		this.gameState = GameState.Paused;
		const unpausedTime = (new Date()).getTime() - this.unpausedStart;
		this.totalTime += unpausedTime;
		this.updateDownTimer();
	}

	@action resume(): void {
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
			&& block.x + def.size <= this.boardStore.width
			&& block.y + def.size <= this.boardStore.height;
	}

	inBounds(block: PositionedBlock): boolean {
		const extent = this.getBlockRotations(block.type)[block.rotation].extent;
		return block.x + extent[0] >= 0
			// && block.y - extent[1] >= 0
			&& block.x + extent[2] < this.boardStore.width
			&& block.y + extent[3] < this.boardStore.height;
	}

	positionFree(block: PositionedBlock): boolean {
		return this.boardStore.pointsFree(this.getPoints(block));
	}

	markPositionFilled(block: PositionedBlock): void {
		this.boardStore.markPointsFilled(this.getPoints(block), {
			id: this.getBlockDef(block.type).id
		});
	}

	markPositionUnfilled(block: PositionedBlock): void {
		this.boardStore.markPointsFilled(this.getPoints(block), null);
	}

	@action newBlock(): void {
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
		const x = Math.ceil((this.boardStore.width - blockWidth) / 2);
		const y = -extent[1];
		const nextBlock = { x, y, type, rotation };
		if (this.positionFree(nextBlock)) {
			this.positionedBlock = nextBlock;
		} else {
			this.markPositionFilled(this.moveUpUntilFree(nextBlock));
			this.endGame();
		}
	}

	moveUpUntilFree(block: PositionedBlock): PositionedBlock {
		do {
			block = { 
				...block,
				y: block.y - 1
			};
		} while (!this.positionFree(block));
		return block;
	}

	getClearedRows(): number[] {
		const rows: number[] = [];
		if (!this.positionedBlock) return rows;
		for (let checkOffset = 0; checkOffset < this.getBlockDef(this.positionedBlock.type).size; checkOffset++) {
			const y = this.positionedBlock.y + checkOffset;
			if (this.boardStore.isRowFilled(y)) {
				rows.push(y);
			}
		}
		return rows;
	}

	async displayClearedRows(rows: number[]): Promise<void> {
		if (rows.length === 0) return;
		this.setPauseTimer(true);
		this.setPauseInput(true);
		for (let row = 0; row < rows.length; row++) {
			this.boardStore.fillRow(rows[row], null);
		}
		await delay(100);
		this.setPauseTimer(false);
		this.setPauseInput(false);
	}

	@action async freezeBlock(scorePoints: number = 0): Promise<void> {
		if (!this.positionedBlock) return;
		this.markPositionFilled(this.positionedBlock);
		const clearedRows = this.getClearedRows();
		this.positionedBlock = null;
		this.scoreDrop(scorePoints);
		this.scoreClearedRows(clearedRows.length);
		await this.displayClearedRows(clearedRows);
		runInAction(() => {
			this.boardStore.clearRows(clearedRows);
			this.newBlock();
		});
	}

	@action scoreDrop(scorePoints: number): void {
		this.score += scorePoints;
	}

	@action scoreClearedRows(rows: number): void {
		if (rows === 0) return;
		this.score += getClearRowsScore(rows, this.level);
		// score based on level before adding rows
		this.rows += rows;
		this.undoStack = [];
		this.stopDownTimer();
		this.startDownTimer();
	}

	@computed get level(): number {
		return Math.max(this.startLevel, getLevel(this.rows));
	}

	checkAboveBlockedSpace(): void {
		if (!this.positionedBlock) return;
		const movedBlock: PositionedBlock = {
			...this.positionedBlock,
			y: this.positionedBlock.y + 1
		}
		if (!this.inBounds(movedBlock) || !this.positionFree(movedBlock)) {
			this.lastMoveAboveBlockedSpace = new Date();
		}
	}

	recentlyAboveBlockedSpace(): boolean {
		if (!this.prefs.delayFinalDrop) return false;
		return this.lastMoveAboveBlockedSpace !== null && this.lastMoveAboveBlockedSpace.getTime() + downTimerPauseWhenMovingMS >= (new Date()).getTime();
	}

	@action rotateCW(): void {
		if (this.gameState !== GameState.Active || !this.positionedBlock || !this.canRotate(this.positionedBlock)) return;
		const numRotations = this.getBlockRotations(this.positionedBlock.type).length;
		const nextRotation = this.positionedBlock.rotation + 1 >= numRotations ? 0 : this.positionedBlock.rotation + 1;
		const movedBlock: PositionedBlock = {
			...this.positionedBlock,
			rotation: nextRotation
		}
		if (this.positionFree(movedBlock)) {
			this.checkAboveBlockedSpace();
			this.positionedBlock = movedBlock;
		}
	}

	@action rotateCCW(): void {
		if (this.gameState !== GameState.Active || !this.positionedBlock || !this.canRotate(this.positionedBlock)) return;
		const numRotations = this.getBlockRotations(this.positionedBlock.type).length;
		const nextRotation = this.positionedBlock.rotation - 1 < 0 ? numRotations - 1 : this.positionedBlock.rotation - 1;
		const movedBlock: PositionedBlock = {
			...this.positionedBlock,
			rotation: nextRotation
		}
		if (this.positionFree(movedBlock)) {
			this.checkAboveBlockedSpace();
			this.positionedBlock = movedBlock;
		}
	}

	@action left(): boolean {
		if (this.gameState !== GameState.Active || !this.positionedBlock) return false;
		const movedBlock: PositionedBlock = {
			...this.positionedBlock,
			x: this.positionedBlock.x - 1
		}
		if (this.inBounds(movedBlock) && this.positionFree(movedBlock)) {
			this.checkAboveBlockedSpace();
			this.positionedBlock = movedBlock;
			return true;
		}
		return false;
	}

	@action right(): boolean {
		if (this.gameState !== GameState.Active || !this.positionedBlock) return false;
		const movedBlock: PositionedBlock = {
			...this.positionedBlock,
			x: this.positionedBlock.x + 1
		}
		if (this.inBounds(movedBlock) && this.positionFree(movedBlock)) {
			this.checkAboveBlockedSpace();
			this.positionedBlock = movedBlock;
			return true;
		}
		return false;
	}

	async leftAccel(): Promise<void> {
		this.setPauseInput(true);
		let done = false;
		while (!done) {
			done = !this.left();
			await delay(animDelayMS);
		}
		this.setPauseInput(false);
	}

	async rightAccel(): Promise<void> {
		this.setPauseInput(true);
		let done = false;
		while (!done) {
			done = !this.right();
			await delay(animDelayMS);
		}
		this.setPauseInput(false);
	}

	@action async down(fromTimer: boolean = false): Promise<void> {
		if (this.gameState !== GameState.Active || !this.positionedBlock) return;
		const movedBlock: PositionedBlock = {
			...this.positionedBlock,
			y: this.positionedBlock.y + 1
		}
		if (fromTimer && this.recentlyAboveBlockedSpace()) {
			return;
		}
		if (this.inBounds(movedBlock) && this.positionFree(movedBlock)) {
			this.positionedBlock = movedBlock;
		} else {
			this.undoStack = []; 
			await this.freezeBlock();
		}
	}

	@action async drop(): Promise<void> {
		if (this.gameState !== GameState.Active || !this.positionedBlock) return;
		let done = false;
		const nextDrop = () => {
			if (!this.positionedBlock) return;
			const movedBlock: PositionedBlock = {
				...this.positionedBlock,
				y: this.positionedBlock.y + 1
			}
			if (this.inBounds(movedBlock) && this.positionFree(movedBlock)) {
				this.positionedBlock = movedBlock;
			} else {
				done = true;
			}
		};

		const extent = this.getBlockRotations(this.positionedBlock.type)[this.positionedBlock.rotation].extent;
		const scorePoints = this.boardStore.height - (this.positionedBlock.y + extent[3]) - 1;

		this.setPauseTimer(true);
		this.setPauseInput(true);
		while (!done) {
			runInAction(nextDrop);
			await delay(animDelayMS);
		}

		if (this.prefs.allowUndo) {
			this.undoStack.push({
				block: this.positionedBlock,
				score: this.score
			});
		}
		await this.freezeBlock(scorePoints);
		this.setPauseTimer(false);
		this.setPauseInput(false);
	}

	@action async undo(): Promise<void> {
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
			const movedBlock: PositionedBlock = {
				...unfrozenBlock,
				y
			};
			this.positionedBlock = movedBlock;
			if (y <= lastY) {
				done = true;
			} else {
				y--;
			}
		};

		this.setPauseTimer(true);
		this.setPauseInput(true);
		while (!done) {
			runInAction(nextLift);
			await delay(animDelayMS);
		}
		this.setPauseTimer(false);
		this.setPauseInput(false);
	}

	async handleAction(action: Actions) {
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

	getNextBlockInfo(): { points: Array<PositionedPoint>, width: number, height: number } {
		if (this.nextBlockType === null) return { points: [], width: 0, height: 0 };
		const rotation = this.getBlockRotations(this.nextBlockType)[0];
		const top = rotation.extent[1];
		const id = this.getBlockDef(this.nextBlockType).id;
		const left = rotation.extent[0];
		const width = rotation.extent[2] - left + 1;
		const height = rotation.extent[3] - rotation.extent[1] + 1;
		const points = rotation.points.map(point => ({
			x: point[0] - left,
			y: point[1] - top,
			id: id
		}));
		return { points, width, height }
	}
}

export { MainStore };

export const StoreContext = createContext<MainStore>({} as MainStore);
export const useStore = (): MainStore => useContext(StoreContext);
