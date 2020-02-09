import React from 'react';

import { BoardDefProps } from 'components/boards/BoardDef';

const Black = React.memo(({ prefix = '' }: BoardDefProps) => {
	return (
		<svg>
			<defs>
				<linearGradient id={`${prefix}gboard`} x1='0%' y1='0%' x2='100%' y2='100%'>
					<stop stopColor='#617587' offset='0%' />
					<stop stopColor='#000000' offset='80%' />
				</linearGradient>
				<symbol id={prefix + 'board'}>
					<rect fill={`url(#${prefix}gboard)`} width='100%' height='100%' stroke='black' strokeWidth='0' />
				</symbol>
			</defs>
		</svg>
	);
});

export { Black };
