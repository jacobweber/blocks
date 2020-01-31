import React from 'react';
import { observer } from "mobx-react-lite"
import { useStore } from '../stores/MainStore';
import { GameState as State } from '../utils/types';

import styles from './GameState.module.css';

const GameState = observer(() => {
	const mainStore = useStore();

	return (
		<div className={styles.root}>
			{mainStore.gameState !== State.Stopped && (<>
				Score: {mainStore.score}<br />
				Lines: {mainStore.lines}<br />
				Level: {mainStore.level}<br />
			</>)}
			{mainStore.gameState === State.Paused && 'Paused'}
		</div>
	);
});

export { GameState };
