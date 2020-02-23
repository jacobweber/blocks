import React from 'react';
import ReactDOM from 'react-dom';
import { configure } from 'mobx';
import 'fomantic-ui-css/semantic.min.css';

import './index.css';
import * as serviceWorker from './serviceWorker';
import { MainStore, StoreContext } from 'stores/MainStore';
import { App } from 'components/App';

const startApp = () => {
	configure({ enforceActions: "observed" });

	if ((window as any).plugins && (window as any).plugins.insomnia) {
		(window as any).plugins.insomnia.keepAwake();
	}

	const mainStore = new MainStore();
	mainStore.initWindowEvents();
	(window as any).mainStore = mainStore;

	ReactDOM.render(
		<StoreContext.Provider value={mainStore}>
			<App />
		</StoreContext.Provider>,
		document.getElementById('root')
	);

	if ((navigator as any).splashscreen) {
		(navigator as any).splashscreen.hide();
	}

	// If you want your app to work offline and load faster, you can change
	// unregister() to register() below. Note this comes with some pitfalls.
	// Learn more about service workers: https://bit.ly/CRA-PWA
	serviceWorker.unregister();
};

if ((window as any).cordova || window.navigator.userAgent.indexOf('cordova-remote') > -1) {
	document.addEventListener('deviceready', startApp, false);
} else {
	startApp();
};
