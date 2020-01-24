import React from 'react';
import { observer } from "mobx-react-lite"
import { useStore } from '../stores/MainStore';
import { Button, Header, Icon, Modal } from 'semantic-ui-react'

import './Preferences.css';

const Preferences = observer(() => {
	const preferencesStore = useStore().preferencesStore;
	const hide = () => preferencesStore.hide();
	const save = () => preferencesStore.save();

	return (
		<Modal open={true} closeIcon onClose={hide}>
			<Header icon='setting' content='Preferences' />
			<Modal.Content>
				test
			</Modal.Content>
			<Modal.Actions>
				<Button onClick={hide} color='red'>
					<Icon name='remove' /> Cancel
				</Button>
				<Button onClick={save} color='green'>
					<Icon name='checkmark' /> Save
				</Button>
			</Modal.Actions>
		</Modal>
	);
});

export { Preferences };
