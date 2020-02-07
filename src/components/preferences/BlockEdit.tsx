import React, { useState } from 'react';
import { observer } from "mobx-react-lite"
import { Button, Header, Icon, Modal, Form, Input } from 'semantic-ui-react'

import styles from 'components/preferences/BlockEdit.module.css';
import { useStore } from 'stores/MainStore';
import { BlockBitmap } from 'components/preferences/BlockBitmap';
import { pointBitmapToXY, PointBitmap, pointsXYToBitmap } from 'utils/blocks';

const fixOdds = function(odds: string): (number | '') {
	const val = parseInt(odds, 10);
	if (isNaN(val)) return '';
	return val;
};

const BlockEdit = observer(() => {
	const preferencesStore = useStore().preferencesStore;
	const origDef = preferencesStore.prefs.blockDefs[preferencesStore.blockEditType!];

	const colorProps = /^((?!chrome|android).)*safari/i.test(navigator.userAgent) ? {} : {
		type: 'color',
		className: styles.colorInput
	}; // breaks on safari

	const [ name, setName ] = useState(origDef.id);
	const [ odds, setOdds ] = useState<number|''>(origDef.odds);
	const [ size, setSize ] = useState(origDef.size);
	const [ color, setColor ] = useState(origDef.color);
	const [ rotate90, setRotate90 ] = useState(origDef.canRotate[0]);
	const [ rotate180, setRotate180 ] = useState(origDef.canRotate[1]);
	const [ rotate270, setRotate270 ] = useState(origDef.canRotate[2]);
	const [ points, setPoints ] = useState<PointBitmap>(pointsXYToBitmap(origDef.points));

	const cancel = () => preferencesStore.blockEditCancel();
	const del = () => preferencesStore.blockEditDelete();
	const ok = () => preferencesStore.blockEditSave({
		id: name,
		color,
		odds: odds || 0,
		size,
		canRotate: [ rotate90, rotate180, rotate270 ],
		points: pointBitmapToXY(points)
	});

	return (<>
		<Modal className={styles.root} open={true} closeIcon onClose={cancel}>
			<Header icon='setting' content='Edit Block' />
			<Modal.Content>
				<Form>
					<Form.Group>
						<Form.Field>
							<label>Name</label>
							<Input onChange={e => setName(e.target.value)} value={name} />
						</Form.Field>

						<Form.Field>
							<label>Frequency</label>
							<Input onChange={e => setOdds(fixOdds(e.target.value))} value={odds} />
						</Form.Field>

						<Form.Field>
							<label>Color</label>
							<Input {...colorProps} onChange={e => setColor(e.target.value)} value={color} />
						</Form.Field>
					</Form.Group>

					<Form.Group>
						<Form.Field>
							<label>Size</label>
							<Button.Group>
								{[1, 2, 3, 4, 5].map(val => (
									<Button type='button' active={size === val} key={val} onClick={() => setSize(val)}>
										{val}
									</Button>
								))}
							</Button.Group>
						</Form.Field>

						<Form.Field>
							<label>Rotations</label>
							<Button.Group>
								<Button type='button' active={rotate90} onClick={() => setRotate90(!rotate90)}>
									90&deg;
								</Button>
								<Button type='button' active={rotate180} onClick={() => setRotate180(!rotate180)}>
									180&deg;
								</Button>
								<Button type='button' active={rotate270} onClick={() => setRotate270(!rotate270)}>
									270&deg;
								</Button>
							</Button.Group>
						</Form.Field>
					</Form.Group>

					<BlockBitmap size={size} id={origDef.id} points={points} onChangePoints={setPoints} />
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
