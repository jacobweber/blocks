import React from 'react';
import { observer } from "mobx-react-lite"

import styles from 'components/preferences/BlockBitmap.module.css';
import { Point } from 'components/Point';
import { pointSize } from 'utils/helpers';
import { PointSymbolID, PointBitmap } from 'utils/blocks';

type BlockBitmapProps = {
	prefix: string;
	size: number;
	id: PointSymbolID;
	points: PointBitmap;
	onChangePoints: (points: PointBitmap) => void;
};

const togglePoint = function(points: PointBitmap, x: number, y: number): PointBitmap {
	return [
		...points.slice(0, x),
		[
			...points[x].slice(0, y),
			!points[x][y],
			...points[x].slice(y + 1)
		],
		...points.slice(x + 1)
	];
};

const BlockBitmap = observer(({ prefix, id, size, points, onChangePoints }: BlockBitmapProps) => {
	const xLines = [];
	for (let i = 0; i < size; i++) {
		xLines.push(<line key={i} stroke='black' strokeWidth='1' x1='0' y1={pointSize * i} x2='100%' y2={pointSize * i} />);
	}
	const yLines = [];
	for (let i = 0; i < size; i++) {
		yLines.push(<line key={i} stroke='black' strokeWidth='1' x1={pointSize * i} y1='0' x2={pointSize * i} y2='100%' />);
	}

	const blankComps = [];
	const pointComps = [];
	for (let x = 0; x < size; x++) {
		for (let y = 0; y < size; y++) {
			if (points[x][y]) {
				pointComps.push(<Point onClick={e => onChangePoints(togglePoint(points, x, y))} key={x + '-' + y} x={x} y={y} id={prefix + id} />);
			} else {
				blankComps.push(<rect onClick={e => onChangePoints(togglePoint(points, x, y))} key={x + '-' + y} x={x * pointSize} y={y * pointSize} width={pointSize} height={pointSize} fill='white' stroke='none' />);
			}
		}
	}

	return (
		<div className={styles.root}>
			<svg
				version="1.1"
				baseProfile="full"
				viewBox={`0 0 ${pointSize * size} ${pointSize * size}`}
				xmlns="http://www.w3.org/2000/svg"
			>
				{blankComps}
				{xLines}
				{yLines}
				{pointComps}
			</svg>
		</div>
	);
});

export { BlockBitmap };
