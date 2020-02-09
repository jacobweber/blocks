import { observable, action } from 'mobx';

type DoneCallbackType = (result: boolean, level: number, rows: number) => void;

class NewGameStore {
	@observable visible: boolean = false;
	doneCallback: DoneCallbackType | null = null;;
	@observable level: number = 1;
	@observable rows: number = 0;

	@action dialogShow(level: number, rows: number, doneCallback: DoneCallbackType) {
		this.visible = true;
		this.level = level;
		this.rows = rows;
		this.doneCallback = doneCallback;
	}

	@action dialogCancel() {
		this.visible = false;
		if (this.doneCallback) {
			this.doneCallback(false, 0, 0);
			delete this.doneCallback;
		}
	}

	@action dialogOK(level: number, rows: number) {
		this.visible = false;
		if (this.doneCallback) {
			this.doneCallback(true, level, rows);
			delete this.doneCallback;
		}
	}
}

export { NewGameStore };
