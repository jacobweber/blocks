import React from 'react';
import { BlockColor } from 'utils/blocks';
import { PointsType } from 'stores/PreferencesStore';
import { Standard } from 'components/points/Standard';
import { Plain } from 'components/points/Plain';
import { Boxy } from 'components/points/Boxy';

type PointDefsSelectorProps = {
	type: PointsType;
	prefix?: string;
	blockColors: Array<BlockColor>;
};

export type PointDefsProps = {
	prefix?: string;
	blockColors: Array<BlockColor>;
};

const getPointsDefsComp = function(type: PointsType): React.ComponentType<PointDefsProps> {
	switch (type) {
		case 'Plain': return Plain;
		case 'Boxy': return Boxy;
		case 'Standard': default: return Standard;
	}
}

const PointDefsSelector = React.memo(({ type, prefix = '', blockColors }: PointDefsSelectorProps) => {
	const Comp = getPointsDefsComp(type);
	return <Comp prefix={prefix} blockColors={blockColors} />;
});

export { PointDefsSelector };
