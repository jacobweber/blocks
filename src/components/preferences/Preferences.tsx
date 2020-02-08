import React, { useState } from 'react';
import { observer } from "mobx-react-lite"
import { Button, Header, Icon, Modal, Form, Input, Checkbox, Confirm } from 'semantic-ui-react'

import styles from 'components/preferences/Preferences.module.css';
import { useStore } from 'stores/MainStore';
import { KeyActionName, palettes } from 'utils/helpers';
import { Block } from 'components/preferences/Block';
import { BlockEdit } from 'components/preferences/BlockEdit';
import { PointDefsSelector } from 'components/points/PointDefsSelector';
import { boardTypes, pointsTypes } from 'stores/PreferencesStore';
import { BoardDefSelector } from 'components/boards/BoardDefSelector';

const Preferences = observer(() => {
	const preferencesStore = useStore().preferencesStore;
	const form = preferencesStore.form;
	const keys = form.keys;
	const prefsStyles = form.styles;
	const cancel = () => preferencesStore.dialogCancel();
	const save = () => preferencesStore.dialogSave();
	const handleChangeKey = (name: KeyActionName) => (e: React.KeyboardEvent) => preferencesStore.handleChangeKey(e, name);
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
			{pointsTypes.map(type => (
				<PointDefsSelector key={type} type={type} prefix={type + '-'} blockColors={preferencesStore.formBlockColors} />
			))}
			{boardTypes.map(type => (
				<BoardDefSelector key={type} type={type} prefix={type + '-'} />
			))}
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
							<label>Accelerate Left/Right After Holding</label>
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

					<Header as='h3' dividing>Colors</Header>
					<Form.Group>
						<Form.Field className={styles.cell}>
							<label>Background</label>
							<Input {...colorProps} onChange={e => preferencesStore.handleChangeColor(e, 'backgroundColor')} value={prefsStyles.backgroundColor} />
						</Form.Field>
						<Form.Field className={styles.cell}>
							<label>Text</label>
							<Input  {...colorProps} onChange={e => preferencesStore.handleChangeColor(e, 'textColor')} value={prefsStyles.textColor} />
						</Form.Field>
						<Form.Field className={styles.cell}>
							<label>Grid</label>
							<Input  {...colorProps} onChange={e => preferencesStore.handleChangeColor(e, 'gridColor')} value={prefsStyles.gridColor} />
						</Form.Field>
						<Form.Field className={styles.cell}>
							<label>Outline</label>
							<Input {...colorProps} onChange={e => preferencesStore.handleChangeColor(e, 'outlineColor')} value={prefsStyles.outlineColor} />
						</Form.Field>
					</Form.Group>

					<Header as='h3' dividing>
						Block Colors
						<Header.Subheader>Will replace any customized colors.</Header.Subheader>
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
									{preferencesStore.sampleBlockDef && <Block def={preferencesStore.sampleBlockDef} prefix={type + '-'} />}
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
										<use x='25%' y='0' width='50%' height='100%' href={`#${type}-board`} />
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
									<Block def={def} prefix={form.pointsType + '-'} />
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
