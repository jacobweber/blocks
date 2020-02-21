import React from 'react';
import { observer } from "mobx-react-lite"

import styles from 'components/NextBlock.module.css';
import { useStore } from 'stores/MainStore';
import { Point } from 'components/Point';
import { svgPointSize, GameState } from 'utils/helpers';

type NextBlockProps = {
	className?: string;
};

const NextBlock = observer(({ className = '' }: NextBlockProps) => {
	const mainStore = useStore();
	const boardStore = mainStore.boardStore;
	const { points, width, height } = mainStore.getNextBlockInfo();
 	const prefsStyles = mainStore.preferencesStore.prefs.styles;
	if (mainStore.gameState === GameState.Reset) return null;

	return (
		<div className={styles.root + ' ' + className} style={{ color: prefsStyles.textColor, borderColor: prefsStyles.outlineColor }}>
			<p>Next Block</p>
			<div style={{
				height: boardStore.actualPointSize * mainStore.blockMaxInitialHeight,
				width: boardStore.actualPointSize * mainStore.blockMaxInitialWidth
			}}>
				<svg
					version="1.1"
					baseProfile="full"
					width={boardStore.actualPointSize * width}
					height={boardStore.actualPointSize * height}
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
