import React from 'react';
import { observer } from "mobx-react-lite"
import { Button } from 'semantic-ui-react'

import styles from 'components/LayoutVert.module.css';
import { useStore } from 'stores/MainStore';
import { Board } from 'components/board/Board';
import { NextBlock } from 'components/NextBlock';
import { ScoreBoard } from 'components/ScoreBoard';
import { GameState } from 'utils/helpers';

const LayoutVert = observer(() => {
	const mainStore = useStore();

	return (
		<div className={styles.root}>
			<div className={styles.top}>
				<div className={styles.content}>
					<div className={styles.buttonsLeft}>
						{(mainStore.gameState === GameState.Active || mainStore.gameState === GameState.Paused) ? (
							<div className={styles.button}>
								<Button icon='stop' onClick={e => mainStore.endGame()} />
							</div>
						) : (
							<div className={styles.button}>
								<Button icon='play' onClick={e => mainStore.newGame()} />
							</div>
						)}
						{mainStore.gameState === GameState.Active && (
							<div className={styles.button}>
								<Button icon='pause' onClick={e => mainStore.pause()} />
							</div>
						)}
						{mainStore.gameState === GameState.Paused && (
							<div className={styles.button}>
								<Button icon='play' onClick={e => mainStore.resume()} />
							</div>
						)}
					</div>
					<NextBlock className={styles.nextBlock} />
					<ScoreBoard className={styles.scoreBoard} />
					<div className={styles.buttonsRight}>
						<div className={styles.button}>
							<Button icon='trophy' onClick={e => mainStore.showHighScores()} />
						</div>
						<div className={styles.button}>
							<Button icon='setting' onClick={e => mainStore.showPrefs()} />
						</div>
					</div>
				</div>
			</div>
			<div className={styles.bottom}>
				<Board />
			</div>
		</div>
	);
});

export { LayoutVert };
