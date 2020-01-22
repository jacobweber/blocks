import React from 'react';
import { observer } from "mobx-react-lite"
import { useStore } from '../stores/MainStore';

import './App.css';
import { Board } from './Board';

const App = observer(() => {
	const mainStore = useStore();

	return (
		<div className="root" onKeyDown={e => mainStore.keyDown(e)} onKeyUp={e => mainStore.keyUp(e)}>
			<div className='buttons'>
				<button onClick={() => mainStore.randomize()}>Randomize</button>
				<button onClick={() => mainStore.newGame()}>Start</button>
				<button onClick={() => mainStore.newBlock()}>Block</button>
				<button onClick={() => mainStore.rotateCCW()}>CCW</button>
				<button onClick={() => mainStore.rotateCW()}>CW</button>
				<button onClick={() => mainStore.left()}>Left</button>
				<button onClick={() => mainStore.right()}>Right</button>
				<button onClick={() => mainStore.down()}>Down</button>
				<button onClick={() => mainStore.drop()}>Drop</button>
			</div>
			<Board />
		</div>
	);
});

export { App };
