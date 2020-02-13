import React from 'react';
import { observer } from "mobx-react-lite"

import styles from 'components/board/StatusOverlay.module.css';
import { useStore } from 'stores/MainStore';
import { GameState, getDisplayKeyStr } from 'utils/helpers';
import { ReactComponent as Logo } from 'assets/logo.svg';

const StatusOverlay = observer(() => {
	const mainStore = useStore();
	const preferencesStore = mainStore.preferencesStore;
 	const keys = preferencesStore.prefs.keys;
 	const prefsStyles = preferencesStore.prefs.styles;

	return (
		<div className={styles.root} style={{ color: prefsStyles.textColor }}>
			{mainStore.gameState === GameState.Paused ? (
				<div className={styles.overlay + ' ' + styles.paused} style={{ borderColor: prefsStyles.gridColor }}>Paused</div>
			) : (mainStore.gameState === GameState.Ended ? (
				<div className={styles.overlay + ' ' + styles.ended} style={{ borderColor: prefsStyles.gridColor }}>Game Over</div>
			) : (mainStore.gameState === GameState.Reset ? (
				<div className={styles.overlay + ' ' + styles.welcome} style={{ borderColor: prefsStyles.gridColor }}>
					<h3><Logo /> Welcome to Blocks!</h3>
					<p>Use {getDisplayKeyStr(keys.left)}/{getDisplayKeyStr(keys.right)}/{getDisplayKeyStr(keys.down)}/{getDisplayKeyStr(keys.drop)} 
					to move/drop, and {getDisplayKeyStr(keys.rotateCCW)}/{getDisplayKeyStr(keys.rotateCW)} to rotate.</p>
					<p>You can customize these keys and more in Preferences.</p>
				</div>
			) : null))}
		</div>
	);
});

export { StatusOverlay };
