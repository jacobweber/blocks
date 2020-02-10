import React from 'react';
import { observer } from "mobx-react-lite"
import { Button } from 'semantic-ui-react'

import styles from 'components/App.module.css';
import { useStore } from 'stores/MainStore';
import { Board } from 'components/board/Board';
import { NextBlock } from 'components/NextBlock';
import { ScoreBoard } from 'components/ScoreBoard';
import { Preferences } from 'components/preferences/Preferences';
import { HighScores } from 'components/HighScores';
import { NewGame } from 'components/NewGame';
import { GameState } from 'utils/helpers';

const App = observer(() => {
	const mainStore = useStore();
	const preferencesStore = mainStore.preferencesStore;
	const highScoresStore = mainStore.highScoresStore;
	const newGameStore = mainStore.newGameStore;

	return (
		<div className={styles.root} style={{ backgroundColor: preferencesStore.prefs.styles.backgroundColor }}>
			<div className={styles.layout}>
				<div className={styles.left}>
					<Board />
				</div>
				<div className={styles.right}>
					<div className={styles.content}>
						<div className={styles.nextBlock}>
							<NextBlock />
						</div>
						<div className={styles.scoreBoard}>
							<ScoreBoard />
						</div>
						<div className={styles.button}>
							{mainStore.gameState === GameState.Active
								? <Button fluid onClick={e => mainStore.endGame()}>End Game</Button>
								: <Button fluid onClick={e => mainStore.newGame()}>New Game</Button>}
						</div>
						<div className={styles.button}>
							<Button fluid onClick={e => mainStore.showHighScores()}>High Scores</Button>
							{highScoresStore.visible && <HighScores />}
						</div>
						<div className={styles.button}>
							<Button fluid onClick={e => mainStore.showPrefs()}>Preferences</Button>
							{preferencesStore.visible && <Preferences />}
						</div>
					</div>
				</div>
			</div>
			{newGameStore.visible && <NewGame />}
		</div>
	);
});

export { App };
