import React from 'react';
import { observer } from "mobx-react-lite"

import styles from 'components/NextBlock.module.css';
import { useStore } from 'stores/MainStore';
import { Point } from 'components/Point';
import { svgPointSize, GameState } from 'utils/helpers';

const NextBlock = observer(() => {
	const mainStore = useStore();
	const { points, width, height } = mainStore.getNextBlockPoints();
 	const prefsStyles = mainStore.preferencesStore.styles;
	if (mainStore.gameState === GameState.Reset) return null;

	return (
		<div className={styles.root} style={{ color: prefsStyles.textColor, borderColor: prefsStyles.outlineColor }}>
			<p>Next Block:</p>
			<div style={{ height: mainStore.actualPointSize * mainStore.blockMaxInitialHeight }}>
				<svg
					version="1.1"
					baseProfile="full"
					width={mainStore.actualPointSize * width}
					height={mainStore.actualPointSize * height}
					viewBox={`0 0 ${svgPointSize * width} ${svgPointSize * height}`}
					xmlns="http://www.w3.org/2000/svg"
				>
					{points.map(point => (
						<Point key={point.x + '-' + point.y} x={point.x} y={point.y} id={point.id} />
					))}
				</svg>
			</div>
		</div>
	);
});

export { NextBlock };
