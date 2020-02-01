import React from 'react';
import { observer } from "mobx-react-lite"

const offset = '90%';

const PointDefs = observer(() => {
	return (
		<defs>
			<symbol id='line'>
				<linearGradient id='g1' x1='0%' y1='0%' x2='100%' y2='100%'>
					<stop stopColor='black' offset='0%' />
					<stop stopColor='greenyellow' offset={offset} />
				</linearGradient>
				<rect fill='url(#g1)' width='100%' height='100%' stroke='black' strokeWidth='1' />
			</symbol>
			<symbol id='square'>
				<linearGradient id='g2' x1='0%' y1='0%' x2='100%' y2='100%'>
					<stop stopColor='black' offset='0%' />
					<stop stopColor='lightcoral' offset={offset} />
				</linearGradient>
				<rect fill='url(#g2)' width='100%' height='100%' stroke='black' strokeWidth='1' />
			</symbol>
			<symbol id='are'>
				<linearGradient id='g3' x1='0%' y1='0%' x2='100%' y2='100%'>
					<stop stopColor='black' offset='0%' />
					<stop stopColor='khaki' offset={offset} />
				</linearGradient>
				<rect fill='url(#g3)' width='100%' height='100%' stroke='black' strokeWidth='1' />
			</symbol>
			<symbol id='ell'>
				<linearGradient id='g4' x1='0%' y1='0%' x2='100%' y2='100%'>
					<stop stopColor='black' offset='0%' />
					<stop stopColor='burlywood' offset={offset} />
				</linearGradient>
				<rect fill='url(#g4)' width='100%' height='100%' stroke='black' strokeWidth='1' />
			</symbol>
			<symbol id='ess'>
				<linearGradient id='g5' x1='0%' y1='0%' x2='100%' y2='100%'>
					<stop stopColor='black' offset='0%' />
					<stop stopColor='cornflowerblue' offset={offset} />
				</linearGradient>
				<rect fill='url(#g5)' width='100%' height='100%' stroke='black' strokeWidth='1' />
			</symbol>
			<symbol id='zee'>
				<linearGradient id='g6' x1='0%' y1='0%' x2='100%' y2='100%'>
					<stop stopColor='black' offset='0%' />
					<stop stopColor='lightpink' offset={offset} />
				</linearGradient>
				<rect fill='url(#g6)' width='100%' height='100%' stroke='black' strokeWidth='1' />
			</symbol>
			<symbol id='tee'>
				<linearGradient id='g7' x1='0%' y1='0%' x2='100%' y2='100%'>
					<stop stopColor='black' offset='0%' />
					<stop stopColor='aquamarine' offset={offset} />
				</linearGradient>
				<rect fill='url(#g7)' width='100%' height='100%' stroke='black' strokeWidth='1' />
			</symbol>
			<symbol id='flashOn'>
				<linearGradient id='g8' x1='0%' y1='0%' x2='100%' y2='100%'>
					<stop stopColor='black' offset='0%' />
					<stop stopColor='black' offset={offset} />
				</linearGradient>
				<rect fill='url(#g8)' width='100%' height='100%' stroke='black' strokeWidth='1' />
			</symbol>
			<symbol id='flashOff'>
				<linearGradient id='g9' x1='0%' y1='0%' x2='100%' y2='100%'>
					<stop stopColor='black' offset='0%' />
					<stop stopColor='white' offset={offset} />
				</linearGradient>
				<rect fill='url(#g9)' width='100%' height='100%' stroke='black' strokeWidth='1' />
			</symbol>
		</defs>
	);
});

export { PointDefs };
