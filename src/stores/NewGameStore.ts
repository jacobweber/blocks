import { decorate, observable, action } from 'mobx';

type DoneCallbackType = (result: boolean, level: number, rows: number) => void;

class NewGameStore {
	visible: boolean = false;
	doneCallback: DoneCallbackType | null = null;;
	level: number = 1;
	rows: number = 0;

	dialogShow(level: number, rows: number, doneCallback: DoneCallbackType) {
		this.visible = true;
		this.level = level;
		this.rows = rows;
		this.doneCallback = doneCallback;
	}

	dialogCancel() {
		this.visible = false;
		if (this.doneCallback) {
			this.doneCallback(false, 0, 0);
			delete this.doneCallback;
		}
	}

	dialogOK(level: number, rows: number) {
		this.visible = false;
		if (this.doneCallback) {
			this.doneCallback(true, level, rows);
			delete this.doneCallback;
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
