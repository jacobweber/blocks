import React from 'react';
import { observer } from "mobx-react-lite"
import { Button } from 'semantic-ui-react'

import styles from 'components/LayoutHorizTouch.module.css';
import { useStore } from 'stores/MainStore';
import { Board } from 'components/board/Board';
import { NextBlock } from 'components/NextBlock';
import { ScoreBoard } from 'components/ScoreBoard';
import { GameState } from 'utils/helpers';

const LayoutHorizTouch = observer(() => {
	const mainStore = useStore();

	return (
		<div className={styles.root}>
			<div className={styles.left}>
				<Board />
			</div>
			<div className={styles.right}>
				<div className={styles.content}>
					<div className={styles.buttons}>
						<div className={styles.buttonsCol}>
							{(mainStore.gameState === GameState.Active || mainStore.gameState === GameState.Paused) ? (
								<Button icon='stop' onClick={e => mainStore.endGame()} />
							) : (
								<Button icon='play' onClick={e => mainStore.newGame()} />
							)}
							{mainStore.gameState === GameState.Active && (
								<Button icon='pause' onClick={e => mainStore.pause()} />
							)}
							{mainStore.gameState === GameState.Paused && (
								<Button icon='play' onClick={e => mainStore.resume()} />
							)}
						</div>
						<div className={styles.buttonsCol}>
							<Button icon='trophy' onClick={e => mainStore.showHighScores()} />
							<Button icon='setting' onClick={e => mainStore.showPrefs()} />
						</div>
					</div>
					<NextBlock className={styles.nextBlock} />
					<ScoreBoard className={styles.scoreBoard} />
				</div>
			</div>
		</div>
	);
});

export { LayoutHorizTouch };
