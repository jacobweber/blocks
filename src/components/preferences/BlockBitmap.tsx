import React from 'react';
import { observer } from "mobx-react-lite"

import styles from 'components/preferences/BlockBitmap.module.css';
import { Point } from 'components/Point';
import { svgPointSize } from 'utils/helpers';
import { PointSymbolID } from 'utils/blocks';
import { PointBitmap } from 'stores/BlockEditStore';

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
		xLines.push(<line key={i} stroke='black' strokeWidth='1' x1='0' y1={svgPointSize * i} x2='100%' y2={svgPointSize * i} />);
	}
	const yLines = [];
	for (let i = 0; i < size; i++) {
		yLines.push(<line key={i} stroke='black' strokeWidth='1' x1={svgPointSize * i} y1='0' x2={svgPointSize * i} y2='100%' />);
	}

	const blankComps = [];
	const pointComps = [];
	for (let x = 0; x < size; x++) {
		for (let y = 0; y < size; y++) {
			if (points[x][y]) {
				pointComps.push(<Point onClick={e => onChangePoints(togglePoint(points, x, y))} key={x + '-' + y} x={x} y={y} id={prefix + id} />);
			} else {
				blankComps.push(<rect onClick={e => onChangePoints(togglePoint(points, x, y))} key={x + '-' + y} x={x * svgPointSize} y={y * svgPointSize} width={svgPointSize} height={svgPointSize} fill='white' stroke='none' />);
			}
		}
	}

	return (
		<div className={styles.root}>
			<svg
				version="1.1"
				baseProfile="full"
				width={30 * size}
				height={30 * size}
				viewBox={`0 0 ${svgPointSize * size} ${svgPointSize * size}`}
				xmlns="http://www.w3.org/2000/svg"
			>
				{blankComps}
				{xLines}
				{yLines}
				{pointComps}
				<rect width="100%" height="100%" stroke='black' strokeWidth='3' fillOpacity='0' style={{ pointerEvents: 'none' }} />
			</svg>
		</div>
	);
});

export { BlockBitmap };
