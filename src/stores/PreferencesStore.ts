import { decorate, observable, action, computed } from 'mobx';

import { KeyActionName, Actions, validKey, getKeyStr, getModifiedKeyStr } from 'utils/helpers';
import { PositionedPoint } from './MainStore';
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
	visible: boolean = false;
	doneCallback: DoneCallbackType | null = null;
	prefs: Preferences = defaultPrefs;

	blockEditVisible: boolean = false;
	blockEditType: BlockType | null = null;
	blockEditAdding: boolean = false;

	get styles() {
		return this.prefs.styles;
	}

	get blockDefs() {
		return this.prefs.blockDefs;
	}

	get blockColors(): Array<BlockColor> {
		return [
			{ id: 'flashOn', color: '#000000' },
			{ id: 'flashOff', color: '#FFFFFF' },
			...this.blockDefs
		];
	}

	get blockRotations(): Array<BlockRotations> {
		return this.prefs.blockDefs.map(def => calculateBlockRotations(def));
	}

	get weightedBlockTypes() {
		return calculateBlockWeights(this.blockDefs);
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
		if (doneCallback) {
			this.doneCallback = doneCallback;
		}
	}

	dialogCancel() {
		this.visible = false;
		this.load();
		if (this.doneCallback) {
			this.doneCallback();
			delete this.doneCallback;
		}
	}

	dialogSave() {
		this.visible = false;
		this.save();
		if (this.doneCallback) {
			this.doneCallback();
			delete this.doneCallback;
		}
	}

	dialogReset() {
		this.prefs = defaultPrefs;
	}

	setPrefs(prefs: Preferences): void {
		this.prefs = prefs;
	}

	saveNewGameOptions(startLevel: number, rowsJunk: number): void {
		this.setPrefs({
			...this.prefs,
			startLevel,
			rowsJunk
		});
		this.save();
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

	handleChangeText(e: React.ChangeEvent<HTMLInputElement>, name: string): void {
		this.setPrefs({
			...this.prefs,
			[name]: e.target.value
		});
	}

	handleChangeAllowUndo(e: React.FormEvent<HTMLInputElement>): void {
		this.setPrefs({
			...this.prefs,
			allowUndo: !this.prefs.allowUndo
		});
	}

	handleDialogKeySelectorKeyDown(e: React.KeyboardEvent, name: KeyActionName): void {
		if (validKey(e.key)) {
			let value = this.prefs.keys[name];
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
			this.setPrefs({
				...this.prefs,
				keys: {
					...this.prefs.keys,
					[name]: value
				}
			});
		}
		e.preventDefault();
		e.nativeEvent.preventDefault();
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

	getBlockPoints(blockDef: BlockDef): Array<PositionedPoint> {
		return blockDef.points.map(point => ({
			x: point[0],
			y: point[1],
			id: blockDef.id
		}));
	}

	addBlockDef(def: BlockDef): void {
		this.setPrefs({
			...this.prefs,
			blockDefs: [
				...this.prefs.blockDefs,
				def
			]
		});
	}

	updateBlockDef(type: BlockType, def: BlockDef): void {
		this.setPrefs({
			...this.prefs,
			blockDefs: [
				...this.prefs.blockDefs.slice(0, type),
				def,
				...this.prefs.blockDefs.slice(type + 1)
			]
		});
	}

	deleteBlockDef(type: BlockType): void {
		this.setPrefs({
			...this.prefs,
			blockDefs: [
				...this.prefs.blockDefs.slice(0, type),
				...this.prefs.blockDefs.slice(type + 1)
			]
		});
	}

	blockAddShow() {
		this.blockEditType = this.prefs.blockDefs.length;
		this.blockEditAdding = true;
		this.addBlockDef({
			id: 'sample',
			color: '#AA0000',
			odds: 1,
			size: 3,
			canRotate: [ true, true, true ],
			points: []
		});
		this.blockEditVisible = true;
	}

	blockEditShow(type: BlockType, def: BlockDef) {
		this.blockEditType = type;
		this.blockEditAdding = false;
		this.blockEditVisible = true;
	}

	blockEditCancel() {
		this.blockEditVisible = false;
		if (this.blockEditAdding && this.blockEditType !== null) {
			this.deleteBlockDef(this.blockEditType);
		}
		this.blockEditType = null;
		this.blockEditAdding = false;
	}

	blockEditSave(def: BlockDef) {
		this.blockEditVisible = false;
		if (this.blockEditType !== null) {
			this.updateBlockDef(this.blockEditType, def);
		}
		this.blockEditType = null;
		this.blockEditAdding = false;
	}

	blockEditDelete() {
		this.blockEditVisible = false;
		if (this.blockEditType !== null) {
			this.deleteBlockDef(this.blockEditType);
		}
		this.blockEditAdding = false;
	}
}

decorate(PreferencesStore, {
	visible: observable,
	blockEditVisible: observable,
	blockEditType: observable,
	prefs: observable.ref,
	blockDefs: computed,
	blockColors: computed,
	blockRotations: computed,
	weightedBlockTypes: computed,
	styles: computed,
	gameKeyMap: computed,
	moveKeyMap: computed,
	load: action,
	save: action,
	setPrefs: action,
	dialogShow: action,
	dialogCancel: action,
	dialogSave: action,
	dialogReset: action,
	blockAddShow: action,
	blockEditShow: action,
	blockEditCancel: action,
	blockEditSave: action,
	blockEditDelete: action
});

export { PreferencesStore };
