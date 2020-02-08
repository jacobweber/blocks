import React from 'react';
import { observer } from "mobx-react-lite"
import { Button, Header, Icon, Modal, Form, Input } from 'semantic-ui-react'

import styles from 'components/preferences/BlockEdit.module.css';
import { useStore } from 'stores/MainStore';
import { BlockBitmap } from 'components/preferences/BlockBitmap';
import { PointDefsSelector } from 'components/points/PointDefsSelector';

const fixOdds = function(odds: string): (number | '') {
	const val = parseInt(odds, 10);
	if (isNaN(val)) return '';
	return val;
};

const BlockEdit = observer(() => {
	const preferencesStore = useStore().preferencesStore;
	const blockEditStore = preferencesStore.blockEditStore;
	const { form, updateForm } = blockEditStore;

	const colorProps = /^((?!chrome|android).)*safari/i.test(navigator.userAgent) ? {} : {
		type: 'color',
		className: styles.colorInput
	}; // breaks on safari

	const cancel = () => blockEditStore.dialogCancel();
	const del = () => blockEditStore.dialogDelete();
	const ok = () => blockEditStore.dialogSave();

	return (<>
		<div className={styles.pointDefs}>
			<PointDefsSelector type={preferencesStore.form.points} prefix={blockEditStore.symbolPrefix} blockColors={blockEditStore.formBlockColors} />
		</div>

		<Modal className={styles.root} open={true} closeIcon onClose={cancel}>
			<Header icon='setting' content='Edit Block' />
			<Modal.Content>
				<Form>
					<Form.Group>
						<Form.Field>
							<label>Symbol ID</label>
							<Input onChange={e => updateForm({ id: e.target.value })} value={form.id} />
						</Form.Field>

						<Form.Field>
							<label>Frequency</label>
							<Input onChange={e => updateForm({ odds: fixOdds(e.target.value) })} value={form.odds} />
						</Form.Field>

						<Form.Field>
							<label>Color</label>
							<Input {...colorProps} onChange={e => updateForm({ color: e.target.value })} value={form.color} />
						</Form.Field>
					</Form.Group>

					<Form.Group>
						<Form.Field>
							<label>Size</label>
							<Button.Group>
								{[1, 2, 3, 4, 5].map(val => (
									<Button type='button' active={form.size === val} key={val} onClick={() => updateForm({ size: val })}>
										{val}
									</Button>
								))}
							</Button.Group>
						</Form.Field>

						<Form.Field>
							<label>Rotations</label>
							<Button.Group>
								<Button type='button' active={form.rotate90} onClick={() => updateForm({ rotate90: !form.rotate90 })}>
									90&deg;
								</Button>
								<Button type='button' active={form.rotate180} onClick={() => updateForm({ rotate180: !form.rotate180 })}>
									180&deg;
								</Button>
								<Button type='button' active={form.rotate270} onClick={() => updateForm({ rotate270: !form.rotate270 })}>
									270&deg;
								</Button>
							</Button.Group>
						</Form.Field>
					</Form.Group>

					<BlockBitmap prefix={blockEditStore.symbolPrefix} size={form.size} id={form.id} points={form.points} onChangePoints={points => updateForm({ points })} />
				</Form>
			</Modal.Content>
			<Modal.Actions>
				<Button onClick={cancel} color='red'>
					<Icon name='cancel' /> Cancel
				</Button>
				<Button onClick={del} color='black'>
					<Icon name='trash' /> Delete Block
				</Button>
				<Button onClick={ok} color='green'>
					<Icon name='checkmark' /> Save Block
				</Button>
			</Modal.Actions>
		</Modal>
	</>);
});

export { BlockEdit };
