export const svgPointSize = 60;
export const svgPrefix = 'blocks-';

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
			return /^[a-z]$/i.test(e.key) ? e.key.toLowerCase() : e.key;
	}
}

export function getModifiedKeyStr(e: KeyboardEvent | React.KeyboardEvent) {
	return (e.shiftKey ? 'Shift+' : '')
		+ (e.ctrlKey ? 'Ctrl+' : '')
		+ (e.altKey ? 'Alt+' : '')
		+ (e.metaKey ? 'Meta+' : '')
		+ getKeyStr(e);
}

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
