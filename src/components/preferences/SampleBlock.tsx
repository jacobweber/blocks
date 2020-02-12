import React from 'react';
import { observer } from "mobx-react-lite"

import { useStore } from 'stores/MainStore';
import { Point } from 'components/Point';
import { svgPointSize } from 'utils/helpers';
import { BlockDef, maxBlockSize } from 'utils/blocks';

type SampleBlockProps = {
	def: BlockDef;
	prefix: string;
};

const SampleBlock = observer(({ def, prefix = '' }: SampleBlockProps) => {
	const preferencesStore = useStore().preferencesStore;
	const points = preferencesStore.getSampleBlockPoints(def);

	return (
		<svg
			version="1.1"
			baseProfile="full"
			viewBox={`0 0 ${svgPointSize * maxBlockSize} ${svgPointSize * maxBlockSize}`}
			xmlns="http://www.w3.org/2000/svg"
		>
			{points.map(point => (
				<Point key={point.x + '-' + point.y} x={point.x} y={point.y} id={prefix + point.id} />
			))}
		</svg>
	);
});

export { SampleBlock };
