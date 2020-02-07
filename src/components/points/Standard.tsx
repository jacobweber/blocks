import React from 'react';

import { blockDefs } from 'utils/blocks';
import { lightenColor } from 'utils/colors';

const extraDefs = [
	{ id: 'flashOn', color: '#000000' },
	{ id: 'flashOff', color: '#FFFFFF' },
];

const PointDefs = () => {
	return (
		<svg>
			<defs>
				{[...blockDefs, ...extraDefs].map((type, index) => (<>
					<linearGradient key={index} id={`g${index}`} x1='0%' y1='0%' x2='100%' y2='100%'>
						<stop stopColor={lightenColor(type.color, -50)} offset='0%' />
						<stop stopColor={type.color} offset='80%' />
					</linearGradient>
					<symbol key={index} id={type.id}>
						<rect fill={`url(#g${index})`} width='100%' height='100%' stroke='black' strokeWidth='1' />
					</symbol>
				</>))}
			</defs>
		</svg>
	);
};

export { PointDefs };
