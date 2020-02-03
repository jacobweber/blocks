import React from 'react';
import { observer } from "mobx-react-lite"
import { useStore } from '../stores/MainStore';

import { Point } from './Point';

const PositionedBlock = observer(() => {
	const mainStore = useStore();
	const size = mainStore.pointSize;
	const points = mainStore.getPositionedBlockPoints();

	return <>{points.map(point => (
		<Point key={point.x + '-' + point.y} x={point.x} y={point.y} size={size} id={point.id} />
	))}</>;
});

export { PositionedBlock };
