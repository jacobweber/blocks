import React from 'react';

import { BoardDefProps } from 'components/boards/BoardDef';
import { lightenColor } from 'utils/colors';

const Custom = React.memo(({ prefix = '', color }: BoardDefProps) => {
	return (
		<svg>
			<defs>
				<linearGradient id={`${prefix}gboard`} x1='0%' y1='0%' x2='100%' y2='100%'>
					<stop stopColor={lightenColor(color, -50)} offset='0%' />
					<stop stopColor={color} offset='80%' />
				</linearGradient>
				<symbol id={prefix + 'board'}>
					<rect fill={`url(#${prefix}gboard)`} width='100%' height='100%' stroke='black' strokeWidth='0' />
				</symbol>
			</defs>
		</svg>
	);
});

export { Custom };
