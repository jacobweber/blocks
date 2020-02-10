import { observable, action, computed } from 'mobx';

import { KeyActionName, Actions, validKey, getKeyStr, getModifiedKeyStr, strToIntRange } from 'utils/helpers';
import { PositionedPoint } from 'stores/MainStore';
import { BlockEditStore } from 'stores/BlockEditStore';
import { BlockDef, BlockType, defaultBlockDefs, BlockColor } from 'utils/blocks';

export type BoardType = 'Black' | 'Custom';
export const boardTypes: Array<BoardType> = ['Black', 'Custom'];

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
	boardColor: string;
}

export interface Preferences {
	keys: KeysPrefs;
	styles: StylesPrefs,
	blockDefs: Array<BlockDef>;
	name: string;
	leftRightAccelAfterMS: number;
	delayFinalDrop: boolean;
	allowUndo: boolean;
	showGrid: boolean;
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
	delayFinalDrop: boolean;
	allowUndo: boolean;
	showGrid: boolean;
	width: string;
	height: string;
	boardType: BoardType;
	pointsType: PointsType;
}

const defaultPrefs: Preferences = {
	keys: {
		newGame: 'n',
		newGameOptions: 'Shift+n',
		endGame: 'k',
		pauseResumeGame: 'p',
		left: 'ArrowLeft',
		right: 'ArrowRight',
		drop: 'ArrowDown',
		down: 'ArrowUp',
		rotateCCW: 'z',
		rotateCW: 'x',
		undo: navigator.platform.toUpperCase().indexOf('MAC') !== -1 ? 'Meta+z' : 'Ctrl+z'
	},
	styles: {
		backgroundColor: '#000000',
		textColor: '#FFFFFF',
		gridColor: '#FFFFFF',
		outlineColor: '#FFFFFF',
		boardColor: '#DDDDDD'
	},
	blockDefs: defaultBlockDefs,
	name: 'Anonymous',
	leftRightAccelAfterMS: 250,
	delayFinalDrop: true,
	allowUndo: true,
	showGrid: true,
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

	@observable visible: boolean = false;
	doneCallback: DoneCallbackType | null = null;
	@observable.ref prefs: Preferences = defaultPrefs;
	@observable.ref form: PreferencesForm = this.prefsToForm(this.prefs);
	@observable.ref sampleBlockType: BlockType | null = null;
	sampleBlockTimer: number | null = null;

	@computed get formBlockColors(): Array<BlockColor> {
		return [
			...this.form.blockDefs.map(def => ({
				id: def.id,
				color: def.color
			}))
		];
	}

	@computed get gameKeyMap(): { [key: string]: Actions } {
		const keys = this.prefs.keys;
		return {
			[keys.newGame]: Actions.NewGame,
			[keys.newGameOptions]: Actions.NewGameOptions,
			[keys.endGame]: Actions.EndGame,
			[keys.pauseResumeGame]: Actions.PauseResumeGame,
			[keys.undo]: Actions.Undo
		};
	}

	@computed get moveKeyMap(): { [key: string]: Actions } {
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

	@action load() {
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

	@action save() {
		const str = JSON.stringify(this.prefs);
		window.localStorage.setItem('preferences', str);
	}

	prefsToForm(prefs: Preferences): PreferencesForm {
		return {
			...prefs,
			leftRightAccelAfterMS: String(prefs.leftRightAccelAfterMS),
			width: String(prefs.width),
			height: String(prefs.height)
		}
	}

	formToPrefs(form: PreferencesForm, origPrefs: Preferences): Preferences {
		return {
			...origPrefs,
			...form,
			leftRightAccelAfterMS: strToIntRange(form.leftRightAccelAfterMS, 0, 1000),
			width: strToIntRange(form.width, 5, 30),
			height: strToIntRange(form.height, 5, 30)
		}
	}

	@action setForm(form: PreferencesForm): void {
		this.form = form;
	}

	@action updateSampleBlockType(): void {
		if (this.sampleBlockType === null) {
			this.sampleBlockType = 0;
		} else if (this.sampleBlockType + 1 >= this.form.blockDefs.length) {
			this.sampleBlockType = 0;
		} else {
			this.sampleBlockType++;
		}
	}

	@computed get sampleBlockDef(): BlockDef | null {
		if (this.sampleBlockType !== null && this.sampleBlockType < this.form.blockDefs.length) {
			return this.form.blockDefs[this.sampleBlockType];
		}
		// in case it was deleted while visible
		return null;
	}

	@action dialogShow(doneCallback?: DoneCallbackType) {
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

	@action dialogCancel() {
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

	@action dialogSave() {
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

	@action dialogReset() {
		this.form = this.prefsToForm(defaultPrefs);
	}

	@action saveNewGameOptions(startLevel: number, rowsJunk: number): void {
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

	handleChangeBoolean(e: React.FormEvent<HTMLInputElement>, name: string, checked?: boolean): void {
		this.setForm({
			...this.form,
			[name]: checked
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
		let boardType = this.form.boardType;
		if (name === 'boardColor') {
			boardType = 'Custom';
		}
		this.setForm({
			...this.form,
			boardType,
			styles: {
				...this.form.styles,
				[name]: e.target.value
			}
		});
	}

	handleChangePalette(palette: Array<string>): void {
		const blockDefs = this.form.blockDefs.map((def, idx) => ({
			...def,
			color: palette[idx % palette.length]
		}));
		this.setForm({
			...this.form,
			blockDefs
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

export { PreferencesStore };
