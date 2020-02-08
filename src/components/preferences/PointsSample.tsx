import React from 'react';
import { observer } from "mobx-react-lite"

import { useStore } from 'stores/MainStore';
import { Point } from 'components/Point';
import { pointSize } from 'utils/helpers';

type PointsSampleProps = {
	prefix?: string;
};

const PointsSample = observer(({ prefix = '' }: PointsSampleProps) => {
	const preferencesStore = useStore().preferencesStore;
	const defs = preferencesStore.form.blockDefs;

	return (
		<svg
			version="1.1"
			baseProfile="full"
			viewBox={`0 0 ${pointSize * 5} ${pointSize * 5}`}
			xmlns="http://www.w3.org/2000/svg"
		>
			<Point x={1 * pointSize} y={1 * pointSize} id={prefix + defs[0].id} />
		</svg>
	);
});

export { PointsSample };
