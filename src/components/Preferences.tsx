import React from 'react';
import { observer } from "mobx-react-lite"
import { useStore } from '../stores/MainStore';
import usePortal from 'react-useportal'

import './Preferences.css';

const Preferences = observer(() => {
	const { Portal } = usePortal();
	const preferencesStore = useStore().preferencesStore;
	const hide = () => preferencesStore.hide();
	const save = () => preferencesStore.save();

	return (
		<Portal>
			<div className='modal is-active'>
				<div className='modal-background' onClick={hide}></div>
				<div className='modal-card'>
					<header className='modal-card-head'>
						<p className='modal-card-title'>Preferences</p>
						<button className='delete' onClick={hide} aria-label='close'></button>
					</header>
					<section className='modal-card-body'>
					</section>
					<footer className='modal-card-foot'>
						<button onClick={save} className='button is-success'>Save</button>
						<button onClick={hide} className='button'>Cancel</button>
					</footer>
				</div>
			</div>
		</Portal>
	);
});

export { Preferences };
