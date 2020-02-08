import React from 'react';

const BoardDef = () => {
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
};

export { BoardDef };