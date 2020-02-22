import React from 'react';
import { observer } from "mobx-react-lite"

import styles from 'components/ScoreBoard.module.css';
import { useStore } from 'stores/MainStore';
import { svgPrefix, GameState } from 'utils/helpers';

type ScoreBoardProps = {
	className?: string;
};

const ScoreBoard = observer(({ className = '' }: ScoreBoardProps) => {
	const mainStore = useStore();
 	const prefsStyles = mainStore.preferencesStore.prefs.styles;

	return (
		<div className={styles.root + ' ' + className} style={{
			visibility: mainStore.gameState === GameState.Reset ? 'hidden' : 'visible',
			color: prefsStyles.textColor,
			borderColor: prefsStyles.outlineColor
		}}>
			<svg
				version="1.1"
				preserveAspectRatio='none'
				xmlns="http://www.w3.org/2000/svg"
			>
				<use x='0' y='0' width='100%' height='100%' href={'#' + svgPrefix + 'board'} />
			</svg>
			<table className={styles.score} style={{ borderColor: prefsStyles.outlineColor }}>
				<tbody>
					<tr><td>Score</td><td>{mainStore.score.toLocaleString()}</td></tr>
					<tr><td>Lines</td><td>{mainStore.rows}</td></tr>
					<tr><td>Level</td><td>{mainStore.level}</td></tr>
				</tbody>
			</table>
		</div>
	);
});

export { ScoreBoard };
