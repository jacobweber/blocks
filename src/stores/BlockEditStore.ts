import { decorate, observable, action, computed } from 'mobx';

import { BlockDef, BlockType, defaultBlockDef, PointSymbolID, PointBitmap, pointsXYToBitmap, pointBitmapToXY, BlockColor } from 'utils/blocks';
import { PreferencesStore } from './PreferencesStore';
import { strToIntRange } from 'utils/helpers';

export interface BlockEditForm {
	id: PointSymbolID;
	color: string;
	odds: string;
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
	symbolPrefix = 'edit-'; // will need to be blank if using static SVG for pieces

	preferencesStore: PreferencesStore;

	constructor(preferencesStore: PreferencesStore) {
		this.preferencesStore = preferencesStore;
		this.form = {
			...defaultBlockDef,
			odds: String(defaultBlockDef.odds),
			points: pointsXYToBitmap(defaultBlockDef.points)
		};
	}

	get formBlockColors(): Array<BlockColor> {
		return [
			{
				id: this.form.id,
				color: this.form.color
			}
		];
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
			...defaultBlockDef,
			odds: String(defaultBlockDef.odds),
			points: pointsXYToBitmap(defaultBlockDef.points)
		};
		this.visible = true;
	}

	dialogShowEdit(type: BlockType, def: BlockDef) {
		this.blockType = type;
		this.form = {
			...def,
			odds: String(def.odds),
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
				odds: strToIntRange(this.form.odds, 0, 100),
				points: pointBitmapToXY(this.form.points, this.form.size)
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
	symbolPrefix: observable,
	formBlockColors: computed,
	updateForm: action,
	dialogShowAdd: action,
	dialogShowEdit: action,
	dialogCancel: action,
	dialogSave: action,
	dialogDelete: action
});

export { BlockEditStore };
