import React from 'react';
import { observer } from "mobx-react-lite"

import styles from 'components/board/StatusOverlay.module.css';
import { useStore } from 'stores/MainStore';
import { GameState as State } from 'utils/helpers';

const StatusOverlay = observer(() => {
	const mainStore = useStore();
 	const prefsStyles = mainStore.preferencesStore.prefs.styles;

	return (
		<div className={styles.root} style={{ color: prefsStyles.textColor }}>
			{mainStore.gameState === State.Paused ? (
				<div className={styles.overlay + ' ' + styles.paused} style={{ borderColor: prefsStyles.gridColor }}>Paused</div>
			) : (mainStore.gameState === State.Ended ? (
				<div className={styles.overlay + ' ' + styles.ended} style={{ borderColor: prefsStyles.gridColor }}>Game Over</div>
			) : null)}
		</div>
	);
});

export { StatusOverlay };
