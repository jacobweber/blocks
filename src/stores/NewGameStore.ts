import { decorate, observable, action } from 'mobx';

type CallbackType = (result: boolean, level: number, rows: number) => void;

class NewGameStore {
	visible: boolean = false;
	callback: CallbackType | null = null;;
	level: number = 1;
	rows: number = 0;

	dialogShow(level: number, rows: number, callback: CallbackType) {
		this.visible = true;
		this.level = level;
		this.rows = rows;
		this.callback = callback;
	}

	dialogCancel() {
		this.visible = false;
		if (this.callback) {
			this.callback(false, 0, 0);
			delete this.callback;
		}
	}

	dialogOK(level: number, rows: number) {
		this.visible = false;
		if (this.callback) {
			this.callback(true, level, rows);
			delete this.callback;
		}
	}
}

decorate(NewGameStore, {
	visible: observable,
	level: observable,
	rows: observable,
	dialogShow: action,
	dialogCancel: action,
	dialogOK: action
});

export { NewGameStore };
