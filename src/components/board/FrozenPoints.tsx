import React from 'react';
import { observer } from "mobx-react-lite"

import { useStore } from 'stores/MainStore';
import { Point } from 'components/Point';

const FrozenPoints = observer(() => {
	const mainStore = useStore();
	const points = mainStore.getFrozenPoints();

	return <>{points.map(point => (
		<Point key={point.x + '-' + point.y} x={point.x} y={point.y} id={point.id} />
	))}</>;
});

export { FrozenPoints };
