import React from 'react';
import { lightenColor } from '../../utils/colors';

const types = [
	{ id: 'line', color: '#ADFF2F' },
	{ id: 'square', color: '#F08080' },
	{ id: 'are', color: '#F0E68C' },
	{ id: 'ell', color: '#DEB887' },
	{ id: 'ess', color: '#6495ED' },
	{ id: 'zee', color: '#FFB6C1' },
	{ id: 'tee', color: '#7FFFD4' },
	{ id: 'flashOn', color: '#000000' },
	{ id: 'flashOff', color: '#FFFFFF' },
];

const lightenAmount = -50;

const PointDefs = () => {
	return (
		<defs>
			{types.map((type, index) => (
				<symbol key={index} id={type.id}>
					<linearGradient id={`g${index}`} x1='0%' y1='0%' x2='100%' y2='100%'>
						<stop stopColor={lightenColor(type.color, lightenAmount)} offset='0%' />
						<stop stopColor={type.color} offset='80%' />
					</linearGradient>
					<rect fill={`url(#g${index})`} width='100%' height='100%' stroke='black' strokeWidth='1' />
				</symbol>
			))}
		</defs>
	);
};

export { PointDefs };
