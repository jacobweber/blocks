import { observable, action, computed } from 'mobx';

import { BlockDef, BlockType, defaultBlockDef, PointSymbolID, BlockColor, PointXY, maxBlockSize } from 'utils/blocks';
import { PreferencesStore } from 'stores/PreferencesStore';
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

export type PointBitmap = Array<Array<boolean>>;

export function pointsXYToBitmap(points: Array<PointXY>): PointBitmap {
	const result = Array.from({ length: maxBlockSize }, () => Array.from({ length: maxBlockSize }, () => false));
	points.forEach(point => {
		result[point[0]][point[1]] = true;
	});
	return result;
}

export function pointBitmapToXY(bitmap: PointBitmap, size: number): Array<PointXY> {
	const result: Array<PointXY> = [];
	for (let x = 0; x < bitmap.length && x < size; x++) {
		for (let y = 0; y < bitmap[x].length && y < size; y++) {
			if (bitmap[x][y]) {
				result.push([x, y]);
			}
		}
	}
	return result;
}

class BlockEditStore {
	@observable visible: boolean = false;
	@observable.ref form: BlockEditForm;
	@observable blockType: BlockType | null = null;
	@observable symbolPrefix = 'edit-'; // will need to be blank if using static SVG for pieces

	preferencesStore: PreferencesStore;

	constructor(preferencesStore: PreferencesStore) {
		this.preferencesStore = preferencesStore;
		this.form = {
			...defaultBlockDef,
			odds: String(defaultBlockDef.odds),
			points: pointsXYToBitmap(defaultBlockDef.points)
		};
	}

	@computed get formBlockColors(): Array<BlockColor> {
		return [
			{
				id: this.form.id,
				color: this.form.color
			}
		];
	}

	@action updateForm = (updates: Partial<BlockEditForm>): void => {
		this.form = {
			...this.form,
			...updates
		};
	}

	@action dialogShowAdd() {
		this.blockType = null;
		this.form = {
			...defaultBlockDef,
			id: String(this.preferencesStore.form.blockDefs.length),
			odds: String(defaultBlockDef.odds),
			points: pointsXYToBitmap(defaultBlockDef.points)
		};
		this.visible = true;
	}

	@action dialogShowEdit(type: BlockType, def: BlockDef) {
		this.blockType = type;
		this.form = {
			...def,
			odds: String(def.odds),
			points: pointsXYToBitmap(def.points)
		};
		this.visible = true;
	}

	@action dialogCancel() {
		this.visible = false;
		this.blockType = null;
	}

	@action dialogSave() {
		this.visible = false;
		if (this.form !== null) {
			const def: BlockDef = {
				...this.form,
				id: this.form.id,
				odds: strToIntRange(this.form.odds, 0, 100),
				points: pointBitmapToXY(this.form.points, this.form.size)
			};
			if (this.blockType === null) {
				this.preferencesStore.addBlockDef(def);
			} else {
				this.preferencesStore.updateBlockDef(this.blockType, def);
			}
		}
		this.blockType = null;
	}

	@action dialogDelete() {
		this.visible = false;
		if (this.blockType !== null) {
			this.preferencesStore.deleteBlockDef(this.blockType);
		}
	}
}

export { BlockEditStore };
