import React from 'react';
import { observer } from "mobx-react-lite"

import styles from 'components/board/StatusOverlay.module.css';
import { useStore } from 'stores/MainStore';
import { GameState, getShortKeyStr } from 'utils/helpers';
import { ReactComponent as Logo } from 'assets/logo.svg';
import { Icon } from 'semantic-ui-react';

const StatusOverlay = observer(() => {
	const mainStore = useStore();
	const preferencesStore = mainStore.preferencesStore;
	const keys = preferencesStore.prefs.keys;
	const prefsStyles = preferencesStore.prefs.styles;
	const useTouch = 'ontouchstart' in window;

	return (
		<div className={styles.root} style={{ color: prefsStyles.textColor }}>
			{mainStore.gameState === GameState.Paused ? (
				<div className={styles.overlay + ' ' + styles.paused} style={{ borderColor: prefsStyles.gridColor }}>
					Paused
					<Icon name='close' onClick={() => mainStore.resume()} />
				</div>
			) : (mainStore.gameState === GameState.Ended ? (
				<div className={styles.overlay + ' ' + styles.ended} style={{ borderColor: prefsStyles.gridColor }}>
					Game Over
					<Icon name='close' onClick={() => mainStore.endGame()} />
				</div>
			) : (mainStore.gameState === GameState.Reset ? (
				<div className={styles.overlay + ' ' + styles.welcome} style={{ borderColor: prefsStyles.gridColor }}>
					<h3><Logo /> Welcome to Blocks!</h3>
					{useTouch ? (<>
						<p><button className={styles.link} onClick={() => mainStore.showTouchDemo()}>Show Play Controls</button></p>
						<p className={styles.optional}>Tap the left half of the screen to rotate, and the right half to move left/right.</p>
						<p className={styles.optional}>Swipe left/right to move to the edges. Swipe down to drop, and up to undo.</p>
					</>) : (<>
						<p className={styles.optional}>Use {getShortKeyStr(keys.left)}/{getShortKeyStr(keys.right)}/{getShortKeyStr(keys.down)}/{getShortKeyStr(keys.drop)} to
						move/drop, {getShortKeyStr(keys.rotateCCW)}/{getShortKeyStr(keys.rotateCW)} to rotate, and {getShortKeyStr(keys.pauseResumeGame)} to pause.</p>
						<p className={styles.optional}>You can customize these keys and more in Preferences.</p>
					</>)}
					<p className={styles.optional}>
						<a className={styles.link} href="https://github.com/jacobweber/blocks" rel="noopener noreferrer" target="_blank">source</a>
						<a className={styles.link} href="https://github.com/jacobweber/blocks/issues/new" rel="noopener noreferrer" target="_blank">report bug</a>
					</p>
				</div>
			) : null))}
		</div>
	);
});

export { StatusOverlay };
