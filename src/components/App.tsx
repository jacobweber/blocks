import React from 'react';
import { observer } from "mobx-react-lite"

import styles from 'components/App.module.css';
import { useStore } from 'stores/MainStore';
import { Preferences } from 'components/preferences/Preferences';
import { HighScores } from 'components/HighScores';
import { NewGame } from 'components/NewGame';
import { LayoutHoriz } from 'components/LayoutHoriz';
import { LayoutVert } from 'components/LayoutVert';

const App = observer(() => {
	const mainStore = useStore();
	const boardStore = mainStore.boardStore;
	const keyStore = mainStore.keyStore;
	const preferencesStore = mainStore.preferencesStore;
	const highScoresStore = mainStore.highScoresStore;
	const newGameStore = mainStore.newGameStore;

	return (
		<div
			className={styles.root}
			style={{ backgroundColor: preferencesStore.prefs.styles.backgroundColor }}
			onTouchStart={keyStore.touchStart}
			onTouchMove={keyStore.touchMove}
			onTouchEnd={keyStore.touchEnd}
		>
			{boardStore.vertical ? <LayoutVert /> : <LayoutHoriz />}
			{newGameStore.visible && <NewGame />}
			{highScoresStore.visible && <HighScores />}
			{preferencesStore.visible && <Preferences />}
		</div>
	);
});

export { App };
