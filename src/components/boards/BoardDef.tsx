import React from 'react';

import { BoardType } from 'stores/PreferencesStore';
import { Black } from 'components/boards/Black';
import { Custom } from 'components/boards/Custom';

type BoardDefSelectorProps = {
	type: BoardType;
	prefix?: string;
	color: string;
};

export type BoardDefProps = {
	prefix?: string;
	color: string;
};

const getBoardDefComp = function(type: BoardType): React.ComponentType<BoardDefProps> {
	switch (type) {
		case 'Custom': return Custom;
		case 'Black': default: return Black;
	}
}

const BoardDef = React.memo(({ type, prefix = '', color }: BoardDefSelectorProps) => {
	const Comp = getBoardDefComp(type);
	return <Comp prefix={prefix} color={color} />;
});

export { BoardDef };
