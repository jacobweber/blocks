import React from 'react';
import { observer } from "mobx-react-lite"
import { useStore } from '../stores/MainStore';

import { Point } from './Point';

const PositionedBlock = observer(() => {
	const mainStore = useStore();
	const points: Array<JSX.Element> = [];
	const size = mainStore.pointSize;
	if (mainStore.positionedBlock) {
		const positionedBlockPoints = mainStore.getPoints(mainStore.positionedBlock);
		const color = mainStore.getBlockDef(mainStore.positionedBlock.type).color;
		positionedBlockPoints.forEach(point => {
			const x = point[0];
			const y = point[1];
			points.push(<Point key={x + '-' + y} x={x} y={y} color={color} size={size} />);
		});
	}
	return <>{points}</>;
});

export { PositionedBlock };
