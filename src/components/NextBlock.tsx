import React from 'react';
import { observer } from "mobx-react-lite"
import { useStore } from '../stores/MainStore';

import styles from './NextBlock.module.css';
import { Point } from './Point';
import { pointSize } from '../utils/helpers';

const NextBlock = observer(() => {
	const mainStore = useStore();
	const points = mainStore.getNextBlockPoints();

	return (
		<div className={styles.root}>
			<svg
				version="1.1"
				baseProfile="full"
				viewBox={`0 0 ${pointSize * 4} ${pointSize * 2}`}
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
