import React from 'react';
import { observer } from "mobx-react-lite"

import styles from 'components/LayoutHorizTouch.module.css';
import { useStore } from 'stores/MainStore';
import { Board } from 'components/board/Board';
import { NextBlock } from 'components/NextBlock';
import { ScoreBoard } from 'components/ScoreBoard';
import { GameState } from 'utils/helpers';
import { CustomButton } from 'components/CustomButton';

const cancelTouch = (e: React.TouchEvent) => e.stopPropagation();

const LayoutHorizTouch = observer(() => {
	const mainStore = useStore();
	const boardStore = mainStore.boardStore;

	return (
		<div className={styles.root}>
			<div className={styles.left}>
				<Board />
			</div>
			<div className={styles.right}
				style={{
					height: Math.min(400, Math.max(310, boardStore.actualPointSize * boardStore.height))
				}}
			>
				<div className={styles.buttons}>
					{(mainStore.gameState === GameState.Active || mainStore.gameState === GameState.Paused) ? (
						<CustomButton outlined icon='stop' onTouchStart={cancelTouch} onClick={e => mainStore.endGame()} />
					) : (
						<CustomButton outlined icon='play' onTouchStart={cancelTouch} onClick={e => {e.currentTarget.blur(); mainStore.newGame();}} />
					)}
					<CustomButton outlined icon='trophy' onTouchStart={cancelTouch} onClick={e => mainStore.showHighScores()} />
				</div>
				<div className={styles.buttons}>
					{mainStore.gameState === GameState.Active ? (
						<CustomButton outlined icon='pause' onTouchStart={cancelTouch} onClick={e => mainStore.pause()} />
					) : (mainStore.gameState === GameState.Paused ? (
						<CustomButton outlined icon='play' onTouchStart={cancelTouch} onClick={e => mainStore.resume()} />
					) : (
						<CustomButton outlined icon='puzzle piece' onTouchStart={cancelTouch} onClick={e => mainStore.newGameOptions()} />
					))}
					<CustomButton outlined icon='setting' onTouchStart={cancelTouch} onClick={e => mainStore.showPrefs()} />
				</div>
				<NextBlock pointSize={15} className={styles.nextBlock} />
				<ScoreBoard className={styles.scoreBoard} />
			</div>
		</div>
	);
});

export { LayoutHorizTouch };
