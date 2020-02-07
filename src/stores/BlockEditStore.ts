import { decorate, observable, action } from 'mobx';

import { BlockDef, BlockType, defaultEdit } from 'utils/blocks';
import { PreferencesStore } from './PreferencesStore';

class BlockEditStore {
	visible: boolean = false;
	blockType: BlockType | null = null;
	adding: boolean = false;
	preferencesStore: PreferencesStore;

	constructor(preferencesStore: PreferencesStore) {
		this.preferencesStore = preferencesStore;
	}

	addBlockDef(def: BlockDef): void {
		this.preferencesStore.setPrefsEdited({
			...this.preferencesStore.prefsEdited,
			blockDefs: [
				...this.preferencesStore.prefsEdited.blockDefs,
				def
			]
		});
	}

	updateBlockDef(type: BlockType, def: BlockDef): void {
		this.preferencesStore.setPrefsEdited({
			...this.preferencesStore.prefsEdited,
			blockDefs: [
				...this.preferencesStore.prefsEdited.blockDefs.slice(0, type),
				def,
				...this.preferencesStore.prefsEdited.blockDefs.slice(type + 1)
			]
		});
	}

	deleteBlockDef(type: BlockType): void {
		this.preferencesStore.setPrefsEdited({
			...this.preferencesStore.prefsEdited,
			blockDefs: [
				...this.preferencesStore.prefsEdited.blockDefs.slice(0, type),
				...this.preferencesStore.prefsEdited.blockDefs.slice(type + 1)
			]
		});
	}

	dialogShowAdd() {
		this.blockType = this.preferencesStore.prefsEdited.blockDefs.length;
		this.adding = true;
		this.addBlockDef(defaultEdit);
		this.visible = true;
	}

	dialogShowEdit(type: BlockType, def: BlockDef) {
		this.blockType = type;
		this.adding = false;
		this.visible = true;
	}

	dialogCancel() {
		this.visible = false;
		if (this.adding && this.blockType !== null) {
			this.deleteBlockDef(this.blockType);
		}
		this.blockType = null;
		this.adding = false;
	}

	dialogSave(def: BlockDef) {
		this.visible = false;
		if (this.blockType !== null) {
			this.updateBlockDef(this.blockType, def);
		}
		this.blockType = null;
		this.adding = false;
	}

	dialogDelete() {
		this.visible = false;
		if (this.blockType !== null) {
			this.deleteBlockDef(this.blockType);
		}
		this.adding = false;
	}
}

decorate(BlockEditStore, {
	visible: observable,
	blockType: observable,
	dialogShowAdd: action,
	dialogShowEdit: action,
	dialogCancel: action,
	dialogSave: action,
	dialogDelete: action
});

export { BlockEditStore };
