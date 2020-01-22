import React from 'react';
import { observer } from "mobx-react-lite"
import { useStore } from '../stores/MainStore';

import './NextBlock.css';
import { Point } from './Point';

const NextBlock = observer(() => {
	const mainStore = useStore();
	const points: Array<JSX.Element> = [];
	const size = mainStore.pointSize;
	if (mainStore.nextBlockDef) {
		const rotation = mainStore.nextBlockDef.rotations[0];
		const top = rotation.extent[1];
		const color = mainStore.nextBlockDef.color;
		rotation.points.forEach(point => {
			const x = point[0];
			const y = point[1] - top;
			points.push(<Point key={x + '-' + y} x={x} y={y} color={color} size={size} />);
		});
	}

	return (
		<div className="root-nextBlock">
			<svg
				version="1.1"
				baseProfile="full"
				width={mainStore.pointSize * 4}
				height={mainStore.pointSize * 2}
				xmlns="http://www.w3.org/2000/svg"
			>
				{points}
			</svg>
		</div>
	);
});

export { NextBlock };
