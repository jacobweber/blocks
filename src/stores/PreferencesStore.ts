import { decorate, observable, action, computed } from 'mobx';
import { ActionName, KeyActions } from '../utils/types';
import { validKey, getKeyStr } from '../utils/helpers';

export interface Preferences {
	keys: {
		newGame: string;
		endGame: string;
		pauseResumeGame: string;
		left: string;
		right: string;
		drop: string;
		down: string;
		rotateCCW: string;
		rotateCW: string;
		undo: string;
	};
	leftRightAccelAfterMS: number;
	downTimerPauseWhenMovingMS: number;
	allowUndo: boolean;
}

const defaultPrefs: Preferences = {
	keys: {
		newGame: 'n',
		endGame: 'k',
		pauseResumeGame: 'p',
		left: 'ArrowLeft',
		right: 'ArrowRight',
		drop: 'ArrowDown',
		down: 'ArrowUp',
		rotateCCW: 'z',
		rotateCW: 'x',
		undo: 'a'
	},
	leftRightAccelAfterMS: 200,
	downTimerPauseWhenMovingMS: 500,
	allowUndo: true
};

class PreferencesStore {
	key: string = '';
	visible: boolean = false;
	prefs: Preferences = defaultPrefs;

	get keyMap(): { [key: string]: KeyActions } {
		const keys = this.prefs.keys;
		return {
			[keys.newGame]: KeyActions.NewGame,
			[keys.endGame]: KeyActions.EndGame,
			[keys.pauseResumeGame]: KeyActions.PauseResumeGame,
			[keys.left]: KeyActions.Left,
			[keys.right]: KeyActions.Right,
			[keys.drop]: KeyActions.Drop,
			[keys.down]: KeyActions.Down,
			[keys.rotateCCW]: KeyActions.RotateCCW,
			[keys.rotateCW]: KeyActions.RotateCW,
			[keys.undo]: KeyActions.Undo
		};
	}

	load() {
		const str = window.localStorage.getItem('preferences');
		let prefs;
		if (str) {
			try {
				prefs = JSON.parse(str);
			} catch (e) {
			}
		}
		this.prefs = Object.assign({}, defaultPrefs, prefs || {});
	}

	save() {
		const str = JSON.stringify(this.prefs);
		window.localStorage.setItem('preferences', str);
	}

	dialogShow() {
		this.visible = true;
	}

	dialogHide() {
		this.visible = false;
		this.load();
	}

	dialogSave() {
		this.visible = false;
		this.save();
	}

	handleDialogKeySelectorKeyDown(e: React.KeyboardEvent, name: ActionName): void {
		if (validKey(e.key)) {
			let value = this.prefs.keys[name];
			let keyStr = getKeyStr(e);
			if (keyStr === 'Backspace') {
				if (value === '') {
					value = 'Backspace';
				} else {
					value = '';
				}
			} else {
				value = keyStr;
			}
			this.prefs = {
				...this.prefs,
				keys: {
					...this.prefs.keys,
					[name]: value
				}
			}
		}
	}
}

decorate(PreferencesStore, {
	visible: observable,
	prefs: observable,
	key: observable,
	keyMap: computed,
	load: action,
	save: action,
	dialogShow: action,
	dialogHide: action,
	dialogSave: action,
	handleDialogKeySelectorKeyDown: action
});

export { PreferencesStore };
