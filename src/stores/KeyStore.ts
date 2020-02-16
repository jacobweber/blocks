import { Actions, logAction, getKeyStr, getModifiedKeyStr } from 'utils/helpers';
import { MainStore } from './MainStore';
import { PreferencesStore } from './PreferencesStore';

const log = false;

class KeyStore {
	mainStore: MainStore;
	preferencesStore: PreferencesStore;
	actionQueue: Array<Actions> = [];
	heldAction: Actions | null = null;
	heldKey: string | null = null;
	heldTimeout: number | undefined = undefined;

	constructor(mainStore: MainStore, preferencesStore: PreferencesStore) {
		this.mainStore = mainStore;
		this.preferencesStore = preferencesStore;
	}

	reset() {
		window.clearTimeout(this.heldTimeout);
		this.heldTimeout = undefined;
		this.actionQueue = [];
		this.heldAction = null;
		this.heldKey = null;
	}

	initWindowEvents() {
		window.addEventListener('keydown', e => this.keyDown(e));
		window.addEventListener('keyup', e => this.keyUp(e));
	}

	async startHeldAction(action: Actions, key: string): Promise<void> {
		this.heldAction = action;
		this.heldKey = key;

		if (log) console.log('press', logAction(action));
		this.heldTimeout = window.setTimeout(() => {
			if (log) console.log('accel', logAction(action));
			this.heldAction = null;
			this.heldKey = null;
			const accelAction = action === Actions.Left ? Actions.LeftAccel : Actions.RightAccel;
			if (this.mainStore.animating) {
				this.accelLastQueuedAction(accelAction);
			} else {
				this.handleAction(accelAction);
			}
		}, this.preferencesStore.prefs.leftRightAccelAfterMS);
	}

	accelLastQueuedAction(action: Actions.LeftAccel | Actions.RightAccel): void {
		for (let i = this.actionQueue.length - 1; i >= 0; i--) {
			if (this.actionQueue[i] === Actions.Left && action === Actions.LeftAccel) {
				this.actionQueue[i] = action;
				return;
			} else if (this.actionQueue[i] === Actions.Right && action === Actions.RightAccel) {
				this.actionQueue[i] = action;
				return;
			}
		}
	}

	cancelHeldAction(): void {
		if (log && this.heldAction) console.log('release', logAction(this.heldAction));
		window.clearTimeout(this.heldTimeout);
		this.heldAction = null;
		this.heldKey = null;
		this.handleQueuedAction();
	}

	handleQueuedAction() {
		if (this.mainStore.animating) return;
		const queuedAction = this.actionQueue.shift();
		if (queuedAction) {
			if (log) console.log('unqueue', logAction(queuedAction));
			this.handleAction(queuedAction);
		}
	}

	async handleAction(action: Actions) {
		if (log) console.log('action', logAction(action));
		this.mainStore.handleAction(action);

		// in case any more actions were queued
		this.handleQueuedAction();
	}

	keyDown(e: KeyboardEvent) {
		if (!this.mainStore.canHandleInput()) return
		let keyStr = getModifiedKeyStr(e);

		let action = this.preferencesStore.gameKeyMap[keyStr];
		if (action === undefined) {
			keyStr = getKeyStr(e);
			action = this.preferencesStore.moveKeyMap[keyStr];
			if (action === undefined) {
				return;
			}
		}

		e.preventDefault();

		const noRepeat = action === Actions.Drop || action === Actions.NewGame || action === Actions.NewGameOptions || action === Actions.PauseResumeGame;
		if (noRepeat && e.repeat) return;

		const canHoldKey = (action === Actions.Left || action === Actions.Right)
			&& this.preferencesStore.prefs.leftRightAccelAfterMS !== 0;

		// ignore repeated left/right keys; use tracking instead
		if (canHoldKey && e.repeat) return;

		if (this.mainStore.animating || this.heldAction) {
			if (log) console.log('queue', logAction(action));
			this.actionQueue.push(action);
		} else {
			this.handleAction(action);
		}

		if (canHoldKey && !this.heldAction) {
			this.startHeldAction(action, keyStr);
		}
	}

	keyUp(e: KeyboardEvent) {
		const keyStr = getKeyStr(e);
		if (this.heldKey !== null && this.heldKey === keyStr) {
			this.cancelHeldAction();
		}
	}
}

export { KeyStore };
