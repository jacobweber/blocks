import { decorate, observable, computed, action, runInAction } from 'mobx';
import { createContext, useContext } from 'react';
import { PreferencesStore } from './PreferencesStore';
import { GameState, KeyActions } from '../utils/types';
import { getKeyStr } from '../utils/helpers';

const numClearRowsBonus = 4;

type PointXY = [number, number];
type ExtentLTRB = [ number, number, number, number ];
type Rotation = { points: Array<PointXY>, extent: ExtentLTRB };

export interface BlockDef {
	desc: string;
	color: string;
	size: number;
	rotations: Array<Rotation>; // index is rotation number
}

const line: BlockDef = {
	desc: 'line',
	color: 'greenyellow',
	size: 4,
	rotations: [
		{ points: [[0,1], [1,1], [2,1], [3,1]], extent: [0,1,3,1] },
		{ points: [[2,0], [2,1], [2,2], [2,3]], extent: [2,0,2,3] }
	]
};
const square: BlockDef = {
	desc: 'square',
	color: 'lightcoral',
	size: 2,
	rotations: [
		{ points: [[0,0], [1,0], [0,1], [1,1]], extent: [0,0,1,1] }
	]
};
const are: BlockDef = {
	desc: 'are',
	color: 'khaki',
	size: 3,
	rotations: [
		{ points: [[0,1], [1,1], [2,1], [2,2]], extent: [0,1,2,2] },
		{ points: [[1,0], [1,1], [0,2], [1,2]], extent: [0,0,1,2] },
		{ points: [[0,0], [0,1], [1,1], [2,1]], extent: [0,0,2,1] },
		{ points: [[1,0], [2,0], [1,1], [1,2]], extent: [1,0,2,2] }
	]
};
const ell: BlockDef = {
	desc: 'ell',
	color: 'burlywood',
	size: 3,
	rotations: [
		{ points: [[0,1], [1,1], [2,1], [0,2]], extent: [0,1,2,2] },
		{ points: [[0,0], [1,0], [1,1], [1,2]], extent: [0,0,1,2] },
		{ points: [[2,0], [0,1], [1,1], [2,1]], extent: [0,0,2,1] },
		{ points: [[1,0], [1,1], [1,2], [2,2]], extent: [1,0,2,2] }
	]
};
const ess: BlockDef = {
	desc: 'ess',
	color: 'cornflowerblue',
	size: 3,
	rotations: [
		{ points: [[1,1], [2,1], [0,2], [1,2]], extent: [0,1,2,2] },
		{ points: [[1,0], [1,1], [2,1], [2,2]], extent: [1,0,2,2] }
	]
};
const zee: BlockDef = {
	desc: 'zee',
	color: 'lightpink',
	size: 3,
	rotations: [
		{ points: [[0,1], [1,1], [1,2], [2,2]], extent: [0,1,2,2] },
		{ points: [[2,0], [1,1], [2,1], [1,2]], extent: [1,0,2,2] }
	]
};
const tee: BlockDef = {
	desc: 'tee',
	color: 'aquamarine',
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

export interface FilledPoint {
	color: string;
}

class MainStore {
	preferencesStore: PreferencesStore = new PreferencesStore();

	width: number = 10;
	height: number = 20;
	windowHeight: number = 0;

	positionedBlock: PositionedBlock | null = null;
	filledPoints: Array<Array<FilledPoint | null>> = []; // [y][x]
	frozenBlocks: Array<PositionedBlock> = [];
	nextBlockTypes: Array<BlockType> = [];

	heldKey: {
		key: string,
		action: KeyActions,
		id: number
	} | null = null

	gameState: GameState = GameState.Stopped;
	actionInProgress = false;
	downDelayMS = 750;
	downTimeout: number | undefined = undefined;
	lastMoveAboveBlockedSpace: Date | null = null;

	constructor() {
		this.preferencesStore.load();
		this.resetGame();
	}

	initWindowEvents() {
		this.updateWindowHeight();
		window.addEventListener('keydown', e => this.keyDown(e));
		window.addEventListener('keyup', e => this.keyUp(e));
		window.addEventListener('resize', e => this.updateWindowHeight());
	}

	get prefs() {
		return this.preferencesStore.prefs;
	}

	updateWindowHeight() {
		this.windowHeight = window.innerHeight;
	}

	get pointSize() {
		return Math.max(Math.floor((this.windowHeight - 50) / this.height), 10);
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
		this.gameState = GameState.Stopped;
		this.actionInProgress = false;
		this.filledPoints = Array.from({ length: this.height }, () => Array.from({ length: this.width }));
		this.positionedBlock = null;
		this.frozenBlocks = [];
		this.nextBlockTypes = [];
		this.lastMoveAboveBlockedSpace = null;
		this.stopDownTimer();
	}

	newGame(): void {
		this.resetGame();
		this.gameState = GameState.Active;
		this.startDownTimer();
		this.newBlock();
	}

	endGame(): void {
		this.resetGame();
	}

	stopDownTimer(): void {
		window.clearTimeout(this.downTimeout);
	}

	startDownTimer(): void {
		if (this.gameState !== GameState.Active || this.downDelayMS === 0) return;
		this.downTimeout = window.setTimeout(() => {
			this.down(true);
			this.startDownTimer();
		}, this.downDelayMS);
	}

	pause(): void {
		if (this.gameState !== GameState.Active) return;
		this.gameState = GameState.Paused;
		this.stopDownTimer();
	}

	resume(): void {
		if (this.gameState !== GameState.Paused) return;
		this.gameState = GameState.Active;
		this.startDownTimer();
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
					color: this.getBlockDef(block.type).color
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
		if (this.actionInProgress) return;
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

	async clearRowsBonus(rows: number[]): Promise<void> {
		if (rows.length === 0) return;
		this.frozenBlocks = [];
		const hasBonus = rows.length === numClearRowsBonus;
		const numFlashes = hasBonus ? 1 : 1;
		let count = 0;
		const flash = action(() => {
			const color = count % 2 === 0 ? 'black' : 'gray';
			for (let row = 0; row < rows.length; row++) {
				this.filledPoints[rows[row]] = Array.from({ length: this.width }, () => ({
					color: color
				}));
			}
			count++;
		});

		this.stopDownTimer();
		flash();
		for (var i = 0; i < numFlashes; i++) {
			await this.delay(100);
			flash();
		}
		this.startDownTimer();
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

	async freezeBlock(): Promise<void> {
		if (!this.positionedBlock) return;
		this.actionInProgress = true;
		if (this.prefs.allowUndo) {
			this.frozenBlocks.push(this.positionedBlock);
		}
		this.markPositionFilled(this.positionedBlock);
		const clearedRows = this.getClearedRows();
		this.positionedBlock = null;
		await this.clearRowsBonus(clearedRows);
		this.actionInProgress = false;
		runInAction(() => {
			this.clearRows(clearedRows);
			this.newBlock();
		});
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
		if (this.gameState !== GameState.Active || this.actionInProgress || !this.positionedBlock || !this.canRotate(this.positionedBlock)) return;
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
		if (this.gameState !== GameState.Active || this.actionInProgress || !this.positionedBlock || !this.canRotate(this.positionedBlock)) return;
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
		if (this.gameState !== GameState.Active || this.actionInProgress || !this.positionedBlock) return false;
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
		if (this.gameState !== GameState.Active || this.actionInProgress || !this.positionedBlock) return false;
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

	async down(fromTimer: boolean = false): Promise<void> {
		if (this.gameState !== GameState.Active || this.actionInProgress || !this.positionedBlock) return;
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
		if (this.gameState !== GameState.Active || this.actionInProgress || !this.positionedBlock) return;
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

		this.actionInProgress = true;
		this.stopDownTimer();
		while (!done) {
			runInAction(nextDrop);
			await this.delay(5);
		}
		this.startDownTimer();
		await this.freezeBlock();
		this.actionInProgress = false;
	}

	async undo(): Promise<void> {
		if (this.gameState !== GameState.Active || this.actionInProgress || !this.prefs.allowUndo || this.frozenBlocks.length === 0) return;
		if (this.positionedBlock) {
			this.nextBlockTypes = [ ...this.nextBlockTypes, this.positionedBlock.type ];
		}
		const unfrozenBlock = this.frozenBlocks.pop();
		if (!unfrozenBlock) return;
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

		this.actionInProgress = true;
		this.stopDownTimer();
		while (!done) {
			runInAction(nextLift);
			await this.delay(5);
		}
		this.startDownTimer();
		this.actionInProgress = false;
	}

	delay(ms: number): Promise<void> {
		return new Promise(function (resolve, reject) {
			setTimeout(resolve, ms);
		});
	}

	async startTrackingKey(key: string, action: KeyActions): Promise<void> {
		const id = Math.floor(Math.random() * 100000);
		this.heldKey = { key, action, id };

		let done = false;
		let delay = this.prefs.leftRightAccelAfterMS;
		while (!done) {
			await this.delay(delay);
			// if we stopped, or started the same action a second time before finishing, interrupt the first one
			if (this.heldKey === null || this.heldKey.id !== id) {
				return;
			}
			if (action === KeyActions.Left) {
				done = !this.left();
			} else {
				done = !this.right();
			}
			delay = 10;
		}
		this.stopTrackingKey();
	}

	stopTrackingKey(): void {
		this.heldKey = null;
	}

	keyDown(e: KeyboardEvent) {
		const keyStr = getKeyStr(e);

		if (keyStr === 'Meta+ArrowLeft' || keyStr === 'Meta+ArrowRight' || keyStr === 'Meta+[' || keyStr === 'Meta+]') {
			e.preventDefault();
			return;
		}

		const action = this.preferencesStore.keyMap[keyStr];
		if (action === undefined) return;

		// The Mac won't send a keyup for a standard key while the command key is held down.
		// So if your left or right key includes command, we won't try to track how long it's held down.
		const canHoldKey = (action === KeyActions.Left || action === KeyActions.Right)
			&& this.prefs.leftRightAccelAfterMS !== 0 && !e.metaKey;

		if (canHoldKey) {
			if (this.heldKey) {
				if (this.heldKey.action === action) {
					// don't start tracking repeated key
				} else {
					this.stopTrackingKey();
					this.startTrackingKey(e.key, action);
				}
			} else {
				this.startTrackingKey(e.key, action);
			}
		} else {
			if (this.heldKey) {
				this.stopTrackingKey();
			}
		}

		switch (action) {
			case KeyActions.NewGame: this.newGame(); break;
			case KeyActions.EndGame: this.endGame(); break;
			case KeyActions.PauseResumeGame: this.pauseResume(); break;
			case KeyActions.Undo: this.undo(); break;
			case KeyActions.Left: this.left(); break;
			case KeyActions.Right: this.right(); break;
			case KeyActions.Down: this.down(); break;
			case KeyActions.Drop: this.drop(); break;
			case KeyActions.RotateCCW: this.rotateCCW(); break;
			case KeyActions.RotateCW: this.rotateCW(); break;
		}
		e.preventDefault();
	}

	keyUp(e: KeyboardEvent) {
		if (this.heldKey !== null && this.heldKey.key === e.key) {
			this.stopTrackingKey();
		}
	}
}

decorate(MainStore, {
	width: observable,
	height: observable,
	windowHeight: observable,
	gameState: observable,
	pointSize: computed,
	positionedBlock: observable.ref,
	prefs: computed,
	nextBlockDef: computed,
	nextBlockTypes: observable.ref,
	filledPoints: observable,
	updateWindowHeight: action,
	newGame: action,
	endGame: action,
	pause: action,
	resume: action,
	randomize: action,
	newBlock: action,
	freezeBlock: action,
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
