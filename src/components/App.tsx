import React from 'react';
import { observer } from "mobx-react-lite"
import { useStore } from '../stores/MainStore';
import { Button } from 'semantic-ui-react'

import styles from './App.module.css';
import { Board } from './Board';
import { NextBlock } from './NextBlock';
import { GameState } from './GameState';
import { Preferences } from './Preferences';
import { HighScores } from './HighScores';

const App = observer(() => {
	const mainStore = useStore();
	const preferencesStore = mainStore.preferencesStore;
	const highScoresStore = mainStore.highScoresStore;

	return (
		<div className={styles.root} style={{ backgroundColor: preferencesStore.styles.backgroundColor }}>
			<div className={styles.layout}>
				<Board />
				<div className={styles.right}>
					<div className={styles.nextBlock}>
						<NextBlock />
					</div>
					<div className={styles.gameState}>
						<GameState />
					</div>
					<div className={styles.highScores}>
						<Button onClick={e => mainStore.showHighScores()}>High Scores</Button>
						{highScoresStore.visible && <HighScores />}
					</div>
					<div className={styles.preferences}>
						<Button onClick={e => mainStore.showPrefs()}>Preferences</Button>
						{preferencesStore.visible && <Preferences />}
					</div>
				</div>
			</div>
		</div>
	);
});

export { App };
