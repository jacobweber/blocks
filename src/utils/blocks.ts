export type PointXY = [number, number];
export type ExtentLTRB = [ number, number, number, number ];
export type Rotation = { points: Array<PointXY>, extent: ExtentLTRB };

export interface BlockDef {
	id: PointSymbolID;
	color: string;
	odds: number;
	size: number;
	canRotate: [ boolean, boolean, boolean ]; // 90, 180, 270
	points: Array<PointXY>;
	rotations: Array<Rotation>; // 0, 90, 180, 270
}

export type PointSymbolID = string;

const line: BlockDef = {
	id: 'line',
	color: '#ADFF2F',
	odds: 1,
	size: 4,
	points: [[0, 1], [1, 1], [2, 1], [3, 1]],
	canRotate: [ true, false, false ],
	rotations: []
};
const square: BlockDef = {
	id: 'square',
	color: '#F08080',
	odds: 1,
	size: 2,
	points: [[0, 0], [0,1], [1, 0], [1, 1]],
	canRotate: [ false, false, false ],
	rotations: []
};
const are: BlockDef = {
	id: 'are',
	color: '#F0E68C',
	odds: 1,
	size: 3,
	points: [[0, 1], [1, 1], [2, 1], [2, 2]],
	canRotate: [ true, true, true ],
	rotations: []
};
const ell: BlockDef = {
	id: 'ell',
	color: '#DEB887',
	odds: 1,
	size: 3,
	points: [[0, 1], [0,2], [1, 1], [2, 1]],
	canRotate: [ true, true, true ],
	rotations: []
};
const ess: BlockDef = {
	id: 'ess',
	color: '#6495ED',
	odds: 1,
	size: 3,
	points: [[0, 2], [1, 1], [1, 2], [2, 1]],
	canRotate: [ false, false, true ],
	rotations: []
};
const zee: BlockDef = {
	id: 'zee',
	color: '#FFB6C1',
	odds: 1,
	size: 3,
	points: [[0, 1], [1, 1], [1, 2], [2, 2]],
	canRotate: [ false, false, true ],
	rotations: []
};
const tee: BlockDef = {
	id: 'tee',
	color: '#7FFFD4',
	odds: 1,
	size: 3,
	points: [[0, 1], [1, 1], [1, 2], [2, 1]],
	canRotate: [ true, true, true ],
	rotations: []
};

export type BlockType = number;

export const blockDefs: Array<BlockDef> = [
	line,
	square,
	are,
	ell,
	ess,
	zee,
	tee
];

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

let weightedBlockTypes: Array<BlockType> = [];

export function calculateBlockWeights(): void {
	weightedBlockTypes = [];
	blockDefs.forEach((def, index) => {
		weightedBlockTypes.push( ...Array.from({ length: def.odds }, () => index) );
	});
};

export function getRandomBlockType(): BlockType {
	const index = Math.floor(Math.random() * weightedBlockTypes.length);
	return weightedBlockTypes[index];
}

export function calculateBlockRotations() {
	blockDefs.forEach((def: BlockDef) => {
		def.rotations = [];
		const points0 = [ ...def.points ];
		def.rotations.push({
			points: def.points,
			extent: def.points.reduce<ExtentLTRB>(getExtentReducer, [ 0, 0, 0, 0 ])
		});

		const points90: Array<PointXY> = points0.map(([ x, y ]) => {
			return [def.size - 1 - y, x];
		});
		if (def.canRotate[0]) {
			def.rotations.push({
				points: points90,
				extent: points90.reduce<ExtentLTRB>(getExtentReducer, [ 0, 0, 0, 0 ])
			});
		}

		const points180: Array<PointXY> = points90.map(([ x, y ]) => {
			return [def.size - 1 - y, x];
		});
		if (def.canRotate[1]) {
			def.rotations.push({
				points: points180,
				extent: points180.reduce<ExtentLTRB>(getExtentReducer, [ 0, 0, 0, 0 ])
			});
		}

		const points270: Array<PointXY> = points180.map(([ x, y ]) => {
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
