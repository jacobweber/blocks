import React from 'react';

import styles from 'components/TouchDemo.module.css';
import { useStore } from 'stores/MainStore';
import { Icon, Portal } from 'semantic-ui-react';

const TouchDemo = () => {
	const mainStore = useStore();
	return (
		<Portal open={true}>
			<div className={styles.root} onClick={() => mainStore.showTouchDemo()}>
				<p className={styles.tapAreasInfo}>
					To move or rotate the block, tap anywhere on the screen.
					Depending on where you tap horizontally, the block will:
				</p>
				<div className={styles.tapAreas}>
					<div className={styles.tapArea}>
						<Icon name='undo' size='large' />
						Rotate
					</div>
					<div className={styles.tapArea}>
						<Icon name='redo' size='large' />
						Rotate
					</div>
					<div className={styles.tapArea}>
						<Icon name='arrow left' size='large' />
						Move Left
					</div>
					<div className={styles.tapArea}>
						<Icon name='arrow right' size='large' />
						Move Right
					</div>
				</div>
				<div className={styles.swipe}>
					To move all the way to the left or right,
					swipe left or right anywhere.
					<Icon name='hand point left outline' size='large' />
					<Icon name='hand point right outline' size='large' />
				</div>
				<div className={styles.swipe}>
					To drop the block all the way down,<br />swipe down anywhere.
					<Icon name='hand point down outline' size='large' />
				</div>
				<div className={styles.swipe}>
					To undo a drop, swipe up anywhere.
					<Icon name='hand point up outline' size='large' />
				</div>
			</div>
		</Portal>
	);
};

export { TouchDemo };
