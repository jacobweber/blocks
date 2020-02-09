import React from 'react';

import { BoardType } from 'stores/PreferencesStore';
import { Black } from 'components/boards/Black';
import { White } from 'components/boards/White';

type BoardDefSelectorProps = {
	type: BoardType;
	prefix?: string;
};

export type BoardDefProps = {
	prefix?: string;
};

const getBoardDefComp = function(type: BoardType): React.ComponentType<BoardDefProps> {
	switch (type) {
		case 'Black': return Black;
		case 'White': default: return White;
	}
}

const BoardDef = React.memo(({ type, prefix = '' }: BoardDefSelectorProps) => {
	const Comp = getBoardDefComp(type);
	return <Comp prefix={prefix} />;
});

export { BoardDef };
