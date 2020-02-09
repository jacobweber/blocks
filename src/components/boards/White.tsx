import React from 'react';

import { BoardDefProps } from 'components/boards/BoardDef';

const White = React.memo(({ prefix = '' }: BoardDefProps) => {
	return (
		<svg>
			<defs>
				<linearGradient id={`${prefix}gboard`} x1='0%' y1='0%' x2='100%' y2='100%'>
					<stop stopColor='#BBBBBB' offset='0%' />
					<stop stopColor='#DDDDDD' offset='80%' />
				</linearGradient>
				<symbol id={prefix + 'board'}>
					<rect fill={`url(#${prefix}gboard)`} width='100%' height='100%' stroke='black' strokeWidth='0' />
				</symbol>
			</defs>
		</svg>
	);
});

export { White };
