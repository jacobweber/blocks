import React from 'react';
import { observer } from "mobx-react-lite"
import { Button } from 'semantic-ui-react'

import styles from 'components/LayoutHorizTouch.module.css';
import { useStore } from 'stores/MainStore';
import { Board } from 'components/board/Board';
import { NextBlock } from 'components/NextBlock';
import { ScoreBoard } from 'components/ScoreBoard';
import { GameState } from 'utils/helpers';

const cancelTouch = (e: React.TouchEvent) => e.stopPropagation();

const LayoutHorizTouch = observer(() => {
	const mainStore = useStore();

	return (
		<div className={styles.root}>
			<div className={styles.left}>
				<Board />
			</div>
			<div className={styles.right}>
				<div className={styles.buttons}>
					{(mainStore.gameState === GameState.Active || mainStore.gameState === GameState.Paused) ? (
						<Button icon='stop' onTouchStart={cancelTouch} onClick={e => mainStore.endGame()} />
					) : (
						<Button icon='play' onTouchStart={cancelTouch} onClick={e => mainStore.newGame()} />
					)}
					<Button icon='trophy' onTouchStart={cancelTouch} onClick={e => mainStore.showHighScores()} />
				</div>
				<div className={styles.buttons}>
					{mainStore.gameState === GameState.Active ? (
						<Button icon='pause' onTouchStart={cancelTouch} onClick={e => mainStore.pause()} />
					) : (mainStore.gameState === GameState.Paused ? (
						<Button icon='play' onTouchStart={cancelTouch} onClick={e => mainStore.resume()} />
					) : (
						<Button icon='plus' onTouchStart={cancelTouch} onClick={e => mainStore.newGameOptions()} />
					))}
					<Button icon='setting' onTouchStart={cancelTouch} onClick={e => mainStore.showPrefs()} />
				</div>
				<NextBlock pointSize={15} className={styles.nextBlock} />
				<ScoreBoard className={styles.scoreBoard} />
			</div>
		</div>
	);
});

export { LayoutHorizTouch };
