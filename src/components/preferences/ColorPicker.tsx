import React, { useState } from 'react';
import { SketchPicker, ColorResult } from 'react-color'

import styles from 'components/preferences/ColorPicker.module.css';

type ColorPickerProps = {
	value: string;
	onChange: (color: string) => void;
};

const ColorPicker = ({ value, onChange }: ColorPickerProps) => {
	const [ visible, setVisible ] = useState(false);

	const handleClick = () => setVisible(!visible);
	const handleClose = () => setVisible(false);
	const handleChange = (color: ColorResult) => onChange(color.hex);

	const colorStyles = { background: value };

	return (
		<div className={styles.root}>
			<div className={styles.swatch} onClick={handleClick}>
				<div className={styles.color} style={colorStyles} />
			</div>
			{visible && (
				<div className={styles.popover}>
					<div className={styles.cover} onClick={handleClose} />
					<SketchPicker color={value} disableAlpha onChange={handleChange} />
				</div>
			)}
		</div>
	);
};

export { ColorPicker };
