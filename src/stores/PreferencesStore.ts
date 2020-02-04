import { decorate, observable, action, computed } from 'mobx';
import { ActionName, KeyActions } from '../utils/types';
import { validKey, getKeyStr, getModifiedKeyStr } from '../utils/helpers';

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
	styles: {
		backgroundColor: string;
		textColor: string;
		gridColor: string;
		outlineColor: string;
	}
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
	styles: {
		backgroundColor: '#000000',
		textColor: '#FFFFFF',
		gridColor: '#FFFFFF',
		outlineColor: '#FFFFFF'
	},
	leftRightAccelAfterMS: 200,
	downTimerPauseWhenMovingMS: 500,
	allowUndo: true
};

class PreferencesStore {
	visible: boolean = false;
	prefs: Preferences = defaultPrefs;

	get styles() {
		return this.prefs.styles;
	}

	get gameKeyMap(): { [key: string]: KeyActions } {
		const keys = this.prefs.keys;
		return {
			[keys.newGame]: KeyActions.NewGame,
			[keys.endGame]: KeyActions.EndGame,
			[keys.pauseResumeGame]: KeyActions.PauseResumeGame,
			[keys.undo]: KeyActions.Undo
		};
	}

	get moveKeyMap(): { [key: string]: KeyActions } {
		const keys = this.prefs.keys;
		return {
			[keys.left]: KeyActions.Left,
			[keys.right]: KeyActions.Right,
			[keys.drop]: KeyActions.Drop,
			[keys.down]: KeyActions.Down,
			[keys.rotateCCW]: KeyActions.RotateCCW,
			[keys.rotateCW]: KeyActions.RotateCW
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

	dialogCancel() {
		this.visible = false;
		this.load();
	}

	dialogSave() {
		this.visible = false;
		this.save();
	}

	setPrefs(prefs: Preferences): void {
		this.prefs = prefs;
	}

	handleChangeLeftRightAccel(e: React.ChangeEvent<HTMLInputElement>): void {
		let value = 0;
		if (e.target.value.length > 0) {
			value = parseInt(e.target.value, 10);
			if (isNaN(value)) return;
		}
		this.setPrefs({
			...this.prefs,
			leftRightAccelAfterMS: value
		});
	}

	handleChangeAllowUndo(e: React.FormEvent<HTMLInputElement>): void {
		this.setPrefs({
			...this.prefs,
			allowUndo: !this.prefs.allowUndo
		});
	}

	handleDialogKeySelectorKeyDown(e: React.KeyboardEvent, name: ActionName): void {
		if (validKey(e.key)) {
			let value = this.prefs.keys[name];
			const keysAllowingModifiers: Array<ActionName> = ['newGame', 'endGame', 'pauseResumeGame', 'undo'];
			const allowModifiers = keysAllowingModifiers.includes(name);
			let keyStr = allowModifiers ? getModifiedKeyStr(e) : getKeyStr(e);
			if (keyStr === 'Backspace') {
				if (value === '') {
					value = 'Backspace';
				} else {
					value = '';
				}
			} else {
				value = keyStr;
			}
			this.setPrefs({
				...this.prefs,
				keys: {
					...this.prefs.keys,
					[name]: value
				}
			});
		}
	}

	handleDialogColorChange(e: React.ChangeEvent<HTMLInputElement>, name: string): void {
		this.setPrefs({
			...this.prefs,
			styles: {
				...this.prefs.styles,
				[name]: e.target.value
			}
		});
	}
}

decorate(PreferencesStore, {
	visible: observable,
	prefs: observable.ref,
	styles: computed,
	gameKeyMap: computed,
	moveKeyMap: computed,
	load: action,
	save: action,
	setPrefs: action,
	dialogShow: action,
	dialogCancel: action,
	dialogSave: action
});

export { PreferencesStore };
