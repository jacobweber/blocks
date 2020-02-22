import React from 'react';
import { observer } from "mobx-react-lite"
import { Button } from 'semantic-ui-react'

import styles from 'components/LayoutHoriz.module.css';
import { useStore } from 'stores/MainStore';
import { Board } from 'components/board/Board';
import { NextBlock } from 'components/NextBlock';
import { ScoreBoard } from 'components/ScoreBoard';
import { GameState } from 'utils/helpers';

const LayoutHoriz = observer(() => {
	const mainStore = useStore();

	return (
		<div className={styles.root}>
			<div className={styles.left}>
				<Board />
			</div>
			<div className={styles.right}>
				<NextBlock className={styles.nextBlock} />
				<ScoreBoard className={styles.scoreBoard} />
				<div className={styles.buttonsBottom}>
					<div className={styles.button}>
						{mainStore.gameState === GameState.Active
							? <Button fluid onClick={e => mainStore.endGame()}>End Game</Button>
							: <Button fluid onClick={e => mainStore.newGame()}>New Game</Button>}
					</div>
					<div className={styles.button}>
						<Button fluid onClick={e => mainStore.showHighScores()}>High Scores</Button>
					</div>
					<div className={styles.button}>
						<Button fluid onClick={e => mainStore.showPrefs()}>Preferences</Button>
					</div>
				</div>
			</div>
		</div>
	);
});

export { LayoutHoriz };
