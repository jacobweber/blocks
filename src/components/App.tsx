import React from 'react';
import { observer } from "mobx-react-lite"

import './App.css';
import { Board } from './Board';
import { NextBlock } from './NextBlock';

const App = observer(() => {
	return (
		<div className="root-app">
			<div className='layout'>
				<Board />
				<NextBlock />
			</div>
		</div>
	);
});

export { App };
