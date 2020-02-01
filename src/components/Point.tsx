import React from 'react';
import { PointID } from '../stores/MainStore';

type PointProps = {
	key: string;
	id: PointID;
	x: number;
	y: number;
};

const Point = ({ id, x, y }: PointProps) => {
	return <use xlinkHref={'#' + id} x={x} y={y} />;
};

export { Point };
