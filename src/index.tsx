import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';

import './index.css';
import { MainStore, StoreContext } from './stores/MainStore';
import { App } from './components/App';
import { configure } from 'mobx';

configure({ enforceActions: "observed" });

const mainStore = new MainStore();

ReactDOM.render(
	<StoreContext.Provider value={mainStore}>
		<App />
	</StoreContext.Provider>,
	document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
