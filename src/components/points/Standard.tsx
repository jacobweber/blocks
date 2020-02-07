import React from 'react';

import { lightenColor } from 'utils/colors';
import { BlockColor } from 'utils/blocks';

type PointDefsProps = {
	blockColors: Array<BlockColor>;
};

const PointDefs = React.memo(({ blockColors }: PointDefsProps) => {
	return (
		<svg>
			<defs>
				{blockColors.map((type, index) => (
					<React.Fragment key={index}>
						<linearGradient id={`g${index}`} x1='0%' y1='0%' x2='100%' y2='100%'>
							<stop stopColor={lightenColor(type.color, -50)} offset='0%' />
							<stop stopColor={type.color} offset='80%' />
						</linearGradient>
						<symbol id={type.id}>
							<rect fill={`url(#g${index})`} width='100%' height='100%' stroke='black' strokeWidth='1' />
						</symbol>
					</React.Fragment>
				))}
			</defs>
		</svg>
	);
});

export { PointDefs };
