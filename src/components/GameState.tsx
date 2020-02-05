import React from 'react';
import { observer } from "mobx-react-lite"
import { useStore } from '../stores/MainStore';
import { GameState as State } from '../utils/types';

import styles from './GameState.module.css';

const GameState = observer(() => {
	const mainStore = useStore();
 	const prefsStyles = mainStore.preferencesStore.styles;

	return (
		<div className={styles.root} style={{ color: prefsStyles.textColor }}>
			<table className={styles.score} style={{ borderColor: prefsStyles.outlineColor }}>
				<tbody>
					{mainStore.gameState !== State.Stopped && (<>
						<tr><td>Score</td><td>{mainStore.score.toLocaleString()}</td></tr>
						<tr><td>Lines</td><td>{mainStore.rows}</td></tr>
						<tr><td>Level</td><td>{mainStore.level}</td></tr>
					</>)}
				</tbody>
			</table>
			<div className={styles.paused}>
				{mainStore.gameState === State.Paused && 'Paused'}
			</div>
		</div>
	);
});

export { GameState };
