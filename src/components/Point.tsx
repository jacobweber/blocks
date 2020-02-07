import React from 'react';

import { PointSymbolID } from 'utils/blocks';
import { pointSize } from 'utils/helpers';

type PointProps = {
	key: string;
	id: PointSymbolID;
	x: number;
	y: number;
	onClick?: (e: any) => void;
};

const Point = React.memo(({ id, x, y, onClick }: PointProps) => {
	return <use x={x * pointSize} y={y * pointSize} onClick={onClick} width={pointSize} height={pointSize} href={'#' + id} />;
});

export { Point };
