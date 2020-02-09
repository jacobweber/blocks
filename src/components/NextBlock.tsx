import React from 'react';
import { observer } from "mobx-react-lite"

import styles from 'components/NextBlock.module.css';
import { useStore } from 'stores/MainStore';
import { Point } from 'components/Point';
import { svgPointSize } from 'utils/helpers';

const NextBlock = observer(() => {
	const mainStore = useStore();
	const { points, width } = mainStore.getNextBlockPoints();

	return (
		<div className={styles.root}>
			<svg
				version="1.1"
				baseProfile="full"
				width={mainStore.actualPointSize * width}
				viewBox={`0 0 ${svgPointSize * width} ${svgPointSize * 5}`}
				xmlns="http://www.w3.org/2000/svg"
			>
				{points.map(point => (
					<Point key={point.x + '-' + point.y} x={point.x} y={point.y} id={point.id} />
				))}
			</svg>
		</div>
	);
});

export { NextBlock };
