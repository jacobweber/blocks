import React from 'react';
import { observer } from "mobx-react-lite"

import styles from 'components/LayoutHoriz.module.css';
import { useStore } from 'stores/MainStore';
import { Board } from 'components/board/Board';
import { NextBlock } from 'components/NextBlock';
import { ScoreBoard } from 'components/ScoreBoard';
import { GameState } from 'utils/helpers';
import { CustomButton } from 'components/CustomButton';

const LayoutHoriz = observer(() => {
	const mainStore = useStore();
	const boardStore = mainStore.boardStore;

	return (
		<div className={styles.root}>
			<div className={styles.left}>
				<Board />
			</div>
			<div className={styles.right}
				style={{
					height: Math.max(600, boardStore.actualPointSize * boardStore.height)
				}}
			>
				<NextBlock className={styles.nextBlock} />
				<ScoreBoard className={styles.scoreBoard} />
				<div className={styles.buttonsBottom}>
					<div className={styles.button}>
						{mainStore.gameState === GameState.Active
							? <CustomButton fluid onClick={e => mainStore.endGame()}>End Game</CustomButton>
							: <CustomButton fluid onClick={e => mainStore.newGame()}>New Game</CustomButton>}
					</div>
					<div className={styles.button}>
						<CustomButton fluid onClick={e => mainStore.showHighScores()}>High Scores</CustomButton>
					</div>
					<div className={styles.button}>
						<CustomButton fluid onClick={e => mainStore.showPrefs()}>Preferences</CustomButton>
					</div>
				</div>
			</div>
		</div>
	);
});

export { LayoutHoriz };
