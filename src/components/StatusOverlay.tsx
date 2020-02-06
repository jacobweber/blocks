import React from 'react';
import { observer } from "mobx-react-lite"
import { useStore } from '../stores/MainStore';
import { GameState as State } from '../utils/types';

import styles from './StatusOverlay.module.css';

const StatusOverlay = observer(() => {
	const mainStore = useStore();
 	const prefsStyles = mainStore.preferencesStore.styles;

	return (
		<div className={styles.root} style={{ color: prefsStyles.textColor }}>
			{mainStore.gameState === State.Paused ? (
				<div className={styles.overlay + ' ' + styles.paused} style={{ borderColor: prefsStyles.gridColor }}>Paused</div>
			) : (mainStore.gameState === State.Stopped ? (
				<div className={styles.overlay + ' ' + styles.stopped} style={{ borderColor: prefsStyles.gridColor }}>Game Over</div>
			) : null)}
		</div>
	);
});

export { StatusOverlay };
