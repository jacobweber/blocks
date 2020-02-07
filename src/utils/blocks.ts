export type PointXY = [number, number];
export type ExtentLTRB = [ number, number, number, number ];
export type Rotation = { points: Array<PointXY>, extent: ExtentLTRB };
export type BlockRotations = Array<Rotation>; // 0, 90, 180, 270

export interface BlockDef {
	id: PointSymbolID;
	color: string;
	odds: number;
	size: number;
	rotate90: boolean;
	rotate180: boolean;
	rotate270: boolean;
	points: Array<PointXY>;
}

export interface BlockColor {
	id: PointSymbolID;
	color: string;
}

export type PointSymbolID = string;

export const defaultEdit: BlockDef = {
	id: 'sample',
	color: '#AA0000',
	odds: 10,
	size: 3,
	points: [],
	rotate90: true,
	rotate180: true,
	rotate270: true
};

const line: BlockDef = {
	id: 'line',
	color: '#ADFF2F',
	odds: 10,
	size: 4,
	points: [[0, 1], [1, 1], [2, 1], [3, 1]],
	rotate90: true,
	rotate180: false,
	rotate270: false
};
const square: BlockDef = {
	id: 'square',
	color: '#F08080',
	odds: 10,
	size: 2,
	points: [[0, 0], [0,1], [1, 0], [1, 1]],
	rotate90: false,
	rotate180: false,
	rotate270: false
};
const are: BlockDef = {
	id: 'are',
	color: '#F0E68C',
	odds: 10,
	size: 3,
	points: [[0, 1], [1, 1], [2, 1], [2, 2]],
	rotate90: true,
	rotate180: true,
	rotate270: true
};
const ell: BlockDef = {
	id: 'ell',
	color: '#DEB887',
	odds: 10,
	size: 3,
	points: [[0, 1], [0,2], [1, 1], [2, 1]],
	rotate90: true,
	rotate180: true,
	rotate270: true
};
const ess: BlockDef = {
	id: 'ess',
	color: '#6495ED',
	odds: 10,
	size: 3,
	points: [[0, 2], [1, 1], [1, 2], [2, 1]],
	rotate90: false,
	rotate180: false,
	rotate270: true
};
const zee: BlockDef = {
	id: 'zee',
	color: '#FFB6C1',
	odds: 10,
	size: 3,
	points: [[0, 1], [1, 1], [1, 2], [2, 2]],
	rotate90: false,
	rotate180: false,
	rotate270: true
};
const tee: BlockDef = {
	id: 'tee',
	color: '#7FFFD4',
	odds: 10,
	size: 3,
	points: [[0, 1], [1, 1], [1, 2], [2, 1]],
	rotate90: true,
	rotate180: true,
	rotate270: true
};

export type BlockType = number;

export const defaultBlockDefs: Array<BlockDef> = [
	line,
	square,
	are,
	ell,
	ess,
	zee,
	tee
];

export function calculateBlockWeights(blockDefs: Array<BlockDef>): Array<BlockType> {
	const weightedBlockTypes: Array<BlockType> = [];
	blockDefs.forEach((def, index) => {
		weightedBlockTypes.push( ...Array.from({ length: def.odds }, () => index) );
	});
	return weightedBlockTypes;
};

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

export function calculateBlockExtent(points: Array<PointXY>): ExtentLTRB {
	return points.reduce<ExtentLTRB>(getExtentReducer, [ 0, 0, 0, 0 ])
}

export function calculateBlockRotations(def: BlockDef): BlockRotations {
	const rotations: BlockRotations = [];
	const points0 = [ ...def.points ];
	rotations.push({
		points: def.points,
		extent: calculateBlockExtent(def.points)
	});

	const points90: Array<PointXY> = points0.map(([ x, y ]) => {
		return [def.size - 1 - y, x];
	});
	if (def.rotate90) {
		rotations.push({
			points: points90,
			extent: calculateBlockExtent(points90)
		});
	}

	const points180: Array<PointXY> = points90.map(([ x, y ]) => {
		return [def.size - 1 - y, x];
	});
	if (def.rotate180) {
		rotations.push({
			points: points180,
			extent: calculateBlockExtent(points180)
		});
	}

	const points270: Array<PointXY> = points180.map(([ x, y ]) => {
		return [def.size - 1 - y, x];
	});
	if (def.rotate270) {
		rotations.push({
			points: points270,
			extent: calculateBlockExtent(points270)
		});
	}

	return rotations;
}

export type PointBitmap = Array<Array<boolean>>;

export function pointsXYToBitmap(points: Array<PointXY>): PointBitmap {
	const result = Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => false));
	points.forEach(point => {
		result[point[0]][point[1]] = true;
	});
	return result;
}

export function pointBitmapToXY(bitmap: PointBitmap): Array<PointXY> {
	const result: Array<PointXY> = [];
	for (let x = 0; x < bitmap.length; x++) {
		for (let y = 0; y < bitmap[x].length; y++) {
			if (bitmap[x][y]) {
				result.push([x, y]);
			}
		}
	}
	return result;
}
