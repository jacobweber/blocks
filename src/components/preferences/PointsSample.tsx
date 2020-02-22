import React from 'react';
import { observer } from "mobx-react-lite"

import { useStore } from 'stores/MainStore';
import { Point } from 'components/Point';
import { svgPointSize } from 'utils/helpers';

type PointsSampleProps = {
	prefix?: string;
};

const PointsSample = observer(({ prefix = '' }: PointsSampleProps) => {
	const preferencesStore = useStore().preferencesStore;
	const defs = preferencesStore.form.blockDefs;

	return (
		<svg
			version="1.1"
			viewBox={`0 0 ${svgPointSize * 5} ${svgPointSize * 5}`}
			xmlns="http://www.w3.org/2000/svg"
		>
			<Point x={1 * svgPointSize} y={1 * svgPointSize} prefix={prefix} id={defs[0].id} />
		</svg>
	);
});

export { PointsSample };
