import React from 'react';

import { svgPointSize } from 'utils/helpers';

const lineOffset = 0.5; // seems to help with antialiasing on small sizes

type BoardBackdropProps = {
	gridColor: string;
	height: number;
	width: number;
};

const BoardBackdrop = React.memo(({ gridColor, height, width }: BoardBackdropProps) => {
	const xLines = [];
	for (let i = 0; i < height; i++) {
		xLines.push(<line key={i} stroke={gridColor} strokeWidth='1' x1='0' y1={(svgPointSize * i) + lineOffset} x2='100%' y2={svgPointSize * i} />);
	}
	const yLines = [];
	for (let i = 0; i < width; i++) {
		yLines.push(<line key={i} stroke={gridColor} strokeWidth='1' x1={(svgPointSize * i) + lineOffset} y1='0' x2={svgPointSize * i} y2='100%' />);
	}

	return (<>
		<use x='0' y='0' width='100%' height='100%' href='#board' />
		{xLines}
		{yLines}
	</>);
});

export { BoardBackdrop };
