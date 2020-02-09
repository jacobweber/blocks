export const svgPointSize = 60;

export enum GameState { Reset, Ended, Active, Paused };

export enum Actions { NewGame, NewGameOptions, EndGame, PauseResumeGame, Left, LeftAccel, Right, RightAccel, Down, Drop, RotateCCW, RotateCW, Undo }

export type KeyActionName = 'newGame' | 'newGameOptions' | 'endGame' | 'pauseResumeGame' | 'left' | 'right' | 'down' | 'drop' | 'rotateCCW' | 'rotateCW' | 'undo';

export function logAction(action: Actions): string {
	switch (action) {
		case Actions.NewGame: return 'newGame';
		case Actions.NewGameOptions: return 'newGameOptions';
		case Actions.EndGame: return 'endGame';
		case Actions.PauseResumeGame: return 'pauseResumeGame';
		case Actions.Undo: return 'undo';
		case Actions.Left: return 'left';
		case Actions.LeftAccel: return 'leftAccel';
		case Actions.Right: return 'right';
		case Actions.RightAccel: return 'rightAccel';
		case Actions.Down: return 'down';
		case Actions.Drop: return 'drop';
		case Actions.RotateCCW: return 'rotateCCW';
		case Actions.RotateCW: return 'rotateCW';
	}
}

export function getLevel(rows: number): number {
	if (rows < 10) return 1;
	if (rows < 30) return 2;
	if (rows < 60) return 3;
	if (rows < 100) return 4;
	if (rows < 150) return 5;
	if (rows < 210) return 6;
	if (rows < 280) return 7;
	if (rows < 360) return 8;
	if (rows < 450) return 9;
	return 10;
}

export function getDownDelayMS(level: number): number {
	switch (level) {
		case 1: return 800;
		case 2: return 600;
		case 3: return 480;
		case 4: return 350;
		case 5: return 250;
		case 6: return 180;
		case 7: return 140;
		case 8: return 100;
		case 9: return 80;
	}
	return 60;
}

export function validKey(key: string): boolean {
	switch (key) {
		case 'Unidentified':
		case 'Alt':
		case 'AltGraph':
		case 'Control':
		case 'Meta':
		case 'Shift':
			return false;
		default:
			return true;
	}
}

export function getKeyStr(e: KeyboardEvent | React.KeyboardEvent) {
	switch (e.key) {
		case ' ':
			return 'Space';
		default:
			return e.key;
	}
}

export function getModifiedKeyStr(e: KeyboardEvent | React.KeyboardEvent) {
	return (e.shiftKey ? 'Shift+' : '')
		+ (e.ctrlKey ? 'Ctrl+' : '')
		+ (e.altKey ? 'Alt+' : '')
		+ (e.metaKey ? 'Meta+' : '')
		+ getKeyStr(e);
}

// https://loading.io/color/random/, https://loading.io/color/feature/
export const palettes = [
	['#adff2f', '#f08080', '#f0e68c', '#deb887', '#6495ed', '#ffb6c1', '#7fffd4'], // default
	['#e6261f', '#eba532', '#f7d038', '#a3e048', '#49c7d0', '#4355db', '#d23be7'], // rainbow
	['#91d6bc', '#8ac8a6', '#85b991', '#80ab7d', '#7d9c6a', '#798d58', '#767e48'], // green
	['#fff995', '#ffdb77', '#e2bd5b', '#c29f3f', '#a38321', '#856800', '#684e00'], // brown
	['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854', '#ffd92f', '#e5c494'], // misc
	['#fbb4ae', '#b3cde3', '#ccebc5', '#decbe4', '#fed9a6', '#ffffcc', '#e5d8bd'], // pastel
//	['#', '#', '#', '#', '#', '#', '#']
];

export function strToIntRange(str: string, min?: number, max?: number, def?: number): number {
	let num = parseInt(str, 10);
	if (isNaN(num)) {
		if (def !== undefined) {
			return def;
		} else if (min !== undefined) {
			return min;
		} else {
			return 0;
		}
	}
	if (min !== undefined) {
		num = Math.max(min, num);
	}
	if (max !== undefined) {
		num = Math.min(max, num);
	}
	return num;
}
