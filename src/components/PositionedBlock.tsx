import React from 'react';
import { observer } from "mobx-react-lite"
import { useStore } from '../stores/MainStore';

import './Points.css';
import { Point } from './Point';

const PositionedBlock = observer(() => {
	const mainStore = useStore();
	const points: Array<JSX.Element> = [];
	const size = mainStore.pointSize;
	if (mainStore.positionedBlock) {
		const positionedBlockPoints = mainStore.getPoints(mainStore.positionedBlock);
		positionedBlockPoints.forEach(point => {
			const x = point[0];
			const y = point[1];
			const color = mainStore.positionedBlock ? mainStore.positionedBlock.type.color : 'black';
			points.push(<Point key={x + '-' + y} x={x} y={y} color={color} size={size} />);
		});
	}
	return <>{points}</>;
});

export { PositionedBlock };
