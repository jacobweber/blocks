export type PointXY = [number, number];
export type ExtentLTRB = [ number, number, number, number ];
export type Rotation = { points: Array<PointXY>, extent: ExtentLTRB };

export interface BlockDef {
	id: PointSymbolID;
	size: number;
	rotations: Array<Rotation>; // index is rotation number
}

export enum PointSymbolID {
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
	id: PointSymbolID.Line,
	size: 4,
	rotations: [
		{ points: [[0,1], [1,1], [2,1], [3,1]], extent: [0,1,3,1] },
		{ points: [[2,0], [2,1], [2,2], [2,3]], extent: [2,0,2,3] }
	]
};
const square: BlockDef = {
	id: PointSymbolID.Square,
	size: 2,
	rotations: [
		{ points: [[0,0], [1,0], [0,1], [1,1]], extent: [0,0,1,1] }
	]
};
const are: BlockDef = {
	id: PointSymbolID.Are,
	size: 3,
	rotations: [
		{ points: [[0,1], [1,1], [2,1], [2,2]], extent: [0,1,2,2] },
		{ points: [[1,0], [1,1], [0,2], [1,2]], extent: [0,0,1,2] },
		{ points: [[0,0], [0,1], [1,1], [2,1]], extent: [0,0,2,1] },
		{ points: [[1,0], [2,0], [1,1], [1,2]], extent: [1,0,2,2] }
	]
};
const ell: BlockDef = {
	id: PointSymbolID.Ell,
	size: 3,
	rotations: [
		{ points: [[0,1], [1,1], [2,1], [0,2]], extent: [0,1,2,2] },
		{ points: [[0,0], [1,0], [1,1], [1,2]], extent: [0,0,1,2] },
		{ points: [[2,0], [0,1], [1,1], [2,1]], extent: [0,0,2,1] },
		{ points: [[1,0], [1,1], [1,2], [2,2]], extent: [1,0,2,2] }
	]
};
const ess: BlockDef = {
	id: PointSymbolID.Ess,
	size: 3,
	rotations: [
		{ points: [[1,1], [2,1], [0,2], [1,2]], extent: [0,1,2,2] },
		{ points: [[1,0], [1,1], [2,1], [2,2]], extent: [1,0,2,2] }
	]
};
const zee: BlockDef = {
	id: PointSymbolID.Zee,
	size: 3,
	rotations: [
		{ points: [[0,1], [1,1], [1,2], [2,2]], extent: [0,1,2,2] },
		{ points: [[2,0], [1,1], [2,1], [1,2]], extent: [1,0,2,2] }
	]
};
const tee: BlockDef = {
	id: PointSymbolID.Tee,
	size: 3,
	rotations: [
		{ points: [[0,1], [1,1], [2,1], [1,2]], extent: [0,1,2,2] },
		{ points: [[1,0], [0,1], [1,1], [1,2]], extent: [0,0,1,2] },
		{ points: [[1,0], [0,1], [1,1], [2,1]], extent: [0,0,2,1] },
		{ points: [[1,0], [1,1], [2,1], [1,2]], extent: [1,0,2,2] }
	]
};

export enum BlockType { Line, Square, Are, Ell, Ess, Zee, Tee }

export const blockDefs = new Map<BlockType, BlockDef>([
	[BlockType.Line, line],
	[BlockType.Square, square],
	[BlockType.Are, are],
	[BlockType.Ell, ell],
	[BlockType.Ess, ess],
	[BlockType.Zee, zee],
	[BlockType.Tee, tee]
]);
