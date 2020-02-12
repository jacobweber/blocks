import React from 'react';

import { PointSymbolID } from 'utils/blocks';
import { svgPointSize, svgPrefix } from 'utils/helpers';

type PointProps = {
	prefix?: string;
	id: PointSymbolID;
	x: number;
	y: number;
	onClick?: (e: any) => void;
};

const Point = React.memo(({ prefix = '', id, x, y, onClick }: PointProps) => {
	return <use x={x * svgPointSize} y={y * svgPointSize} onClick={onClick} width={svgPointSize} height={svgPointSize} href={'#' + svgPrefix + prefix + id} />;
});

export { Point };
