import React from 'react';
import { PointID } from '../utils/blocks';
import { pointSize } from '../utils/helpers';

type PointProps = {
	key: string;
	id: PointID;
	x: number;
	y: number;
};

const Point = React.memo(({ id, x, y }: PointProps) => {
	return <use x={x * pointSize} y={y * pointSize} width={pointSize} height={pointSize} xlinkHref={'#' + id} />;
});

export { Point };
