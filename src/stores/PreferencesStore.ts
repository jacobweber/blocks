import { decorate, observable, action } from 'mobx';
import { KeyActions } from '../utils/types';

export interface Preferences {
	keyMap: { [key: string]: KeyActions };
	leftRightAccelAfterMS: number;
	downTimerPauseWhenMovingMS: number;
	allowUndo: boolean;
}

const defaultPrefs: Preferences = {
	keyMap: {
		'n': KeyActions.NewGame,
		'k': KeyActions.EndGame,
		'p': KeyActions.PauseResumeGame,
		'ArrowLeft': KeyActions.Left,
		'ArrowRight': KeyActions.Right,
		'ArrowDown': KeyActions.Drop,
		'ArrowUp': KeyActions.Down,
		'z': KeyActions.RotateCCW,
		'x': KeyActions.RotateCW,
		'z+Meta': KeyActions.Undo
	},
	leftRightAccelAfterMS: 200,
	downTimerPauseWhenMovingMS: 500,
	allowUndo: true
};

class PreferencesStore {
	visible: boolean = false;
	prefs: Preferences = defaultPrefs;

	load() {
		const str = window.localStorage.getItem('preferences');
		let prefs;
		if (str) {
			try {
				prefs = JSON.parse(str);
			} catch (e) {
			}
		}
		this.prefs = Object.assign({}, defaultPrefs, prefs);
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
	}

	dialogSave() {
		this.visible = false;
		this.save();
	}
}

decorate(PreferencesStore, {
	visible: observable,
	load: action,
	save: action,
	dialogShow: action,
	dialogHide: action,
	dialogSave: action
});

export { PreferencesStore };
