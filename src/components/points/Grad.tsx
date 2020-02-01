import React from 'react';
import { observer } from "mobx-react-lite"
import { lightenColor } from '../../utils/colors';

const offset1 = '00%';
const offset2 = '80%';
const strokeColor = 'black';
const gradProps = { x1: '0%', y1: '0%', x2: '100%', y2: '100%' };
const lightenAmount = -50;

const PointDefs = observer(() => {
	return (
		<defs>
			<symbol id='line'>
				<linearGradient id='g1' {...gradProps}>
					<stop stopColor={lightenColor('#ADFF2F', lightenAmount)} offset={offset1} />
					<stop stopColor='#ADFF2F' offset={offset2} />
				</linearGradient>
				<rect fill='url(#g1)' width='100%' height='100%' stroke={strokeColor} strokeWidth='1' />
			</symbol>
			<symbol id='square'>
				<linearGradient id='g2' {...gradProps}>
					<stop stopColor={lightenColor('#F08080', lightenAmount)} offset={offset1} />
					<stop stopColor='#F08080' offset={offset2} />
				</linearGradient>
				<rect fill='url(#g2)' width='100%' height='100%' stroke={strokeColor} strokeWidth='1' />
			</symbol>
			<symbol id='are'>
				<linearGradient id='g3' {...gradProps}>
					<stop stopColor={lightenColor('#F0E68C', lightenAmount)} offset={offset1} />
					<stop stopColor='#F0E68C' offset={offset2} />
				</linearGradient>
				<rect fill='url(#g3)' width='100%' height='100%' stroke={strokeColor} strokeWidth='1' />
			</symbol>
			<symbol id='ell'>
				<linearGradient id='g4' {...gradProps}>
					<stop stopColor={lightenColor('#DEB887', lightenAmount)} offset={offset1} />
					<stop stopColor='#DEB887' offset={offset2} />
				</linearGradient>
				<rect fill='url(#g4)' width='100%' height='100%' stroke={strokeColor} strokeWidth='1' />
			</symbol>
			<symbol id='ess'>
				<linearGradient id='g5' {...gradProps}>
					<stop stopColor={lightenColor('#6495ED', lightenAmount)} offset={offset1} />
					<stop stopColor='#6495ED' offset={offset2} />
				</linearGradient>
				<rect fill='url(#g5)' width='100%' height='100%' stroke={strokeColor} strokeWidth='1' />
			</symbol>
			<symbol id='zee'>
				<linearGradient id='g6' {...gradProps}>
					<stop stopColor={lightenColor('#FFB6C1', lightenAmount)} offset={offset1} />
					<stop stopColor='#FFB6C1' offset={offset2} />
				</linearGradient>
				<rect fill='url(#g6)' width='100%' height='100%' stroke={strokeColor} strokeWidth='1' />
			</symbol>
			<symbol id='tee'>
				<linearGradient id='g7' {...gradProps}>
					<stop stopColor={lightenColor('#7FFFD4', lightenAmount)} offset={offset1} />
					<stop stopColor='#7FFFD4' offset={offset2} />
				</linearGradient>
				<rect fill='url(#g7)' width='100%' height='100%' stroke={strokeColor} strokeWidth='1' />
			</symbol>
			<symbol id='flashOn'>
				<linearGradient id='g8' {...gradProps}>
					<stop stopColor={lightenColor('#000000', lightenAmount)} offset={offset1} />
					<stop stopColor='#000000' offset={offset2} />
				</linearGradient>
				<rect fill='url(#g8)' width='100%' height='100%' stroke={strokeColor} strokeWidth='1' />
			</symbol>
			<symbol id='flashOff'>
				<linearGradient id='g9' {...gradProps}>
					<stop stopColor={lightenColor('#FFFFFF', lightenAmount)} offset={offset1} />
					<stop stopColor='#FFFFFF' offset={offset2} />
				</linearGradient>
				<rect fill='url(#g9)' width='100%' height='100%' stroke={strokeColor} strokeWidth='1' />
			</symbol>
		</defs>
	);
});

export { PointDefs };
