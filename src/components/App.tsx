import React from 'react';
import { observer } from "mobx-react-lite"

import styles from 'components/App.module.css';
import { useStore } from 'stores/MainStore';
import { Preferences } from 'components/preferences/Preferences';
import { HighScores } from 'components/HighScores';
import { NewGame } from 'components/NewGame';
import { LayoutHoriz } from 'components/LayoutHoriz';
import { LayoutVertTouch } from 'components/LayoutVertTouch';
import { LayoutHorizTouch } from './LayoutHorizTouch';

const App = observer(() => {
	const mainStore = useStore();
	const boardStore = mainStore.boardStore;
	const inputStore = mainStore.inputStore;
	const preferencesStore = mainStore.preferencesStore;
	const highScoresStore = mainStore.highScoresStore;
	const newGameStore = mainStore.newGameStore;
	const useTouch = 'ontouchstart' in window;

	return (
		<div
			className={styles.root}
			style={{ backgroundColor: preferencesStore.prefs.styles.backgroundColor }}
			onTouchStart={inputStore.touchStart}
			onTouchEnd={inputStore.touchEnd}
		>
			{useTouch ? (boardStore.vertical ? <LayoutVertTouch /> : <LayoutHorizTouch />) : <LayoutHoriz />}
			{newGameStore.visible && <NewGame />}
			{highScoresStore.visible && <HighScores />}
			{preferencesStore.visible && <Preferences />}
		</div>
	);
});

export { App };
