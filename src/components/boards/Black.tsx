import React from 'react';

import { BoardDefProps } from 'components/boards/BoardDefSelector';

const Black = React.memo((props: BoardDefProps) => {
	return (
		<svg>
			<defs>
				<linearGradient id={`gboard`} x1='0%' y1='0%' x2='100%' y2='100%'>
					<stop stopColor='#617587' offset='0%' />
					<stop stopColor='#000000' offset='80%' />
				</linearGradient>
				<symbol id='board'>
					<rect fill='url(#gboard)' width='100%' height='100%' stroke='black' strokeWidth='0' />
				</symbol>
			</defs>
		</svg>
	);
});

export { Black };
