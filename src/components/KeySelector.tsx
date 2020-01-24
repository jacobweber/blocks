import React from 'react';
import { observer } from "mobx-react-lite"
import { Input } from 'semantic-ui-react'
import { ActionName } from '../utils/types';

import styles from './KeySelector.module.css';

type KeySelectorProps = {
	name: ActionName;
	value: string;
	onKeyDown(e: React.KeyboardEvent): void;
};

const KeySelector = observer(({ name, onKeyDown, value }: KeySelectorProps) => {
	return (
		<div className={styles.root}>
			<Input onKeyDown={onKeyDown} value={value} />
		</div>
	);
});

export { KeySelector };
