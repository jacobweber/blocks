import React from 'react';

import { PointDefsProps } from './PointDefs';
import { svgPrefix } from 'utils/helpers';

const Plain = React.memo(({ prefix = '', blockColors }: PointDefsProps) => {
	return (
		<svg>
			<defs>
				{blockColors.map((type, index) => (
					<symbol key={index} id={svgPrefix + prefix + type.id}>
						<rect fill={type.color} width='100%' height='100%' stroke='black' strokeWidth='1' />
					</symbol>
				))}
			</defs>
		</svg>
	);
});

export { Plain };
