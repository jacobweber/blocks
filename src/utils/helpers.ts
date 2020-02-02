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
