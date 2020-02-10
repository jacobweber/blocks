import React from 'react';
import { observer } from "mobx-react-lite"

import styles from 'components/ScoreBoard.module.css';
import { useStore } from 'stores/MainStore';
import { GameState } from 'utils/helpers';

const ScoreBoard = observer(() => {
	const mainStore = useStore();
 	const prefsStyles = mainStore.preferencesStore.prefs.styles;

	return (
		<div className={styles.root} style={{ color: prefsStyles.textColor }}>
			<table className={styles.score} style={{ borderColor: prefsStyles.outlineColor }}>
				<tbody>
					{mainStore.gameState !== GameState.Reset && (<>
						<tr><td>Score</td><td>{mainStore.score.toLocaleString()}</td></tr>
						<tr><td>Lines</td><td>{mainStore.rows}</td></tr>
						<tr><td>Level</td><td>{mainStore.level}</td></tr>
					</>)}
				</tbody>
			</table>
		</div>
	);
});

export { ScoreBoard };
