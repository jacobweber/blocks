import React from 'react';

import { lightenColor } from 'utils/colors';
import { PointDefsProps } from 'components/points/PointDefs';
import { svgPrefix } from 'utils/helpers';

const Standard = React.memo(({ prefix = '', blockColors }: PointDefsProps) => {
	return (
		<svg>
			<defs>
				{blockColors.map((type, index) => (
					<React.Fragment key={index}>
						<linearGradient id={svgPrefix + prefix + 'g' + index} x1='0%' y1='0%' x2='100%' y2='100%'>
							<stop stopColor={lightenColor(type.color, -50)} offset='0%' />
							<stop stopColor={type.color} offset='80%' />
						</linearGradient>
						<symbol id={svgPrefix + prefix + type.id}>
							<rect fill={'url(#' + svgPrefix + prefix + 'g' + index + ')'} width='100%' height='100%' stroke='black' strokeWidth='1' />
						</symbol>
					</React.Fragment>
				))}
			</defs>
		</svg>
	);
});

export { Standard };
