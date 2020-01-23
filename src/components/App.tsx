import React from 'react';
import { observer } from "mobx-react-lite"
import { useStore, GameState } from '../stores/MainStore';

import './App.css';
import { Board } from './Board';
import { NextBlock } from './NextBlock';

const App = observer(() => {
	const mainStore = useStore();
	return (
		<div className="root-app">
			<div className='layout'>
				<Board />
				<div className='right'>
					<div className='nextBlock'>
						<NextBlock />
					</div>
					<div className='gameState'>
						{mainStore.gameState === GameState.Paused && 'Paused'}
					</div>
				</div>
			</div>
		</div>
	);
});

export { App };
