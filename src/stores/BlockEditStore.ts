import { decorate, observable, action } from 'mobx';

import { BlockDef, BlockType, defaultEdit, PointSymbolID, PointBitmap, pointsXYToBitmap, pointBitmapToXY } from 'utils/blocks';
import { PreferencesStore } from './PreferencesStore';

export interface BlockEditForm {
	id: PointSymbolID;
	color: string;
	odds: number | '';
	size: number;
	rotate90: boolean;
	rotate180: boolean;
	rotate270: boolean;
	points: PointBitmap;
}

class BlockEditStore {
	visible: boolean = false;
	form: BlockEditForm;
	blockType: BlockType | null = null;

	preferencesStore: PreferencesStore;

	constructor(preferencesStore: PreferencesStore) {
		this.preferencesStore = preferencesStore;
		this.form = {
			...defaultEdit,
			points: pointsXYToBitmap(defaultEdit.points)
		};
	}

	addBlockDef(def: BlockDef): void {
		this.preferencesStore.setForm({
			...this.preferencesStore.form,
			blockDefs: [
				...this.preferencesStore.form.blockDefs,
				def
			]
		});
	}

	updateBlockDef(type: BlockType, def: BlockDef): void {
		this.preferencesStore.setForm({
			...this.preferencesStore.form,
			blockDefs: [
				...this.preferencesStore.form.blockDefs.slice(0, type),
				def,
				...this.preferencesStore.form.blockDefs.slice(type + 1)
			]
		});
	}

	deleteBlockDef(type: BlockType): void {
		this.preferencesStore.setForm({
			...this.preferencesStore.form,
			blockDefs: [
				...this.preferencesStore.form.blockDefs.slice(0, type),
				...this.preferencesStore.form.blockDefs.slice(type + 1)
			]
		});
	}

	updateForm = (updates: Partial<BlockEditForm>): void => {
		this.form = {
			...this.form,
			...updates
		};
	}

	dialogShowAdd() {
		this.blockType = null;
		this.form = {
			...defaultEdit,
			points: pointsXYToBitmap(defaultEdit.points)
		};
		this.visible = true;
	}

	dialogShowEdit(type: BlockType, def: BlockDef) {
		this.blockType = type;
		this.form = {
			...def,
			points: pointsXYToBitmap(def.points)
		};
		this.visible = true;
	}

	dialogCancel() {
		this.visible = false;
		this.blockType = null;
	}

	dialogSave() {
		this.visible = false;
		if (this.form !== null) {
			const def: BlockDef = {
				...this.form,
				odds: this.form.odds === '' ? 0 : this.form.odds,
				points: pointBitmapToXY(this.form.points)
			};
			if (this.blockType === null) {
				this.addBlockDef(def);
			} else {
				this.updateBlockDef(this.blockType, def);
			}
		}
		this.blockType = null;
	}

	dialogDelete() {
		this.visible = false;
		if (this.blockType !== null) {
			this.deleteBlockDef(this.blockType);
		}
	}
}

decorate(BlockEditStore, {
	visible: observable,
	form: observable.ref,
	blockType: observable,
	updateForm: action,
	dialogShowAdd: action,
	dialogShowEdit: action,
	dialogCancel: action,
	dialogSave: action,
	dialogDelete: action
});

export { BlockEditStore };
