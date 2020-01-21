import React from 'react';

type PointProps = {
	key: string;
	color: string;
	x: number;
	y: number;
	size: number;
};

const Point = ({ color, x, y, size }: PointProps) => {
	return (
		<rect
			stroke='black'
			strokeWidth='1'
			fill={color}
			x={x * size}
			y={y * size}
			width={size}
			height={size}
		/>
	);
};

export { Point };
