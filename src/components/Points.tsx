import React from 'react';
import { observer } from "mobx-react-lite"
import { useStore } from '../stores/MainStore';

import { Point } from './Point';

const Points = observer(() => {
	const mainStore = useStore();
	const points: Array<JSX.Element> = [];
	const size = mainStore.pointSize;
	for (let x = 0; x < mainStore.width; x++) {
		for (let y = 0; y < mainStore.height; y++) {
			const point = mainStore.filledPoints[y][x];
			if (point) {
				points.push(<Point key={x + '-' + y} x={x * size} y={y * size} id={point.id} />);
			}
		}
	}
	return <>{points}</>;
});

export { Points };
