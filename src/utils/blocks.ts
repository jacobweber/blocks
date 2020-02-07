export type PointXY = [number, number];
export type ExtentLTRB = [ number, number, number, number ];
export type PointsXY = Array<PointXY>;
export type Rotation = { points: Array<PointXY>, extent: ExtentLTRB };

export interface BlockDef {
	id: PointSymbolID;
	size: number;
	canRotate: [ boolean, boolean, boolean ]; // 90, 180, 270
	points: PointsXY;
	rotations: Array<Rotation>; // 0, 90, 180, 270
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
	points: [[0, 1], [1, 1], [2, 1], [3, 1]],
	canRotate: [ true, false, false ],
	rotations: []
};
const square: BlockDef = {
	id: PointSymbolID.Square,
	size: 2,
	points: [[0, 0], [0,1], [1, 0], [1, 1]],
	canRotate: [ false, false, false ],
	rotations: []
};
const are: BlockDef = {
	id: PointSymbolID.Are,
	size: 3,
	points: [[0, 1], [1, 1], [2, 1], [2, 2]],
	canRotate: [ true, true, true ],
	rotations: []
};
const ell: BlockDef = {
	id: PointSymbolID.Ell,
	size: 3,
	points: [[0, 1], [0,2], [1, 1], [2, 1]],
	canRotate: [ true, true, true ],
	rotations: []
};
const ess: BlockDef = {
	id: PointSymbolID.Ess,
	size: 3,
	points: [[0, 2], [1, 1], [1, 2], [2, 1]],
	canRotate: [ false, false, true ],
	rotations: []
};
const zee: BlockDef = {
	id: PointSymbolID.Zee,
	size: 3,
	points: [[0, 1], [1, 1], [1, 2], [2, 2]],
	canRotate: [ false, false, true ],
	rotations: []
};
const tee: BlockDef = {
	id: PointSymbolID.Tee,
	size: 3,
	points: [[0, 1], [1, 1], [1, 2], [2, 1]],
	canRotate: [ true, true, true ],
	rotations: []
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

const getExtentReducer = (prev: ExtentLTRB, cur: PointXY, idx: number, arr: Array<PointXY>): ExtentLTRB => {
	if (idx === 0) {
		const l = cur[0];
		const r = cur[0];
		const t = cur[1];
		const b = cur[1];
		return [l, t, r, b];
	} else {
		const l = Math.min(cur[0], prev[0]);
		const r = Math.max(cur[0], prev[2]);
		const t = Math.min(cur[1], prev[1]);
		const b = Math.max(cur[1], prev[3]);
		return [l, t, r, b];
	}
};

export function calculateBlockRotations() {
	blockDefs.forEach((def: BlockDef) => {
		def.rotations = [];
		const points0 = [ ...def.points ];
		def.rotations.push({
			points: def.points,
			extent: def.points.reduce<ExtentLTRB>(getExtentReducer, [ 0, 0, 0, 0 ])
		});

		const points90: PointsXY = points0.map(([ x, y ]) => {
			return [def.size - 1 - y, x];
		});
		if (def.canRotate[0]) {
			def.rotations.push({
				points: points90,
				extent: points90.reduce<ExtentLTRB>(getExtentReducer, [ 0, 0, 0, 0 ])
			});
		}

		const points180: PointsXY = points90.map(([ x, y ]) => {
			return [def.size - 1 - y, x];
		});
		if (def.canRotate[1]) {
			def.rotations.push({
				points: points180,
				extent: points180.reduce<ExtentLTRB>(getExtentReducer, [ 0, 0, 0, 0 ])
			});
		}

		const points270: PointsXY = points180.map(([ x, y ]) => {
			return [def.size - 1 - y, x];
		});
		if (def.canRotate[2]) {
			def.rotations.push({
				points: points270,
				extent: points270.reduce<ExtentLTRB>(getExtentReducer, [ 0, 0, 0, 0 ])
			});
		}
	});
}
