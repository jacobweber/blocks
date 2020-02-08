import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { observer } from "mobx-react-lite"
import { Button, Header, Icon, Modal, Table, Confirm, Form, Input } from 'semantic-ui-react'

import styles from 'components/HighScores.module.css';
import { useStore } from 'stores/MainStore';

const HighScores = observer(() => {
	const highScoresStore = useStore().highScoresStore;
	const hide = () => highScoresStore.dialogHide();
	const [ confirmOpen, setConfirmOpen ] = useState(false);
	const reset = () => setConfirmOpen(true);
	const cancelReset = () => setConfirmOpen(false);
	const confirmReset = () => {
		setConfirmOpen(false);
		highScoresStore.dialogReset();
	}
	const inputRef = useRef<Input>(null);
	useEffect(() => {
		if (inputRef.current) {
			const dom = ReactDOM.findDOMNode(inputRef.current); // TODO: remove hack
			if (dom instanceof HTMLElement) {
				const input = dom.querySelector('input');
				if (input) input.scrollIntoView();
			}
		}
	}, []);

	return (<>
		<Confirm
			content='Are you sure you want to reset the high scores?'
			open={confirmOpen}
			onCancel={cancelReset}
			onConfirm={confirmReset}
			confirmButton='Reset'
		/>
		<Modal className={styles.root} open={true} closeIcon onClose={hide}>
			<Header icon='trophy' content='High Scores' />
			<Modal.Content scrolling>

				<Table unstackable celled striped>
					<Table.Header>
						<Table.Row>
							<Table.HeaderCell>Name</Table.HeaderCell>
							<Table.HeaderCell textAlign='right'>Score</Table.HeaderCell>
							<Table.HeaderCell textAlign='right'>Lines</Table.HeaderCell>
							<Table.HeaderCell textAlign='right'>LPM</Table.HeaderCell>
							<Table.HeaderCell textAlign='right'>Level</Table.HeaderCell>
							<Table.HeaderCell>Date</Table.HeaderCell>
						</Table.Row>
					</Table.Header>

					<Table.Body>
						{highScoresStore.scores.entries.map((entry, index) => (
							<Table.Row key={index} positive={highScoresStore.lastPosition === index}>
								<Table.Cell>
									{highScoresStore.lastPosition === index ? (
										<Form.Field>
											<Input ref={inputRef} onChange={e => highScoresStore.handleChangeLastScoreName(e)} value={highScoresStore.lastScoreName} />
										</Form.Field>
									) : entry.name}
								</Table.Cell>
								<Table.Cell textAlign='right'>{entry.score.toLocaleString()}</Table.Cell>
								<Table.Cell textAlign='right'>{entry.rows}</Table.Cell>
								<Table.Cell textAlign='right'>{(entry.rows / (entry.totalTime / 1000 / 60)).toFixed(1)}</Table.Cell>
								<Table.Cell textAlign='right'>{entry.startLevel}-{entry.endLevel}</Table.Cell>
								<Table.Cell>{new Date(entry.time).toLocaleString()}</Table.Cell>
							</Table.Row>
						))}
					</Table.Body>
				</Table>

			</Modal.Content>
			<Modal.Actions>
				<Button onClick={reset} color='red'>
					<Icon name='undo' /> Reset
				</Button>
				<Button onClick={hide} color='green'>
					<Icon name='checkmark' /> OK
				</Button>
			</Modal.Actions>
		</Modal>
	</>);
});

export { HighScores };
