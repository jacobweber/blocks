import React, { useState } from 'react';
import { SketchPicker, ColorResult } from 'react-color'

import styles from 'components/preferences/ColorPicker.module.css';
import { Popup } from 'semantic-ui-react';

type ColorPickerProps = {
	value: string;
	onChange: (color: string) => void;
};

const ColorPicker = ({ value, onChange }: ColorPickerProps) => {
	const [ visible, setVisible ] = useState(false);

	const handleClose = () => setVisible(false);
	const handleOpen = () => setVisible(true);
	const handleChange = (color: ColorResult) => onChange(color.hex);

	const colorStyles = { background: value };

	return (
		<div className={styles.root}>
			<Popup on='click' trigger={
				<div className={styles.swatch}>
					<div className={styles.color} style={colorStyles} />
				</div>
			} hideOnScroll open={visible} onClose={handleClose} onOpen={handleOpen}>
				<Popup.Content className={styles.content}>
					<SketchPicker color={value} disableAlpha onChange={handleChange} />
				</Popup.Content>
			</Popup>
		</div>
	);
};

export { ColorPicker };
