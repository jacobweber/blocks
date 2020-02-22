import React from 'react';
import { observer } from "mobx-react-lite"

import styles from 'components/LayoutVertTouch.module.css';
import { useStore } from 'stores/MainStore';
import { Board } from 'components/board/Board';
import { NextBlock } from 'components/NextBlock';
import { ScoreBoard } from 'components/ScoreBoard';
import { GameState } from 'utils/helpers';
import { CustomButton } from 'components/CustomButton';

const cancelTouch = (e: React.TouchEvent) => e.stopPropagation();

const LayoutVertTouch = observer(() => {
	const mainStore = useStore();

	return (
		<div className={styles.root}>
			<div className={styles.top}>
				{(mainStore.gameState === GameState.Active || mainStore.gameState === GameState.Paused) ? (
					<div className={styles.buttons}>
						<CustomButton icon='stop' onTouchStart={cancelTouch} onClick={e => mainStore.endGame()} />
						{mainStore.gameState === GameState.Active ? (
							<CustomButton icon='pause' onTouchStart={cancelTouch} onClick={e => mainStore.pause()} />
						) : (
							<CustomButton icon='play' onTouchStart={cancelTouch} onClick={e => mainStore.resume()} />
						)}
					</div>
				) : (
					<div className={styles.buttons}>
						<CustomButton icon='play' onTouchStart={cancelTouch} onClick={e => mainStore.newGame()} />
						<CustomButton icon='plus' onTouchStart={cancelTouch} onClick={e => mainStore.newGameOptions()} />
					</div>
				)}
				<NextBlock pointSize={15} className={styles.nextBlock} />
				<ScoreBoard className={styles.scoreBoard} />
				<div className={styles.buttons}>
					<CustomButton icon='trophy' onTouchStart={cancelTouch} onClick={e => mainStore.showHighScores()} />
					<CustomButton icon='setting' onTouchStart={cancelTouch} onClick={e => mainStore.showPrefs()} />
				</div>
			</div>
			<div className={styles.bottom}>
				<Board />
			</div>
		</div>
	);
});

export { LayoutVertTouch };
