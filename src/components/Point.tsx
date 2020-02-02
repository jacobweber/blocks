import React from 'react';
import { PointID } from '../stores/MainStore';

type PointProps = {
	key: string;
	id: PointID;
	x: number;
	y: number;
	size: number;
};

const Point = React.memo(({ id, x, y, size }: PointProps) => {
	return <use x={x * size} y={y * size} width={size} height={size} xlinkHref={'#' + id} />;
});

export { Point };
