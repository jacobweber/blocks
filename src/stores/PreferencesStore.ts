import { decorate, observable, action, computed } from 'mobx';

import { KeyActionName, Actions, validKey, getKeyStr, getModifiedKeyStr } from 'utils/helpers';
import { PositionedPoint } from 'stores/MainStore';
import { BlockEditStore } from 'stores/BlockEditStore';
import { BlockRotations, BlockDef, BlockType, defaultBlockDefs, calculateBlockRotations, calculateBlockWeights, BlockColor } from 'utils/blocks';

type BoardType = 'Black' | 'White';
export const boardTypes: Array<BoardType> = ['Black', 'White'];

type PointsType = 'Standard' | 'Plain';
export const pointsTypes: Array<PointsType> = ['Standard', 'Plain'];

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
	width: number;
	height: number;
	board: BoardType;
	points: PointsType;
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
	board: 'Black',
	points: 'Standard'
};

type DoneCallbackType = () => void;

class PreferencesStore {
	blockEditStore: BlockEditStore = new BlockEditStore(this);

	visible: boolean = false;
	doneCallback: DoneCallbackType | null = null;
	prefs: Preferences = defaultPrefs;
	form: Preferences = this.prefs;
	sampleBlockType: BlockType | null = null;
	sampleBlockTimer: number | null = null;

	gameBlockDefs: Array<BlockDef> = [];
	width: number = 0;
	height: number = 0;

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
			...this.gameBlockDefs
		];
	}

	get formBlockColors(): Array<BlockColor> {
		return [
			...this.form.blockDefs.map(def => ({
				id: def.id,
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
		this.lockGamePrefs();
	}

	save() {
		const str = JSON.stringify(this.prefs);
		window.localStorage.setItem('preferences', str);
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

	dialogShow(doneCallback?: DoneCallbackType) {
		this.visible = true;
		this.form = this.prefs;
		if (doneCallback) {
			this.doneCallback = doneCallback;
		}
		if (this.sampleBlockTimer) {
			window.clearInterval(this.sampleBlockTimer);
		}
		this.updateSampleBlockType();
		this.sampleBlockTimer = window.setInterval(() => {
			this.updateSampleBlockType();
		}, 2000);
	}

	dialogCancel() {
		this.visible = false;
		this.form = this.prefs;
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
		this.prefs = this.form;
		this.form = this.prefs;
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
		this.form = defaultPrefs;
	}

	setForm(prefs: Preferences): void {
		this.form = prefs;
	}

	lockGamePrefs() {
		this.gameBlockDefs = [ ...this.prefs.blockDefs ];
		this.width = Math.min(Math.max(5, this.prefs.width), 100);
		this.height = Math.min(Math.max(5, this.prefs.height), 100);
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
		let value = 0;
		if (e.target.value.length > 0) {
			value = parseInt(e.target.value, 10);
			if (isNaN(value)) return;
		}
		this.setForm({
			...this.form,
			[name]: value
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

	handleDialogKeySelectorKeyDown(e: React.KeyboardEvent, name: KeyActionName): void {
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

	handleDialogColorChange(e: React.ChangeEvent<HTMLInputElement>, name: string): void {
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
			board: type
		});
	}

	handleChangePointsType(type: PointsType): void {
		this.setForm({
			...this.form,
			points: type
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
	blockColors: computed,
	formBlockColors: computed,
	gameBlockDefs: observable,
	width: observable,
	height: observable,
	gameBlockRotations: computed,
	weightedBlockTypes: computed,
	styles: computed,
	gameKeyMap: computed,
	moveKeyMap: computed,
	load: action,
	save: action,
	updateSampleBlockType: action,
	setForm: action,
	lockGamePrefs: action,
	saveNewGameOptions: action,
	dialogShow: action,
	dialogCancel: action,
	dialogSave: action,
	dialogReset: action
});

export { PreferencesStore };
