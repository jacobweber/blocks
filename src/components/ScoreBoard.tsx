import React from 'react';
import { observer } from "mobx-react-lite"

import styles from 'components/ScoreBoard.module.css';
import { useStore } from 'stores/MainStore';
import { GameState } from 'utils/helpers';

type ScoreBoardProps = {
	className?: string;
};

const ScoreBoard = observer(({ className = '' }: ScoreBoardProps) => {
	const mainStore = useStore();
 	const prefsStyles = mainStore.preferencesStore.prefs.styles;

	return (
		<div className={styles.root + ' ' + className} style={{
			visibility: mainStore.gameState === GameState.Reset ? 'hidden' : 'visible',
			color: prefsStyles.textColor
		}}>
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
