import React from 'react';

import { BlockColor } from 'utils/blocks';

type PointDefsProps = {
	prefix?: string;
	blockColors: Array<BlockColor>;
};

const PointDefs = React.memo(({ prefix = '', blockColors }: PointDefsProps) => {
	return (
		<svg>
			<defs>
				{blockColors.map((type, index) => (
					<symbol key={index} id={prefix + type.id}>
						<rect fill={type.color} width='100%' height='100%' stroke='black' strokeWidth='1' />
					</symbol>
				))}
			</defs>
		</svg>
	);
});

export { PointDefs };
