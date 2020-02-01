import React from 'react';
import { observer } from "mobx-react-lite"

type PointDefsProps = {
	size: number;
};

const PointDefs = observer(({ size }: PointDefsProps) => {
	return (
		<defs>
			<symbol id='line'>
				<linearGradient id='g1' x1='0%' y1='0%' x2='100%' y2='100%'>
					<stop stopColor='black' offset='0%' />
					<stop stopColor='greenyellow' offset='90%' />
				</linearGradient>
				<rect fill='url(#g1)' width={size} height={size} stroke='black' strokeWidth='1' />
			</symbol>
			<symbol id='square'>
				<linearGradient id='g2' x1='0%' y1='0%' x2='100%' y2='100%'>
					<stop stopColor='black' offset='0%' />
					<stop stopColor='lightcoral' offset='90%' />
				</linearGradient>
				<rect fill='url(#g2)' width={size} height={size} stroke='black' strokeWidth='1' />
			</symbol>
			<symbol id='are'>
				<linearGradient id='g3' x1='0%' y1='0%' x2='100%' y2='100%'>
					<stop stopColor='black' offset='0%' />
					<stop stopColor='khaki' offset='90%' />
				</linearGradient>
				<rect fill='url(#g3)' width={size} height={size} stroke='black' strokeWidth='1' />
			</symbol>
			<symbol id='ell'>
				<linearGradient id='g4' x1='0%' y1='0%' x2='100%' y2='100%'>
					<stop stopColor='black' offset='0%' />
					<stop stopColor='burlywood' offset='90%' />
				</linearGradient>
				<rect fill='url(#g4)' width={size} height={size} stroke='black' strokeWidth='1' />
			</symbol>
			<symbol id='ess'>
				<linearGradient id='g5' x1='0%' y1='0%' x2='100%' y2='100%'>
					<stop stopColor='black' offset='0%' />
					<stop stopColor='cornflowerblue' offset='90%' />
				</linearGradient>
				<rect fill='url(#g5)' width={size} height={size} stroke='black' strokeWidth='1' />
			</symbol>
			<symbol id='zee'>
				<linearGradient id='g6' x1='0%' y1='0%' x2='100%' y2='100%'>
					<stop stopColor='black' offset='0%' />
					<stop stopColor='lightpink' offset='90%' />
				</linearGradient>
				<rect fill='url(#g6)' width={size} height={size} stroke='black' strokeWidth='1' />
			</symbol>
			<symbol id='tee'>
				<linearGradient id='g7' x1='0%' y1='0%' x2='100%' y2='100%'>
					<stop stopColor='black' offset='0%' />
					<stop stopColor='aquamarine' offset='90%' />
				</linearGradient>
				<rect fill='url(#g7)' width={size} height={size} stroke='black' strokeWidth='1' />
			</symbol>
			<symbol id='flashOn'>
				<linearGradient id='g8' x1='0%' y1='0%' x2='100%' y2='100%'>
					<stop stopColor='black' offset='0%' />
					<stop stopColor='black' offset='90%' />
				</linearGradient>
				<rect fill='url(#g8)' width={size} height={size} stroke='black' strokeWidth='1' />
			</symbol>
			<symbol id='flashOff'>
				<linearGradient id='g9' x1='0%' y1='0%' x2='100%' y2='100%'>
					<stop stopColor='black' offset='0%' />
					<stop stopColor='white' offset='90%' />
				</linearGradient>
				<rect fill='url(#g9)' width={size} height={size} stroke='black' strokeWidth='1' />
			</symbol>
		</defs>
	);
});

export { PointDefs };
