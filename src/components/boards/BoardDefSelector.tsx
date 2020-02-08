import React from 'react';

import { BoardType } from 'stores/PreferencesStore';
import { Black } from 'components/boards/Black';
import { White } from 'components/boards/White';

type BoardDefSelectorProps = {
	type: BoardType;
};

export type BoardDefProps = {
};

const getBoardDefComp = function(type: BoardType): React.ComponentType<BoardDefProps> {
	switch (type) {
		case 'Black': return Black;
		case 'White': default: return White;
	}
}

const BoardDefSelector = React.memo(({ type }: BoardDefSelectorProps) => {
	const Comp = getBoardDefComp(type);
	return <Comp />;
});

export { BoardDefSelector };
