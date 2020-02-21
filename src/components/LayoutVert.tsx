import React from 'react';
import { observer } from "mobx-react-lite"
import { Button } from 'semantic-ui-react'

import styles from 'components/LayoutVert.module.css';
import { useStore } from 'stores/MainStore';
import { Board } from 'components/board/Board';
import { NextBlock } from 'components/NextBlock';
import { ScoreBoard } from 'components/ScoreBoard';
import { GameState } from 'utils/helpers';

const cancelTouch = (e: React.TouchEvent) => e.stopPropagation();

const LayoutVert = observer(() => {
	const mainStore = useStore();

	return (
		<div className={styles.root}>
			<div className={styles.top}>
				<div className={styles.content}>
					<div className={styles.buttonsLeft}>
						{(mainStore.gameState === GameState.Active || mainStore.gameState === GameState.Paused) ? (
							<Button icon='stop' onTouchStart={cancelTouch} onClick={e => mainStore.endGame()} />
						) : (
							<Button icon='play' onTouchStart={cancelTouch} onClick={e => mainStore.newGame()} />
						)}
						{mainStore.gameState === GameState.Active && (
							<Button icon='pause' onTouchStart={cancelTouch} onClick={e => mainStore.pause()} />
						)}
						{mainStore.gameState === GameState.Paused && (
							<Button icon='play' onTouchStart={cancelTouch} onClick={e => mainStore.resume()} />
						)}
					</div>
					<NextBlock className={styles.nextBlock} />
					<ScoreBoard className={styles.scoreBoard} />
					<div className={styles.buttonsRight}>
						<Button icon='trophy' onTouchStart={cancelTouch} onClick={e => mainStore.showHighScores()} />
						<Button icon='setting' onTouchStart={cancelTouch} onClick={e => mainStore.showPrefs()} />
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
