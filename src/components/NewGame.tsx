import React, { useState } from 'react';
import { observer } from "mobx-react-lite"
import { Button, Header, Icon, Modal } from 'semantic-ui-react'
import { useStore } from '../stores/MainStore';

import styles from './NewGame.module.css';

const NewGame = observer(() => {
	const [ level, setLevel ] = useState(1);
	const [ rows, setRows ] = useState(0);
	const newGameStore = useStore().newGameStore;
	const cancel = () => newGameStore.dialogCancel();
	const ok = () => newGameStore.dialogOK(level, rows);

	return (<>
		<Modal className={styles.root} open={true} closeIcon onClose={cancel}>
			<Header icon='setting' content='New Game' />
			<Modal.Content scrolling>
				<Header as='h3' dividing>Start at Level</Header>
				<Button.Group>
					{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
						<Button active={level === val} key={val} onClick={() => setLevel(val)}>
							{val}
						</Button>
					))}
				</Button.Group>

				<Header as='h3' dividing>Rows of Randomness</Header>
				<Button.Group>
					{[0, 3, 6, 9, 12].map(val => (
						<Button active={rows === val} key={val} onClick={() => setRows(rows)}>
							{val === 0 ? 'None' : val}
						</Button>
					))}
				</Button.Group>
			</Modal.Content>
			<Modal.Actions>
				<Button onClick={cancel} color='red'>
					<Icon name='cancel' /> Cancel
				</Button>
				<Button onClick={ok} color='green'>
					<Icon name='checkmark' /> New Game
				</Button>
			</Modal.Actions>
		</Modal>
	</>);
});

export { NewGame };
