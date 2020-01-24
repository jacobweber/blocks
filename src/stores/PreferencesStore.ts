import { decorate, observable, action } from 'mobx';

class PreferencesStore {
	visible: boolean = false;

	show() {
		this.visible = true;
	}

	hide() {
		this.visible = false;
	}

	save() {
		this.visible = false;
	}
}

decorate(PreferencesStore, {
	visible: observable,
	show: action,
	hide: action,
	save: action
});

export { PreferencesStore };
