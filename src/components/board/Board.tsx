import React from 'react';
import { observer } from "mobx-react-lite"

import styles from 'components/board/Board.module.css';
import { useStore } from 'stores/MainStore';
import { BoardDef } from 'components/boards/BoardDef';
import { PointDefs } from 'components/points/PointDefs';
import { FrozenPoints } from 'components/board/FrozenPoints';
import { PositionedBlock } from 'components/board/PositionedBlock';
import { StatusOverlay } from 'components/board/StatusOverlay';
import { GameState, svgPointSize } from 'utils/helpers';
import { BoardBackdrop } from './BoardBackdrop';

const Board = observer(() => {
	const mainStore = useStore();
	const boardStore = mainStore.boardStore;
 	const preferencesStore = mainStore.preferencesStore;
	const prefsStyles = preferencesStore.prefs.styles;

	return (
		<div
			className={styles.root + (mainStore.gameState === GameState.Active ? ' ' + styles.hideCursor : '')}
			style={{
				width: boardStore.actualPointSize * boardStore.width,
				height: boardStore.actualPointSize * boardStore.height
			}}
		>
			<div className={styles.pointDefs}>
				<PointDefs type={preferencesStore.prefs.pointsType} blockColors={mainStore.blockColors} />
				<BoardDef type={preferencesStore.prefs.boardType} color={prefsStyles.boardColor} />
			</div>
			<svg
				version="1.1"
				viewBox={`0 0 ${svgPointSize * boardStore.width} ${svgPointSize * boardStore.height}`}
				xmlns="http://www.w3.org/2000/svg"
			>
				<BoardBackdrop
					showGrid={preferencesStore.prefs.showGrid}
					gridColor={prefsStyles.gridColor}
					width={boardStore.width}
					height={boardStore.height}
				/>
				<FrozenPoints />
				<PositionedBlock />
				<rect width="100%" height="100%" stroke={prefsStyles.outlineColor} strokeWidth='6' fillOpacity='0' />
			</svg>
			<StatusOverlay />
		</div>
	);
});

export { Board };
