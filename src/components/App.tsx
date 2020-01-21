import React from 'react';
import { observer } from "mobx-react-lite"
import { useStore } from '../stores/MainStore';

import './App.css';
import { Board } from './Board';

const App = observer(() => {
	const mainStore = useStore();

	return (
		<div className="root" onKeyDown={e => mainStore.keyPressed(e)}>
			<div className='buttons'>
				<button onClick={() => mainStore.randomize()}>Randomize</button>
				<button onClick={() => mainStore.clear()}>Clear</button>
				<button onClick={() => mainStore.newPiece()}>Piece</button>
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
