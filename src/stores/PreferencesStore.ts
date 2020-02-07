import { decorate, observable, action, computed } from 'mobx';

import { KeyActionName, Actions, validKey, getKeyStr, getModifiedKeyStr } from 'utils/helpers';
import { PositionedPoint } from 'stores/MainStore';
import { BlockEditStore } from 'stores/BlockEditStore';
import { BlockRotations, BlockDef, BlockType, defaultBlockDefs, calculateBlockRotations, calculateBlockWeights, BlockColor } from 'utils/blocks';

export interface Preferences {
	keys: {
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
	};
	styles: {
		backgroundColor: string;
		textColor: string;
		gridColor: string;
		outlineColor: string;
	},
	blockDefs: Array<BlockDef>;
	name: string;
	leftRightAccelAfterMS: number;
	downTimerPauseWhenMovingMS: number;
	allowUndo: boolean;
	startLevel: number;
	rowsJunk: number;
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
	rowsJunk: 0
};

type DoneCallbackType = () => void;

class PreferencesStore {
	blockEditStore: BlockEditStore = new BlockEditStore(this);

	visible: boolean = false;
	doneCallback: DoneCallbackType | null = null;
	prefs: Preferences = defaultPrefs;
	prefsEdited: Preferences = this.prefs;
	gameBlockDefs: Array<BlockDef> = [];
	prefsSymbolPrefix = 'prefs-'; // will need to be blank if using static SVG for pieces

	blockEditVisible: boolean = false;
	blockEditType: BlockType | null = null;
	blockEditAdding: boolean = false;

	get styles() {
		return this.prefs.styles;
	}

	get blockColors(): Array<BlockColor> {
		return [
			{ id: 'flashOn', color: '#000000' },
			{ id: 'flashOff', color: '#FFFFFF' },
			...this.gameBlockDefs,
			...this.prefs.blockDefs.map(def => ({
				id: this.prefsSymbolPrefix + def.id,
				color: def.color
			}))
		];
	}

	get gameBlockRotations(): Array<BlockRotations> {
		return this.gameBlockDefs.map(def => calculateBlockRotations(def));
	}

	get weightedBlockTypes() {
		return calculateBlockWeights(this.gameBlockDefs);
	}

	getRandomBlockType(): BlockType {
		const index = Math.floor(Math.random() * this.weightedBlockTypes.length);
		return this.weightedBlockTypes[index];
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

	dialogShow(doneCallback?: DoneCallbackType) {
		this.visible = true;
		this.prefsEdited = this.prefs;
		if (doneCallback) {
			this.doneCallback = doneCallback;
		}
	}

	dialogCancel() {
		this.visible = false;
		this.prefsEdited = this.prefs;
		if (this.doneCallback) {
			this.doneCallback();
			delete this.doneCallback;
		}
	}

	dialogSave() {
		this.visible = false;
		this.prefs = this.prefsEdited;
		this.prefsEdited = this.prefs;
		this.save();
		if (this.doneCallback) {
			this.doneCallback();
			delete this.doneCallback;
		}
	}

	dialogReset() {
		this.prefsEdited = defaultPrefs;
	}

	setPrefsEdited(prefs: Preferences): void {
		this.prefsEdited = prefs;
	}

	lockGamePrefs() {
		this.gameBlockDefs = [ ...this.prefs.blockDefs ];
	}

	saveNewGameOptions(startLevel: number, rowsJunk: number): void {
		this.prefs = {
			...this.prefs,
			startLevel,
			rowsJunk
		};
		this.save();
	}

	handleChangeLeftRightAccel(e: React.ChangeEvent<HTMLInputElement>): void {
		let value = 0;
		if (e.target.value.length > 0) {
			value = parseInt(e.target.value, 10);
			if (isNaN(value)) return;
		}
		this.setPrefsEdited({
			...this.prefsEdited,
			leftRightAccelAfterMS: value
		});
	}

	handleChangeText(e: React.ChangeEvent<HTMLInputElement>, name: string): void {
		this.setPrefsEdited({
			...this.prefsEdited,
			[name]: e.target.value
		});
	}

	handleChangeAllowUndo(e: React.FormEvent<HTMLInputElement>): void {
		this.setPrefsEdited({
			...this.prefsEdited,
			allowUndo: !this.prefsEdited.allowUndo
		});
	}

	handleDialogKeySelectorKeyDown(e: React.KeyboardEvent, name: KeyActionName): void {
		if (validKey(e.key)) {
			let value = this.prefsEdited.keys[name];
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
			this.setPrefsEdited({
				...this.prefsEdited,
				keys: {
					...this.prefsEdited.keys,
					[name]: value
				}
			});
		}
		e.preventDefault();
		e.nativeEvent.preventDefault();
	}

	handleDialogColorChange(e: React.ChangeEvent<HTMLInputElement>, name: string): void {
		this.setPrefsEdited({
			...this.prefsEdited,
			styles: {
				...this.prefsEdited.styles,
				[name]: e.target.value
			}
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
	prefsEdited: observable.ref,
	blockColors: computed,
	gameBlockDefs: observable,
	prefsSymbolPrefix: observable,
	gameBlockRotations: computed,
	weightedBlockTypes: computed,
	styles: computed,
	gameKeyMap: computed,
	moveKeyMap: computed,
	load: action,
	save: action,
	setPrefsEdited: action,
	lockGamePrefs: action,
	saveNewGameOptions: action,
	dialogShow: action,
	dialogCancel: action,
	dialogSave: action,
	dialogReset: action
});

export { PreferencesStore };
