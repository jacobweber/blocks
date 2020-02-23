import React from 'react';
import { observer } from "mobx-react-lite"
import { Form, Input } from 'semantic-ui-react'

import styles from 'components/preferences/Preferences.module.css';
import { useStore } from 'stores/MainStore';
import { KeyActionName, getShortKeyStr } from 'utils/helpers';

const Keys = observer(() => {
	const preferencesStore = useStore().preferencesStore;
	const form = preferencesStore.form;
	const keys = form.keys;
	const handleChangeKey = (name: KeyActionName) => (e: React.KeyboardEvent) => preferencesStore.handleChangeKey(e, name);

	return (<>
		<Form.Group widths='equal'>
			<Form.Field className={styles.key}>
				<label htmlFor='keyNewGame'>New Game</label>
				<Input id='keyNewGame' fluid onKeyDown={handleChangeKey('newGame')} name='newGame' value={getShortKeyStr(keys.newGame)} />
			</Form.Field>
			<Form.Field className={styles.key}>
				<label htmlFor='keyNewGameOptions'>New Game with Options</label>
				<Input id='keyNewGameOptions' fluid onKeyDown={handleChangeKey('newGameOptions')} name='newGameOptions' value={getShortKeyStr(keys.newGameOptions)} />
			</Form.Field>
			<Form.Field className={styles.key}>
				<label htmlFor='keyEndGame'>End Game</label>
				<Input id='keyEndGame' fluid onKeyDown={handleChangeKey('endGame')} name='endGame' value={getShortKeyStr(keys.endGame)} />
			</Form.Field>
			<Form.Field className={styles.key}>
				<label htmlFor='keyPauseResumeGame'>Pause/Resume Game</label>
				<Input id='keyPauseResumeGame' fluid onKeyDown={handleChangeKey('pauseResumeGame')} name='pauseResumeGame' value={getShortKeyStr(keys.pauseResumeGame)} />
			</Form.Field>
		</Form.Group>

		<Form.Group widths='equal'>
			<Form.Field className={styles.key}>
				<label htmlFor='keyLeft'>Left</label>
				<Input id='keyLeft' fluid onKeyDown={handleChangeKey('left')} name='left' value={getShortKeyStr(keys.left)} />
			</Form.Field>
			<Form.Field className={styles.key}>
				<label htmlFor='keyRight'>Right</label>
				<Input id='keyRight' fluid onKeyDown={handleChangeKey('right')} name='right' value={getShortKeyStr(keys.right)} />
			</Form.Field>
			<Form.Field className={styles.key}>
				<label htmlFor='keyDown'>Down</label>
				<Input id='keyDown' fluid onKeyDown={handleChangeKey('down')} name='down' value={getShortKeyStr(keys.down)} />
			</Form.Field>
			<Form.Field className={styles.key}>
				<label htmlFor='keyDrop'>Drop</label>
				<Input id='keyDrop' fluid onKeyDown={handleChangeKey('drop')} name='drop' value={getShortKeyStr(keys.drop)} />
			</Form.Field>
		</Form.Group>

		<Form.Group widths='equal'>
			<Form.Field className={styles.key}>
				<label htmlFor='keyRotateCCW'>Rotate Left</label>
				<Input id='keyRotateCCW' fluid onKeyDown={handleChangeKey('rotateCCW')} name='rotateCCW' value={getShortKeyStr(keys.rotateCCW)} />
			</Form.Field>
			<Form.Field className={styles.key}>
				<label htmlFor='keyRotateCW'>Rotate Right</label>
				<Input id='keyRotateCW' fluid onKeyDown={handleChangeKey('rotateCW')} name='rotateCW' value={getShortKeyStr(keys.rotateCW)} />
			</Form.Field>
			<Form.Field className={styles.key}>
				<label htmlFor='keyUndo'>Undo Drop</label>
				<Input id='keyUndo' fluid onKeyDown={handleChangeKey('undo')} name='undo' value={getShortKeyStr(keys.undo)} />
			</Form.Field>
		</Form.Group>
	</>);
});

export { Keys };
