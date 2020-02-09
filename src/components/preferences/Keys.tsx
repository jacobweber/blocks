import React from 'react';
import { observer } from "mobx-react-lite"
import { Form, Input } from 'semantic-ui-react'

import styles from 'components/preferences/Preferences.module.css';
import { useStore } from 'stores/MainStore';
import { KeyActionName } from 'utils/helpers';

const Keys = observer(() => {
	const preferencesStore = useStore().preferencesStore;
	const form = preferencesStore.form;
	const keys = form.keys;
	const handleChangeKey = (name: KeyActionName) => (e: React.KeyboardEvent) => preferencesStore.handleChangeKey(e, name);

	return (<>
		<Form.Group>
			<Form.Field className={styles.cell}>
				<label>New Game</label>
				<Input fluid onKeyDown={handleChangeKey('newGame')} name='newGame' value={keys.newGame} />
			</Form.Field>
			<Form.Field className={styles.cell}>
				<label>New Game with Options</label>
				<Input fluid onKeyDown={handleChangeKey('newGameOptions')} name='newGameOptions' value={keys.newGameOptions} />
			</Form.Field>
			<Form.Field className={styles.cell}>
				<label>End Game</label>
				<Input fluid onKeyDown={handleChangeKey('endGame')} name='endGame' value={keys.endGame} />
			</Form.Field>
			<Form.Field className={styles.cell}>
				<label>Pause/Resume Game</label>
				<Input fluid onKeyDown={handleChangeKey('pauseResumeGame')} name='pauseResumeGame' value={keys.pauseResumeGame} />
			</Form.Field>
		</Form.Group>

		<Form.Group>
			<Form.Field className={styles.cell}>
				<label>Left</label>
				<Input fluid onKeyDown={handleChangeKey('left')} name='left' value={keys.left} />
			</Form.Field>
			<Form.Field className={styles.cell}>
				<label>Right</label>
				<Input fluid onKeyDown={handleChangeKey('right')} name='right' value={keys.right} />
			</Form.Field>
			<Form.Field className={styles.cell}>
				<label>Down</label>
				<Input fluid onKeyDown={handleChangeKey('down')} name='down' value={keys.down} />
			</Form.Field>
			<Form.Field className={styles.cell}>
				<label>Drop</label>
				<Input fluid onKeyDown={handleChangeKey('drop')} name='drop' value={keys.drop} />
			</Form.Field>
		</Form.Group>

		<Form.Group>
			<Form.Field className={styles.cell}>
				<label>Rotate Left</label>
				<Input fluid onKeyDown={handleChangeKey('rotateCCW')} name='rotateCCW' value={keys.rotateCCW} />
			</Form.Field>
			<Form.Field className={styles.cell}>
				<label>Rotate Right</label>
				<Input fluid onKeyDown={handleChangeKey('rotateCW')} name='rotateCW' value={keys.rotateCW} />
			</Form.Field>
			<Form.Field className={styles.cell}>
				<label>Undo</label>
				<Input fluid onKeyDown={handleChangeKey('undo')} name='undo' value={keys.undo} />
			</Form.Field>
		</Form.Group>
	</>);
});

export { Keys };
