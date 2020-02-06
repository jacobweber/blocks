import { decorate, observable, action } from 'mobx';

type CallbackType = (result: boolean, level?: number, rows?: number) => void;

class NewGameStore {
	visible: boolean = false;
	callback: CallbackType | null = null;;

	dialogShow(callback: CallbackType | null) {
		this.visible = true;
		this.callback = callback;
	}

	dialogCancel() {
		this.visible = false;
		if (this.callback) {
			this.callback(false);
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
	dialogShow: action,
	dialogCancel: action,
	dialogOK: action
});

export { NewGameStore };
