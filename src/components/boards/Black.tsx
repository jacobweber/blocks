import React from 'react';

import { BoardDefProps } from 'components/boards/BoardDef';
import { svgPrefix } from 'utils/helpers';

const Black = React.memo(({ prefix = '', color }: BoardDefProps) => {
	return (
		<svg>
			<defs>
				<linearGradient id={svgPrefix + prefix + 'board-grad'} x1='0%' y1='0%' x2='100%' y2='100%'>
					<stop stopColor='#617587' offset='0%' />
					<stop stopColor='#000000' offset='80%' />
				</linearGradient>
				<symbol id={svgPrefix + prefix + 'board'}>
					<rect fill={'url(#' + svgPrefix + prefix + 'board-grad)'} width='100%' height='100%' stroke='black' strokeWidth='0' />
				</symbol>
			</defs>
		</svg>
	);
});

export { Black };
