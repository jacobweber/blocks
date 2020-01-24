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
	let keyText;

	switch (e.key) {
		case ' ':
			keyText = 'Space';
			break;
		default:
			keyText = e.key;
	}

	return (e.shiftKey ? 'Shift+' : '')
		+ (e.ctrlKey ? 'Ctrl+' : '')
		+ (e.altKey ? 'Alt+' : '')
		+ (e.metaKey ? 'Meta+' : '')
		+ keyText;
}
