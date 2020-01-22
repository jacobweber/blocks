import { decorate, observable, action, runInAction } from 'mobx';
import { createContext, useContext } from 'react';

const numClearRowsBonus = 4;

type PointXY = [number, number];
type ExtentLTRB = [ number, number, number, number ];
type Rotation = { points: Array<PointXY>, extent: ExtentLTRB };

enum KeyActions { Left, Right, Down, Drop, RotateCCW, RotateCW, Undo }
const keyMap: { [key: string]: KeyActions } = {
	'ArrowLeft': KeyActions.Left,
	'ArrowRight': KeyActions.Right,
	'ArrowDown': KeyActions.Drop,
	'ArrowUp': KeyActions.Down,
	'z': KeyActions.RotateCCW,
	'x': KeyActions.RotateCW,
	'z+Meta': KeyActions.Undo
};

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
	desc: 'el',
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
	desc: 'el',
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
	width: number = 10;
	height: number = 20;
	pointSize: number = 30;

	positionedBlock: PositionedBlock | null = null;
	filledPoints: Array<Array<FilledPoint | null>> = []; // [y][x]
	frozenBlocks: Array<PositionedBlock> = [];
	nextBlockTypes: Array<BlockType> = [];

	constructor() {
		this.clear();
	}

	getRandomBlockType(): BlockType {
		return Math.floor(Math.random() * blockDefs.size);
	}

	getBlockDef(type: BlockType): BlockDef {
		return blockDefs.get(type)!;
	}

	clear(): void {
		this.filledPoints = Array.from({ length: this.height }, () => Array.from({ length: this.width }));
		this.positionedBlock = null;
		this.frozenBlocks = [];
		this.nextBlockTypes = [];
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
		this.clear();
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
			type = this.nextBlockTypes.pop()!;
		} else {
			type = this.getRandomBlockType();
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
			this.clear();
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
		this.nextBlockTypes = [];
		const hasBonus = rows.length === numClearRowsBonus;
		const numFlashes = hasBonus ? 4 : 1;
		return new Promise((resolve, reject) => {
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
			flash();
			const interval = window.setInterval(action(() => {
				if (count === numFlashes) {
					window.clearInterval(interval);
					resolve();
				} else {
					flash();
				}
			}), 100);
		});
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
		this.frozenBlocks.push(this.positionedBlock);
		this.markPositionFilled(this.positionedBlock);
		const clearedRows = this.getClearedRows();
		this.positionedBlock = null;
		await this.clearRowsBonus(clearedRows);
		runInAction(() => {
			this.clearRows(clearedRows);
			this.newBlock();
		});
	}

	rotateCW(): void {
		if (!this.positionedBlock || !this.canRotate(this.positionedBlock)) return;
		const numRotations = this.getBlockDef(this.positionedBlock.type).rotations.length;
		const nextRotation = this.positionedBlock.rotation + 1 >= numRotations ? 0 : this.positionedBlock.rotation + 1;
		const nextBlock: PositionedBlock = {
			...this.positionedBlock,
			rotation: nextRotation
		}
		if (this.positionFree(nextBlock)) {
			this.positionedBlock.rotation = nextRotation
		}
	}

	rotateCCW(): void {
		if (!this.positionedBlock || !this.canRotate(this.positionedBlock)) return;
		const numRotations = this.getBlockDef(this.positionedBlock.type).rotations.length;
		const nextRotation = this.positionedBlock.rotation - 1 < 0 ? numRotations - 1 : this.positionedBlock.rotation - 1;
		const nextBlock: PositionedBlock = {
			...this.positionedBlock,
			rotation: nextRotation
		}
		if (this.positionFree(nextBlock)) {
			this.positionedBlock = nextBlock;
		}
	}

	left(): void {
		if (!this.positionedBlock) return;
		const nextBlock: PositionedBlock = {
			...this.positionedBlock,
			x: this.positionedBlock.x - 1
		}
		if (this.inBounds(nextBlock) && this.positionFree(nextBlock)) {
			this.positionedBlock = nextBlock;
		}
	}

	right(): void {
		if (!this.positionedBlock) return;
		const nextBlock: PositionedBlock = {
			...this.positionedBlock,
			x: this.positionedBlock.x + 1
		}
		if (this.inBounds(nextBlock) && this.positionFree(nextBlock)) {
			this.positionedBlock = nextBlock;
		}
	}

	async down(): Promise<void> {
		if (!this.positionedBlock) return;
		const nextBlock: PositionedBlock = {
			...this.positionedBlock,
			y: this.positionedBlock.y + 1
		}
		if (this.inBounds(nextBlock) && this.positionFree(nextBlock)) {
			this.positionedBlock = nextBlock;
		} else {
			await this.freezeBlock();
		}
	}

	async drop(): Promise<void> {
		if (!this.positionedBlock) return;
		let done = false;
		while (!done) {
			const nextBlock: PositionedBlock = {
				...this.positionedBlock,
				y: this.positionedBlock.y + 1
			}
			if (this.inBounds(nextBlock) && this.positionFree(nextBlock)) {
				this.positionedBlock = nextBlock;
			} else {
				done = true;
			}
		}
		await this.freezeBlock();
	}

	undo() {
		if (this.frozenBlocks.length === 0) return;
		if (this.positionedBlock) {
			this.nextBlockTypes.push(this.positionedBlock.type);
		}
		const unfrozenBlock = this.frozenBlocks.pop();
		if (!unfrozenBlock) return;
		this.markPositionUnfilled(unfrozenBlock);
		const nextBlock = {
			...unfrozenBlock,
			y: this.getBlockDef(unfrozenBlock.type).size === 2 ? 0 : -1
		};
		this.positionedBlock = nextBlock;
	}

	keyDown(e: React.KeyboardEvent) {
		const keyStr = e.key
			+ (e.shiftKey ? '+Shift' : '')
			+ (e.ctrlKey ? '+Ctrl' : '')
			+ (e.altKey ? '+Alt' : '')
			+ (e.metaKey ? '+Meta' : '');
		const action = keyMap[keyStr];
		switch (+action) {
			case KeyActions.Undo: this.undo(); break;
			case KeyActions.Left: this.left(); break;
			case KeyActions.Right: this.right(); break;
			case KeyActions.Down: this.down(); break;
			case KeyActions.Drop: this.drop(); break;
			case KeyActions.RotateCCW: this.rotateCCW(); break;
			case KeyActions.RotateCW: this.rotateCW(); break;
		}
	}

	keyUp(e: React.KeyboardEvent) {
	}
}

decorate(MainStore, {
	width: observable,
	height: observable,
	pointSize: observable,
	positionedBlock: observable,
	filledPoints: observable,
	clear: action,
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
