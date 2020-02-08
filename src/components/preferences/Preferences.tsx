import React, { useState } from 'react';
import { observer } from "mobx-react-lite"
import { Button, Header, Icon, Modal, Form, Input, Checkbox, Confirm } from 'semantic-ui-react'

import styles from 'components/preferences/Preferences.module.css';
import { useStore } from 'stores/MainStore';
import { KeyActionName } from 'utils/helpers';
import { Block } from 'components/preferences/Block';
import { BlockEdit } from 'components/preferences/BlockEdit';
import { PointDefs } from 'components/points/Standard';

const Preferences = observer(() => {
	const preferencesStore = useStore().preferencesStore;
	const form = preferencesStore.form;
	const keys = form.keys;
	const prefsStyles = form.styles;
	const cancel = () => preferencesStore.dialogCancel();
	const save = () => preferencesStore.dialogSave();
	const handleKeySelectorKeyDown = (name: KeyActionName) => (e: React.KeyboardEvent) => preferencesStore.handleDialogKeySelectorKeyDown(e, name);
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

		<div className={styles.pointDefs}>
			<PointDefs prefix={preferencesStore.symbolPrefix} blockColors={preferencesStore.formBlockColors} />
		</div>

		{preferencesStore.blockEditStore.visible && <BlockEdit />}

		<Modal className={styles.root} open={true} closeIcon onClose={cancel}>
			<Header icon='setting' content='Preferences' />
			<Modal.Content scrolling>
				<Form>
					<Form.Group>
						<Form.Field>
							<label>Your Name</label>
							<Input onChange={e => preferencesStore.handleChangeText(e, 'name')} value={form.name} />
						</Form.Field>
					</Form.Group>

					<Form.Group>
						<Form.Field>
							<Checkbox
								label='Allow Undo'
								onChange={e => preferencesStore.handleChangeAllowUndo(e)}
								checked={form.allowUndo} />
						</Form.Field>
					</Form.Group>

					<Form.Group>
						<Form.Field>
							<label>Accelerate Left/Right after holding for</label>
							<Input
								label={{ basic: true, content: 'ms' }}
								labelPosition='right'
								onChange={e => preferencesStore.handleChangeInteger(e, 'leftRightAccelAfterMS')}
								value={form.leftRightAccelAfterMS}
							/>
						</Form.Field>
						<Form.Field>
							<label>Board Width</label>
							<Input onChange={e => preferencesStore.handleChangeInteger(e, 'width')} value={form.width} />
						</Form.Field>
						<Form.Field>
							<label>Board Height</label>
							<Input onChange={e => preferencesStore.handleChangeInteger(e, 'height')} value={form.height} />
						</Form.Field>
					</Form.Group>

					<Header as='h3' dividing>Keyboard Controls</Header>
					<Form.Group>
						<Form.Field className={styles.cell}>
							<label>New Game</label>
							<Input fluid onKeyDown={handleKeySelectorKeyDown('newGame')} name='newGame' value={keys.newGame} />
						</Form.Field>
						<Form.Field className={styles.cell}>
							<label>New Game with Options</label>
							<Input fluid onKeyDown={handleKeySelectorKeyDown('newGameOptions')} name='newGameOptions' value={keys.newGameOptions} />
						</Form.Field>
						<Form.Field className={styles.cell}>
							<label>End Game</label>
							<Input fluid onKeyDown={handleKeySelectorKeyDown('endGame')} name='endGame' value={keys.endGame} />
						</Form.Field>
						<Form.Field className={styles.cell}>
							<label>Pause/Resume Game</label>
							<Input fluid onKeyDown={handleKeySelectorKeyDown('pauseResumeGame')} name='pauseResumeGame' value={keys.pauseResumeGame} />
						</Form.Field>
					</Form.Group>

					<Form.Group>
						<Form.Field className={styles.cell}>
							<label>Left</label>
							<Input fluid onKeyDown={handleKeySelectorKeyDown('left')} name='left' value={keys.left} />
						</Form.Field>
						<Form.Field className={styles.cell}>
							<label>Right</label>
							<Input fluid onKeyDown={handleKeySelectorKeyDown('right')} name='right' value={keys.right} />
						</Form.Field>
						<Form.Field className={styles.cell}>
							<label>Down</label>
							<Input fluid onKeyDown={handleKeySelectorKeyDown('down')} name='down' value={keys.down} />
						</Form.Field>
						<Form.Field className={styles.cell}>
							<label>Drop</label>
							<Input fluid onKeyDown={handleKeySelectorKeyDown('drop')} name='drop' value={keys.drop} />
						</Form.Field>
					</Form.Group>

					<Form.Group>
						<Form.Field className={styles.cell}>
							<label>Rotate Left</label>
							<Input fluid onKeyDown={handleKeySelectorKeyDown('rotateCCW')} name='rotateCCW' value={keys.rotateCCW} />
						</Form.Field>
						<Form.Field className={styles.cell}>
							<label>Rotate Right</label>
							<Input fluid onKeyDown={handleKeySelectorKeyDown('rotateCW')} name='rotateCW' value={keys.rotateCW} />
						</Form.Field>
						<Form.Field className={styles.cell}>
							<label>Undo</label>
							<Input fluid onKeyDown={handleKeySelectorKeyDown('undo')} name='undo' value={keys.undo} />
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

					<Header as='h3' dividing>
						Blocks
						<Header.Subheader>Changes will apply to next game.</Header.Subheader>
					</Header>
					<div className={styles.blocks}>
						{form.blockDefs.map((def, idx) => (
							<div key={idx} className={styles.block}>
								<Button type='button' basic onClick={e => preferencesStore.blockEditStore.dialogShowEdit(idx, def)}>
									<Block def={def} prefix='prefs-' />
								</Button>
							</div>
						))}
						<div className={styles.block + ' ' + styles.addBlock}>
							<Button type='button' basic onClick={e => preferencesStore.blockEditStore.dialogShowAdd()}>
								<Icon size='huge' name='add' />
								Add...
							</Button>
						</div>
					</div>
				</Form>
			</Modal.Content>
			<Modal.Actions>
				<Button onClick={cancel} color='red'>
					<Icon name='cancel' /> Cancel
				</Button>
				<Button onClick={reset} color='black'>
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
