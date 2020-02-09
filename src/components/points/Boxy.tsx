import React from 'react';

import { PointDefsProps } from 'components/points/PointDefs';

const Boxy = React.memo(({ prefix = '', blockColors }: PointDefsProps) => {
	return (
		<svg>
			<defs>
				<g id={`${prefix}shadow`}>
					<path fill="#fff" fillOpacity=".7" d="m0,0 3,3 18,0 3,-3" />
					<path fill="#000" fillOpacity=".1" d="m0,0 3,3 0,18 -3,3 m24,-24 -3,3 0,18 3,3" />
					<path fill="#000" fillOpacity=".5" d="m0,24 3,-3 18,0 3,3" />
				</g>
				{blockColors.map((type, index) => (
					<symbol key={index} id={prefix + type.id} viewBox="0 0 24 24">
						<rect height="100%" width="100%" fill={type.color} />
						<use href={`#${prefix}shadow`} />
					</symbol>
				))}
			</defs>
		</svg>
	);
});

export { Boxy };
