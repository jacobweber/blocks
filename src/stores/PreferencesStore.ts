import { decorate, observable, action, computed } from 'mobx';

import { KeyActionName, Actions, validKey, getKeyStr, getModifiedKeyStr } from 'utils/helpers';
import { PositionedPoint } from 'stores/MainStore';
import { BlockEditStore } from 'stores/BlockEditStore';
import { BlockDef, BlockType, defaultBlockDefs, BlockColor } from 'utils/blocks';

export type BoardType = 'Black' | 'White';
export const boardTypes: Array<BoardType> = ['Black', 'White'];

export type PointsType = 'Standard' | 'Plain' | 'Boxy';
export const pointsTypes: Array<PointsType> = ['Standard', 'Plain', 'Boxy'];

interface KeysPrefs {
	newGame: string;
	newGameOptions: string;
	endGame: string;
	pauseResumeGame: string;
	left: string;
	right: string;
	drop: string;
	down: string;
	rotateCCW: string;
	rotateCW: string;
	undo: string;
}

interface StylesPrefs {
	backgroundColor: string;
	textColor: string;
	gridColor: string;
	outlineColor: string;
}

export interface Preferences {
	keys: KeysPrefs;
	styles: StylesPrefs,
	blockDefs: Array<BlockDef>;
	name: string;
	leftRightAccelAfterMS: number;
	downTimerPauseWhenMovingMS: number;
	allowUndo: boolean;
	startLevel: number;
	rowsJunk: number;
	width: number;
	height: number;
	boardType: BoardType;
	pointsType: PointsType;
}

export interface PreferencesForm {
	keys: KeysPrefs;
	styles: StylesPrefs,
	blockDefs: Array<BlockDef>;
	name: string;
	leftRightAccelAfterMS: string;
	allowUndo: boolean;
	startLevel: string;
	rowsJunk: string;
	width: string;
	height: string;
	boardType: BoardType;
	pointsType: PointsType;
}

const defaultPrefs: Preferences = {
	keys: {
		newGame: 'n',
		newGameOptions: 'Shift+N',
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
	blockDefs: defaultBlockDefs,
	name: 'Anonymous',
	leftRightAccelAfterMS: 200,
	downTimerPauseWhenMovingMS: 500,
	allowUndo: true,
	startLevel: 1,
	rowsJunk: 0,
	width: 10,
	height: 20,
	boardType: 'Black',
	pointsType: 'Standard'
};

type DoneCallbackType = () => void;

class PreferencesStore {
	blockEditStore: BlockEditStore = new BlockEditStore(this);

	visible: boolean = false;
	doneCallback: DoneCallbackType | null = null;
	prefs: Preferences = defaultPrefs;
	form: PreferencesForm = this.prefsToForm(this.prefs);
	sampleBlockType: BlockType | null = null;
	sampleBlockTimer: number | null = null;

	get styles() {
		return this.prefs.styles;
	}

	get formBlockColors(): Array<BlockColor> {
		return [
			...this.form.blockDefs.map(def => ({
				id: def.id,
				color: def.color
			}))
		];
	}

	get gameKeyMap(): { [key: string]: Actions } {
		const keys = this.prefs.keys;
		return {
			[keys.newGame]: Actions.NewGame,
			[keys.newGameOptions]: Actions.NewGameOptions,
			[keys.endGame]: Actions.EndGame,
			[keys.pauseResumeGame]: Actions.PauseResumeGame,
			[keys.undo]: Actions.Undo
		};
	}

	get moveKeyMap(): { [key: string]: Actions } {
		const keys = this.prefs.keys;
		return {
			[keys.left]: Actions.Left,
			[keys.right]: Actions.Right,
			[keys.drop]: Actions.Drop,
			[keys.down]: Actions.Down,
			[keys.rotateCCW]: Actions.RotateCCW,
			[keys.rotateCW]: Actions.RotateCW
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
		if (!prefs) prefs = {};
		this.prefs = {
			keys: {
				...defaultPrefs.keys,
				...prefs.keys
			},
			...defaultPrefs,
			...(prefs || {})
		};
	}

	save() {
		const str = JSON.stringify(this.prefs);
		window.localStorage.setItem('preferences', str);
	}

	prefsToForm(prefs: Preferences): PreferencesForm {
		return {
			...prefs,
			leftRightAccelAfterMS: String(prefs.leftRightAccelAfterMS),
			startLevel: String(prefs.startLevel),
			rowsJunk: String(prefs.rowsJunk),
			width: String(prefs.width),
			height: String(prefs.height)
		}
	}

	formToPrefs(form: PreferencesForm, origPrefs: Preferences): Preferences {
		return {
			...origPrefs,
			...form,
			leftRightAccelAfterMS: parseInt(form.leftRightAccelAfterMS, 10),
			startLevel: parseInt(form.startLevel, 10) || 1,
			rowsJunk: parseInt(form.rowsJunk) || 0,
			width: parseInt(form.width) || 10,
			height: parseInt(form.height) || 20
		}
	}

	setForm(form: PreferencesForm): void {
		this.form = form;
	}

	updateSampleBlockType(): void {
		if (this.sampleBlockType === null) {
			this.sampleBlockType = 0;
		} else if (this.sampleBlockType + 1 >= this.form.blockDefs.length) {
			this.sampleBlockType = 0;
		} else {
			this.sampleBlockType++;
		}
	}

	get sampleBlockDef(): BlockDef | null {
		if (this.sampleBlockType !== null && this.sampleBlockType < this.form.blockDefs.length) {
			return this.form.blockDefs[this.sampleBlockType];
		}
		// in case it was deleted while visible
		return null;
	}

	dialogShow(doneCallback?: DoneCallbackType) {
		this.visible = true;
		this.form = this.prefsToForm(this.prefs);
		if (doneCallback) {
			this.doneCallback = doneCallback;
		}
		if (this.sampleBlockTimer) {
			window.clearInterval(this.sampleBlockTimer);
		}
		this.sampleBlockType = 0;
		this.sampleBlockTimer = window.setInterval(() => {
			this.updateSampleBlockType();
		}, 2000);
	}

	dialogCancel() {
		this.visible = false;
		this.form = this.prefsToForm(this.prefs);
		if (this.doneCallback) {
			this.doneCallback();
			delete this.doneCallback;
		}
		if (this.sampleBlockTimer) {
			window.clearInterval(this.sampleBlockTimer);
		}
	}

	dialogSave() {
		this.visible = false;
		this.prefs = this.formToPrefs(this.form, this.prefs);
		this.form = this.prefsToForm(this.prefs);
		this.save();
		if (this.doneCallback) {
			this.doneCallback();
			delete this.doneCallback;
		}
		if (this.sampleBlockTimer) {
			window.clearInterval(this.sampleBlockTimer);
		}
	}

	dialogReset() {
		this.form = this.prefsToForm(defaultPrefs);
	}

	saveNewGameOptions(startLevel: number, rowsJunk: number): void {
		this.prefs = {
			...this.prefs,
			startLevel,
			rowsJunk
		};
		this.save();
	}

	handleChangeInteger(e: React.ChangeEvent<HTMLInputElement>, name: string): void {
		this.setForm({
			...this.form,
			[name]: e.target.value.replace(/[^0-9]/g, '')
		});
	}

	handleChangeText(e: React.ChangeEvent<HTMLInputElement>, name: string): void {
		this.setForm({
			...this.form,
			[name]: e.target.value
		});
	}

	handleChangeAllowUndo(e: React.FormEvent<HTMLInputElement>): void {
		this.setForm({
			...this.form,
			allowUndo: !this.form.allowUndo
		});
	}

	handleChangeKey(e: React.KeyboardEvent, name: KeyActionName): void {
		if (validKey(e.key)) {
			let value = this.form.keys[name];
			const keysAllowingModifiers: Array<KeyActionName> = ['newGame', 'newGameOptions', 'endGame', 'pauseResumeGame', 'undo'];
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
			this.setForm({
				...this.form,
				keys: {
					...this.form.keys,
					[name]: value
				}
			});
		}
		e.preventDefault();
		e.nativeEvent.preventDefault();
	}

	handleChangeColor(e: React.ChangeEvent<HTMLInputElement>, name: string): void {
		this.setForm({
			...this.form,
			styles: {
				...this.form.styles,
				[name]: e.target.value
			}
		});
	}

	handleChangeBoardType(type: BoardType): void {
		this.setForm({
			...this.form,
			boardType: type
		});
	}

	handleChangePointsType(type: PointsType): void {
		this.setForm({
			...this.form,
			pointsType: type
		});
	}

	getBlockPoints(blockDef: BlockDef): Array<PositionedPoint> {
		return blockDef.points.map(point => ({
			x: point[0],
			y: point[1],
			id: blockDef.id
		}));
	}
}

decorate(PreferencesStore, {
	visible: observable,
	prefs: observable.ref,
	form: observable.ref,
	sampleBlockType: observable.ref,
	sampleBlockDef: computed,
	formBlockColors: computed,
	styles: computed,
	gameKeyMap: computed,
	moveKeyMap: computed,
	load: action,
	save: action,
	updateSampleBlockType: action,
	setForm: action,
	saveNewGameOptions: action,
	dialogShow: action,
	dialogCancel: action,
	dialogSave: action,
	dialogReset: action
});

export { PreferencesStore };
