import React from 'react';

import { PointSymbolID } from 'utils/blocks';
import { svgPointSize } from 'utils/helpers';

type PointProps = {
	id: PointSymbolID;
	x: number;
	y: number;
	onClick?: (e: any) => void;
};

const Point = React.memo(({ id, x, y, onClick }: PointProps) => {
	return <use x={x * svgPointSize} y={y * svgPointSize} onClick={onClick} width={svgPointSize} height={svgPointSize} href={'#' + id} />;
});

export { Point };
