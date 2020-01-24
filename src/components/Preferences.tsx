import React from 'react';
import { observer } from "mobx-react-lite"
import { Button, Header, Icon, Modal, Form } from 'semantic-ui-react'
import { useStore } from '../stores/MainStore';

import styles from './Preferences.module.css';
import { KeySelector } from './KeySelector';

const Preferences = observer(() => {
	const preferencesStore = useStore().preferencesStore;
	const keys = preferencesStore.prefs.keys;
	const hide = () => preferencesStore.dialogHide();
	const save = () => preferencesStore.dialogSave();

	return (
		<Modal className={styles.root} open={true} closeIcon onClose={hide}>
			<Header icon='setting' content='Preferences' />
			<Modal.Content scrolling>
				<Form>
					<Form.Group>
						<Form.Field>
							<label>New Game</label>
							<KeySelector onKeyDown={e => preferencesStore.handleDialogKeySelectorKeyDown(e, 'newGame')} name='newGame' value={keys.newGame} />
						</Form.Field>

						<Form.Field>
							<label>End Game</label>
							<KeySelector onKeyDown={e => preferencesStore.handleDialogKeySelectorKeyDown(e, 'endGame')} name='endGame' value={keys.endGame} />
						</Form.Field>

						<Form.Field>
							<label>Pause/Resume Game</label>
							<KeySelector onKeyDown={e => preferencesStore.handleDialogKeySelectorKeyDown(e, 'pauseResumeGame')} name='pauseResumeGame' value={keys.pauseResumeGame} />
						</Form.Field>

						<Form.Field>
							<label>Left</label>
							<KeySelector onKeyDown={e => preferencesStore.handleDialogKeySelectorKeyDown(e, 'left')} name='left' value={keys.left} />
						</Form.Field>
					</Form.Group>

					<Form.Group>
						<Form.Field>
							<label>Right</label>
							<KeySelector onKeyDown={e => preferencesStore.handleDialogKeySelectorKeyDown(e, 'right')} name='right' value={keys.right} />
						</Form.Field>

						<Form.Field>
							<label>Down</label>
							<KeySelector onKeyDown={e => preferencesStore.handleDialogKeySelectorKeyDown(e, 'down')} name='down' value={keys.down} />
						</Form.Field>

						<Form.Field>
							<label>Drop</label>
							<KeySelector onKeyDown={e => preferencesStore.handleDialogKeySelectorKeyDown(e, 'drop')} name='drop' value={keys.drop} />
						</Form.Field>

						<Form.Field>
							<label>Rotate Left</label>
							<KeySelector onKeyDown={e => preferencesStore.handleDialogKeySelectorKeyDown(e, 'rotateCCW')} name='rotateCCW' value={keys.rotateCCW} />
						</Form.Field>
					</Form.Group>

					<Form.Group>
						<Form.Field>
							<label>Rotate Right</label>
							<KeySelector onKeyDown={e => preferencesStore.handleDialogKeySelectorKeyDown(e, 'rotateCW')} name='rotateCW' value={keys.rotateCW} />
						</Form.Field>

						<Form.Field>
							<label>Undo</label>
							<KeySelector onKeyDown={e => preferencesStore.handleDialogKeySelectorKeyDown(e, 'undo')} name='undo' value={keys.undo} />
						</Form.Field>
		          	</Form.Group>
				</Form>
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
