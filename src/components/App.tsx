import React from 'react';
import { observer } from "mobx-react-lite"
import { useStore } from '../stores/MainStore';
import { GameState } from '../utils/types';
import { Button } from 'semantic-ui-react'

import styles from './App.module.css';
import { Board } from './Board';
import { NextBlock } from './NextBlock';
import { Preferences } from './Preferences';

const App = observer(() => {
	const mainStore = useStore();
	const preferencesStore = mainStore.preferencesStore;
	return (
		<div className={styles.root}>
			<div className={styles.layout}>
				<Board />
				<div className={styles.right}>
					<div className={styles.nextBlock}>
						<NextBlock />
					</div>
					<div className={styles.gameState}>
						{mainStore.gameState === GameState.Paused && 'Paused'}
					</div>
					<div className={styles.preferences}>
						<Button onClick={e => preferencesStore.dialogShow()}>Preferences</Button>
						{preferencesStore.visible && <Preferences />}
					</div>
				</div>
			</div>
		</div>
	);
});

export { App };
