import React from 'react';
import { observer } from "mobx-react-lite"
import { Button, Header, Icon, Modal, Table } from 'semantic-ui-react'
import { useStore } from '../stores/MainStore';

import styles from './HighScores.module.css';

const HighScores = observer(() => {
	const highScoresStore = useStore().highScoresStore;
	const reset = () => highScoresStore.dialogReset();
	const hide = () => highScoresStore.dialogHide();

	return (
		<Modal className={styles.root} open={true} closeIcon onClose={hide}>
			<Header icon='trophy' content='High Scores' />
			<Modal.Content scrolling>

				<Table unstackable celled striped>
					<Table.Header>
						<Table.Row>
							<Table.HeaderCell>Name</Table.HeaderCell>
							<Table.HeaderCell>Score</Table.HeaderCell>
							<Table.HeaderCell>Lines</Table.HeaderCell>
							<Table.HeaderCell>LPM</Table.HeaderCell>
							<Table.HeaderCell>Level</Table.HeaderCell>
							<Table.HeaderCell>Date</Table.HeaderCell>
						</Table.Row>
					</Table.Header>

					<Table.Body>
						{highScoresStore.scores.entries.map((entry, index) => (
							<Table.Row key={index} positive={highScoresStore.lastPosition === index}>
								<Table.Cell>{entry.name}</Table.Cell>
								<Table.Cell>{entry.score.toLocaleString()}</Table.Cell>
								<Table.Cell>{entry.rows}</Table.Cell>
								<Table.Cell>{(entry.rows / (entry.totalTime / 1000 / 60)).toFixed(1)}</Table.Cell>
								<Table.Cell>{entry.endLevel}</Table.Cell>
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
	);
});

export { HighScores };
