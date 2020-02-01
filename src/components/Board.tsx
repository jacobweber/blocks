import React from 'react';
import { observer } from "mobx-react-lite"
import { useStore } from '../stores/MainStore';

import styles from './Board.module.css';
import { PointDefs } from './PointDefs';
import { Points } from './Points';
import { PositionedBlock } from './PositionedBlock';

const Board = observer(() => {
	const mainStore = useStore();

	const xLines = [];
	for (let i = 0; i < mainStore.height; i++) {
		xLines.push(<line key={i} stroke='black' strokeWidth='.5' x1='0' y1={mainStore.pointSize * i} x2='100%' y2={mainStore.pointSize * i} />);
	}
	const yLines = [];
	for (let i = 0; i < mainStore.width; i++) {
		yLines.push(<line key={i} stroke='black' strokeWidth='.5' x1={mainStore.pointSize * i} y1='0' x2={mainStore.pointSize * i} y2='100%' />);
	}

	return (
		<div className={styles.root}>
			<svg
				version="1.1"
				baseProfile="full"
				width={mainStore.pointSize * mainStore.width}
				height={mainStore.pointSize * mainStore.height}
				xmlns="http://www.w3.org/2000/svg"
			>
				<PointDefs size={mainStore.pointSize} />
				<Points />
				<PositionedBlock />
				{xLines}
				{yLines}
				<rect width="100%" height="100%" stroke="black" strokeWidth='3' fillOpacity='0' />
			</svg>
		</div>
	);
});

export { Board };
