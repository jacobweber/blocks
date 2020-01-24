import React from 'react';
import { observer } from "mobx-react-lite"
import { useStore, GameState } from '../stores/MainStore';

import 'bulma/css/bulma.css';
import './App.css';
import { Board } from './Board';
import { NextBlock } from './NextBlock';
import { Preferences } from './Preferences';

const App = observer(() => {
	const mainStore = useStore();
	const preferencesStore = mainStore.preferencesStore;
	return (
		<div className='root-app'>
			<div className='layout'>
				<Board />
				<div className='right'>
					<div className='nextBlock'>
						<NextBlock />
					</div>
					<div className='gameState'>
						{mainStore.gameState === GameState.Paused && 'Paused'}
					</div>
					<div className='preferences'>
						<button className="button" onClick={e => preferencesStore.show()}>Preferences</button>
						{preferencesStore.visible && <Preferences />}
					</div>
				</div>
			</div>
		</div>
	);
});

export { App };
