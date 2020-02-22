import React from 'react';
import { observer } from "mobx-react-lite"
import { Button, ButtonProps } from 'semantic-ui-react'

import { useStore } from 'stores/MainStore';
import styles from 'components/CustomButton.module.css';

type CustomButtonProps = {
	outlined?: boolean;
};

const CustomButton = observer(({ outlined = false, ...props }: ButtonProps & CustomButtonProps) => {
	const mainStore = useStore();
	const prefsStyles = mainStore.preferencesStore.prefs.styles;
	return <Button className={outlined ? styles.outlined : styles.plain} style={{
		borderColor: prefsStyles.outlineColor,
		color: prefsStyles.textColor
	}} {...props} />;
});

export { CustomButton };
