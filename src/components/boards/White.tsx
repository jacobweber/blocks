import React from 'react';

import { BoardDefProps } from 'components/boards/BoardDefSelector';

const White = React.memo((props: BoardDefProps) => {
	return (
		<svg>
			<defs>
				<linearGradient id={`gboard`} x1='0%' y1='0%' x2='100%' y2='100%'>
					<stop stopColor='#BBBBBB' offset='0%' />
					<stop stopColor='#DDDDDD' offset='80%' />
				</linearGradient>
				<symbol id='board'>
					<rect fill='url(#gboard)' width='100%' height='100%' stroke='black' strokeWidth='0' />
				</symbol>
			</defs>
		</svg>
	);
});

export { White };
