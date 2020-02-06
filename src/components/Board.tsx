import React from 'react';
import { observer } from "mobx-react-lite"
import { useStore } from '../stores/MainStore';

import styles from 'components/Board.module.css';
import { BoardDef } from 'components/boards/Black';
import { PointDefs } from 'components/points/Standard';
import { Points } from 'components/Points';
import { PositionedBlock } from 'components/PositionedBlock';
import { StatusOverlay } from 'components/StatusOverlay';
import { GameState, pointSize } from 'utils/helpers';

const lineOffset = 0.5; // seems to help with antialiasing on small sizes

const Board = observer(() => {
	const mainStore = useStore();
 	const prefsStyles = mainStore.preferencesStore.styles;

	const xLines = [];
	for (let i = 0; i < mainStore.height; i++) {
		xLines.push(<line key={i} stroke={prefsStyles.gridColor} strokeWidth='1' x1='0' y1={(pointSize * i) + lineOffset} x2='100%' y2={pointSize * i} />);
	}
	const yLines = [];
	for (let i = 0; i < mainStore.width; i++) {
		yLines.push(<line key={i} stroke={prefsStyles.gridColor} strokeWidth='1' x1={(pointSize * i) + lineOffset} y1='0' x2={pointSize * i} y2='100%' />);
	}

	return (
		<div className={styles.root + (mainStore.gameState === GameState.Active ? ' ' + styles.hideCursor : '')}>
			<div className={styles.pointDefs}>
				<PointDefs />
				<BoardDef />
			</div>
			<svg
				version="1.1"
				baseProfile="full"
				viewBox={`0 0 ${pointSize * mainStore.width} ${pointSize * mainStore.height}`}
				xmlns="http://www.w3.org/2000/svg"
				xmlnsXlink="http://www.w3.org/1999/xlink"
			>
				<use x='0' y='0' width='100%' height='100%' xlinkHref='#board' />
				{xLines}
				{yLines}
				<Points />
				<PositionedBlock />
				<rect width="100%" height="100%" stroke={prefsStyles.outlineColor} strokeWidth='6' fillOpacity='0' />
			</svg>
			<StatusOverlay />
		</div>
	);
});

export { Board };
