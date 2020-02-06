import React, { useState } from 'react';
import { observer } from "mobx-react-lite"
import { Button, Header, Icon, Modal, Form, Input, Checkbox, Confirm } from 'semantic-ui-react'
import { useStore } from '../stores/MainStore';

import styles from './Preferences.module.css';
import { ActionName } from '../utils/helpers';

const Preferences = observer(() => {
	const preferencesStore = useStore().preferencesStore;
	const keys = preferencesStore.prefs.keys;
	const prefsStyles = preferencesStore.prefs.styles;
	const save = () => preferencesStore.dialogSave();
	const onKeyDown = (name: ActionName) => (e: React.KeyboardEvent) => preferencesStore.handleDialogKeySelectorKeyDown(e, name);
	const colorProps = /^((?!chrome|android).)*safari/i.test(navigator.userAgent) ? {} : {
		type: 'color',
		className: styles.colorInput
	}; // breaks on safari

	const [ confirmOpen, setConfirmOpen ] = useState(false);
	const reset = () => setConfirmOpen(true);
	const cancelReset = () => setConfirmOpen(false);
	const confirmReset = () => {
		setConfirmOpen(false);
		preferencesStore.dialogReset();
	}

	return (<>
		<Confirm
			content='Are you sure you want to reset the preferences?'
			open={confirmOpen}
			onCancel={cancelReset}
			onConfirm={confirmReset}
			confirmButton='Reset'
		/>

		<Modal className={styles.root} open={true} closeIcon onClose={save}>
			<Header icon='setting' content='Preferences' />
			<Modal.Content scrolling>
				<Form>
					<Form.Group>
						<Form.Field>
							<label>Your Name</label>
							<Input onChange={e => preferencesStore.handleChangeText(e, 'name')} value={preferencesStore.prefs.name} />
						</Form.Field>
					</Form.Group>

					<Form.Group>
						<Form.Field>
							<Checkbox
								label='Allow Undo'
								onChange={e => preferencesStore.handleChangeAllowUndo(e)}
								checked={preferencesStore.prefs.allowUndo} />
						</Form.Field>
					</Form.Group>

					<Form.Group>
						<Form.Field>
							<label>Accelerate Left/Right after holding for</label>
							<Input
								label={{ basic: true, content: 'ms' }}
								labelPosition='right'
								onChange={e => preferencesStore.handleChangeLeftRightAccel(e)}
								value={preferencesStore.prefs.leftRightAccelAfterMS}
							/>
						</Form.Field>
					</Form.Group>

					<Header as='h3' dividing>Keyboard Controls</Header>
					<Form.Group>
						<Form.Field className={styles.cell}>
							<label>New Game</label>
							<Input fluid onKeyDown={onKeyDown('newGame')} name='newGame' value={keys.newGame} />
						</Form.Field>
						<Form.Field className={styles.cell}>
							<label>New Game with Options</label>
							<Input fluid onKeyDown={onKeyDown('newGameOptions')} name='newGameOptions' value={keys.newGameOptions} />
						</Form.Field>
						<Form.Field className={styles.cell}>
							<label>End Game</label>
							<Input fluid onKeyDown={onKeyDown('endGame')} name='endGame' value={keys.endGame} />
						</Form.Field>
						<Form.Field className={styles.cell}>
							<label>Pause/Resume Game</label>
							<Input fluid onKeyDown={onKeyDown('pauseResumeGame')} name='pauseResumeGame' value={keys.pauseResumeGame} />
						</Form.Field>
					</Form.Group>

					<Form.Group>
						<Form.Field className={styles.cell}>
							<label>Left</label>
							<Input fluid onKeyDown={onKeyDown('left')} name='left' value={keys.left} />
						</Form.Field>
						<Form.Field className={styles.cell}>
							<label>Right</label>
							<Input fluid onKeyDown={onKeyDown('right')} name='right' value={keys.right} />
						</Form.Field>
						<Form.Field className={styles.cell}>
							<label>Down</label>
							<Input fluid onKeyDown={onKeyDown('down')} name='down' value={keys.down} />
						</Form.Field>
						<Form.Field className={styles.cell}>
							<label>Drop</label>
							<Input fluid onKeyDown={onKeyDown('drop')} name='drop' value={keys.drop} />
						</Form.Field>
					</Form.Group>

					<Form.Group>
						<Form.Field className={styles.cell}>
							<label>Rotate Left</label>
							<Input fluid onKeyDown={onKeyDown('rotateCCW')} name='rotateCCW' value={keys.rotateCCW} />
						</Form.Field>
						<Form.Field className={styles.cell}>
							<label>Rotate Right</label>
							<Input fluid onKeyDown={onKeyDown('rotateCW')} name='rotateCW' value={keys.rotateCW} />
						</Form.Field>
						<Form.Field className={styles.cell}>
							<label>Undo</label>
							<Input fluid onKeyDown={onKeyDown('undo')} name='undo' value={keys.undo} />
						</Form.Field>
		          	</Form.Group>

					<Header as='h3' dividing>Styles</Header>
					<Form.Group>
						<Form.Field className={styles.cell}>
							<label>Background</label>
							<Input {...colorProps} onChange={e => preferencesStore.handleDialogColorChange(e, 'backgroundColor')} value={prefsStyles.backgroundColor} />
						</Form.Field>
						<Form.Field className={styles.cell}>
							<label>Text</label>
							<Input  {...colorProps} onChange={e => preferencesStore.handleDialogColorChange(e, 'textColor')} value={prefsStyles.textColor} />
						</Form.Field>
						<Form.Field className={styles.cell}>
							<label>Grid</label>
							<Input  {...colorProps} onChange={e => preferencesStore.handleDialogColorChange(e, 'gridColor')} value={prefsStyles.gridColor} />
						</Form.Field>
						<Form.Field className={styles.cell}>
							<label>Outline</label>
							<Input {...colorProps} onChange={e => preferencesStore.handleDialogColorChange(e, 'outlineColor')} value={prefsStyles.outlineColor} />
						</Form.Field>
					</Form.Group>
				</Form>
			</Modal.Content>
			<Modal.Actions>
				<Button onClick={reset} color='red'>
					<Icon name='undo' /> Reset
				</Button>
				<Button onClick={save} color='green'>
					<Icon name='checkmark' /> Save
				</Button>
			</Modal.Actions>
		</Modal>
	</>);
});

export { Preferences };
