import React from 'react';

const BoardDef = () => {
	return (
		<svg>
			<defs>
				<symbol id='board'>
					<linearGradient id={`gboard`} x1='0%' y1='0%' x2='100%' y2='100%'>
						<stop stopColor='#617587' offset='0%' />
						<stop stopColor='#000000' offset='80%' />
					</linearGradient>
					<rect fill='url(#gboard)' width='100%' height='100%' stroke='black' strokeWidth='1' />
				</symbol>
			</defs>
		</svg>
	);
};

export { BoardDef };
