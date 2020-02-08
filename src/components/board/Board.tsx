import React from 'react';
import { observer } from "mobx-react-lite"

import styles from 'components/board/Board.module.css';
import { useStore } from 'stores/MainStore';
import { BoardDefSelector } from 'components/boards/BoardDefSelector';
import { PointDefsSelector } from 'components/points/PointDefsSelector';
import { Points } from 'components/board/Points';
import { PositionedBlock } from 'components/board/PositionedBlock';
import { StatusOverlay } from 'components/board/StatusOverlay';
import { GameState, pointSize } from 'utils/helpers';
import { BoardBackdrop } from './BoardBackdrop';

const Board = observer(() => {
	const mainStore = useStore();
 	const preferencesStore = mainStore.preferencesStore;
	const prefsStyles = preferencesStore.styles;

	return (
		<div className={styles.root + (mainStore.gameState === GameState.Active ? ' ' + styles.hideCursor : '')}>
			<div className={styles.pointDefs}>
				<PointDefsSelector type={preferencesStore.prefs.points} blockColors={preferencesStore.blockColors} />
				<BoardDefSelector type={preferencesStore.prefs.board} />
			</div>
			<svg
				version="1.1"
				baseProfile="full"
				viewBox={`0 0 ${pointSize * preferencesStore.width} ${pointSize * preferencesStore.height}`}
				xmlns="http://www.w3.org/2000/svg"
			>
				<BoardBackdrop
					gridColor={prefsStyles.gridColor}
					width={preferencesStore.width}
					height={preferencesStore.height}
				/>
				<Points />
				<PositionedBlock />
				<rect width="100%" height="100%" stroke={prefsStyles.outlineColor} strokeWidth='6' fillOpacity='0' />
			</svg>
			<StatusOverlay />
		</div>
	);
});

export { Board };
