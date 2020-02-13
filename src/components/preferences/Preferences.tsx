import React, { useState } from 'react';
import { observer } from "mobx-react-lite"
import { Button, Header, Icon, Modal, Form, Input, Checkbox, Confirm, CheckboxProps } from 'semantic-ui-react'

import styles from 'components/preferences/Preferences.module.css';
import { useStore } from 'stores/MainStore';
import { palettes } from 'utils/colors';
import { SampleBlock } from 'components/preferences/SampleBlock';
import { BlockEdit } from 'components/preferences/BlockEdit';
import { PointDefs } from 'components/points/PointDefs';
import { boardTypes, pointsTypes } from 'stores/PreferencesStore';
import { BoardDef } from 'components/boards/BoardDef';
import { Keys } from 'components/preferences/Keys';
import { ColorPicker } from './ColorPicker';
import { svgPrefix } from 'utils/helpers';

const Preferences = observer(() => {
	const preferencesStore = useStore().preferencesStore;
	const form = preferencesStore.form;
	const prefsStyles = form.styles;
	const cancel = () => preferencesStore.dialogCancel();
	const save = () => preferencesStore.dialogSave();

	const [ confirmOpen, setConfirmOpen ] = useState(false);
	const reset = () => setConfirmOpen(true);
	const cancelReset = () => setConfirmOpen(false);
	const confirmReset = () => {
		setConfirmOpen(false);
		preferencesStore.dialogReset();
	}

	return (
		<Modal className={styles.root} open={true} closeIcon onClose={cancel}>
			<Confirm
				content='Are you sure you want to reset the preferences?'
				open={confirmOpen}
				onCancel={cancelReset}
				onConfirm={confirmReset}
				confirmButton='Reset'
			/>

			<div className={styles.pointDefs}>
				{pointsTypes.map(type => (
					<PointDefs key={type} type={type} prefix={type + '-'} blockColors={preferencesStore.formBlockColors} />
				))}
				{boardTypes.map(type => (
					<BoardDef key={type} type={type} color={preferencesStore.form.styles.boardColor} prefix={type + '-'} />
				))}
			</div>

			{preferencesStore.blockEditStore.visible && <BlockEdit />}

			<Header icon='setting' content='Preferences' />
			<Modal.Content scrolling>
				<Form>
					<Form.Group>
						<Form.Field>
							<label htmlFor='prefsName'>Your Name</label>
							<Input id='prefsName' onChange={e => preferencesStore.handleChangeText(e, 'name')} value={form.name} />
						</Form.Field>
					</Form.Group>

					<Form.Group inline>
						<Form.Field>
							<Checkbox
								label='Allow Undo Drop'
								onChange={(e, data: CheckboxProps) => preferencesStore.handleChangeBoolean(e, 'allowUndo', data.checked)}
								checked={form.allowUndo} />
						</Form.Field>

						<Form.Field>
							<Checkbox
								label='Delay Final Drop While Moving'
								onChange={(e, data: CheckboxProps) => preferencesStore.handleChangeBoolean(e, 'delayFinalDrop', data.checked)}
								checked={form.delayFinalDrop} />
						</Form.Field>

						<Form.Field>
							<Checkbox
								label='Show Grid'
								onChange={(e, data: CheckboxProps) => preferencesStore.handleChangeBoolean(e, 'showGrid', data.checked)}
								checked={form.showGrid} />
						</Form.Field>
					</Form.Group>

					<Form.Group>
						<Form.Field>
							<label htmlFor='prefsLeftRightAccelAfterMS'>Accelerate Left/Right After Holding</label>
							<Input
								id='prefsLeftRightAccelAfterMS'
								label={{ basic: true, content: 'ms' }}
								labelPosition='right'
								onChange={e => preferencesStore.handleChangeInteger(e, 'leftRightAccelAfterMS')}
								value={form.leftRightAccelAfterMS}
							/>
						</Form.Field>
						<Form.Field>
							<label htmlFor='prefsWidth'>Board Width</label>
							<Input id='prefsWidth' onChange={e => preferencesStore.handleChangeInteger(e, 'width')} value={form.width} />
						</Form.Field>
						<Form.Field>
							<label htmlFor='prefsHeight'>Board Height</label>
							<Input id='prefsHeight' onChange={e => preferencesStore.handleChangeInteger(e, 'height')} value={form.height} />
						</Form.Field>
					</Form.Group>

					<Header as='h3' dividing>Keyboard Controls</Header>
					<Keys />

					<Header as='h3' dividing>Board Colors</Header>
					<Form.Group>
						<Form.Field className={styles.cell}>
							<label>Background</label>
							<ColorPicker onChange={(color: string) => preferencesStore.handleChangeColor(color, 'backgroundColor')} value={prefsStyles.backgroundColor} />
						</Form.Field>
						<Form.Field className={styles.cell}>
							<label>Text</label>
							<ColorPicker onChange={(color: string) => preferencesStore.handleChangeColor(color, 'textColor')} value={prefsStyles.textColor} />
						</Form.Field>
						<Form.Field className={styles.cell}>
							<label>Grid</label>
							<ColorPicker onChange={(color: string) => preferencesStore.handleChangeColor(color, 'gridColor')} value={prefsStyles.gridColor} />
						</Form.Field>
						<Form.Field className={styles.cell}>
							<label>Outline</label>
							<ColorPicker onChange={(color: string) => preferencesStore.handleChangeColor(color, 'outlineColor')} value={prefsStyles.outlineColor} />
						</Form.Field>
						<Form.Field className={styles.cell}>
							<label>Board</label>
							<ColorPicker onChange={(color: string) => preferencesStore.handleChangeColor(color, 'boardColor')} value={prefsStyles.boardColor} />
						</Form.Field>
					</Form.Group>

					<Header as='h3' dividing>
						Block Colors
						<Header.Subheader>Will replace any customized colors. Changes will apply to next game.</Header.Subheader>
					</Header>
					<div className={styles.blocks + ' ' + styles.colors}>
						{palettes.map((palette, idx) => (
							<div key={idx} className={styles.block}>
								<Button type='button' basic onClick={e => preferencesStore.handleChangePalette(palette)}>
									{palette.map((color, idx) => (
										<div key={idx} className={styles.color} style={{
											left: (idx % 5) * 30,
											top: Math.floor(idx / 5) * 30,
											backgroundColor: color
										}}></div>
									))}
								</Button>
							</div>
						))}
					</div>

					<Header as='h3' dividing>Block Style</Header>
					<div className={styles.blocks}>
						{pointsTypes.map((type, idx) => (
							<div key={idx} className={styles.block}>
								<Button active={form.pointsType === type} type='button' basic onClick={e => preferencesStore.handleChangePointsType(type)}>
									{preferencesStore.sampleBlockDef && <SampleBlock def={preferencesStore.sampleBlockDef} prefix={type + '-'} />}
								</Button>
							</div>
						))}
					</div>

					<Header as='h3' dividing>Board Style</Header>
					<div className={styles.blocks}>
						{boardTypes.map((type, idx) => (
							<div key={idx} className={styles.block}>
								<Button active={form.boardType === type} type='button' basic onClick={e => preferencesStore.handleChangeBoardType(type)}>
									<svg
										version="1.1"
										baseProfile="full"
										viewBox={`0 0 150 150`}
										xmlns="http://www.w3.org/2000/svg"
									>
										<use x='25%' y='0' width='50%' height='100%' href={'#' + svgPrefix + type + '-board'} />
									</svg>
								</Button>
							</div>
						))}
					</div>

					<Header as='h3' dividing>
						Block Shapes
						<Header.Subheader>Changes will apply to next game.</Header.Subheader>
					</Header>
					<div className={styles.blocks}>
						{form.blockDefs.map((def, idx) => (
							<div key={idx} className={styles.block}>
								<Button type='button' basic onClick={e => preferencesStore.blockEditStore.dialogShowEdit(idx, def)}>
									<SampleBlock def={def} prefix={form.pointsType + '-'} />
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
	);
});

export { Preferences };
