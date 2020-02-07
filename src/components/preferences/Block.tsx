import React from 'react';
import { observer } from "mobx-react-lite"

import { useStore } from 'stores/MainStore';
import { Point } from 'components/Point';
import { pointSize } from 'utils/helpers';
import { BlockDef } from 'utils/blocks';

type BlockProps = {
	def: BlockDef;
};

const Block = observer(({ def }: BlockProps) => {
	const preferencesStore = useStore().preferencesStore;
	const points = preferencesStore.getBlockPoints(def);

	return (
		<svg
			version="1.1"
			baseProfile="full"
			viewBox={`0 0 ${pointSize * 5} ${pointSize * 5}`}
			xmlns="http://www.w3.org/2000/svg"
		>
			{points.map(point => (
				<Point key={point.x + '-' + point.y} x={point.x} y={point.y} id={point.id} />
			))}
		</svg>
	);
});

export { Block };
