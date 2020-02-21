import { observable, computed, action } from 'mobx';
import { PointXY, PointSymbolID } from 'utils/blocks';
import { debounce } from 'utils/helpers';

const extraHeightHoriz = 50;
const extraWidthHoriz = 200;
const extraHeightVert = 200;
const extraWidthVert = 50;

export interface FilledPoint {
	id: PointSymbolID;
}

export interface PositionedPoint {
	x: number;
	y: number;
	id: PointSymbolID;
}

class BoardStore {
	@observable filledPoints: Array<Array<FilledPoint | null>> = []; // [y][x]
	@observable width: number = 0;
	@observable height: number = 0;
	@observable windowWidth: number = 0;
	@observable windowHeight: number = 0;

	initWindowEvents() {
		this.updateWindowSize();
		window.addEventListener('resize', debounce(() => this.updateWindowSize(), 100));
	}

	@action updateWindowSize() {
		this.windowWidth = window.innerWidth;
		this.windowHeight = window.innerHeight;
	}

	@computed get actualPointSizeHoriz(): number {
		const minWidth = Math.floor((this.windowWidth - extraWidthHoriz) / this.width);
		const minHeight = Math.floor((this.windowHeight - extraHeightHoriz) / this.height);
		return Math.min(minHeight, minWidth);
	}

	@computed get actualPointSizeVert(): number {
		const minWidth = Math.floor((this.windowWidth - extraWidthVert) / this.width);
		const minHeight = Math.floor((this.windowHeight - extraHeightVert) / this.height);
		return Math.min(minHeight, minWidth);
	}

	@computed get actualPointSize(): number {
		return Math.min(Math.max(this.vertical ? this.actualPointSizeVert : this.actualPointSizeHoriz, 10), 30);
	}

	@computed get vertical(): boolean {
		return this.windowHeight > this.windowWidth;
	}

	@action lockSize(width: number, height: number) {
		this.width = width;
		this.height = height;
	}

	@action reset(): void {
		this.filledPoints = Array.from({ length: this.height }, () => Array.from({ length: this.width }));
	}

	@action fillPoint(x: number, y: number, point: FilledPoint | null): void {
		this.filledPoints[y][x] = point;
	}

	getFilledPoint(x: number, y: number): FilledPoint | null {
		return this.filledPoints[y][x];
	}

	pointsFree(points: Array<PointXY>): boolean {
		for (let i = 0; i < points.length; i++) {
			const point = points[i];
			if (point[1] >= 0 && this.filledPoints[point[1]][point[0]]) {
				return false;
			}
		}
		return true;
	}

	@action markPointsFilled(points: Array<PointXY>, filledPoint: FilledPoint | null): void {
		points.forEach(point => {
			if (point[1] >= 0) {
				this.filledPoints[point[1]][point[0]] = filledPoint;
			}
		});
	}

	isRowFilled(row: number): boolean {
		if (row < 0 || row >= this.height) return false;
		const rowPoints = this.filledPoints[row];
		for (let x = 0; x < this.width; x++) {
			if (!rowPoints[x]) {
				return false;
			}
		}
		return true;
	}

	@action fillRow(row: number, point: FilledPoint): void {
		this.filledPoints[row] = Array.from({ length: this.width }, () => point);
	}

	@action clearRows(rows: number[]): void {
		if (rows.length === 0) return;
		for (let row = rows.length - 1; row >= 0; row--) {
			this.filledPoints.splice(rows[row], 1);
		}
		for (let row = 0; row < rows.length; row++) {
			this.filledPoints.unshift(Array.from({ length: this.width }));
		}
	}

	getFrozenPoints(): Array<PositionedPoint> {
		const points: Array<PositionedPoint> = [];
		for (let x = 0; x < this.width; x++) {
			for (let y = 0; y < this.height; y++) {
				const point = this.filledPoints[y][x];
				if (point) {
					points.push({
						x,
						y,
						id: point.id
					});
				}
			}
		}
		return points;
	}
}

export { BoardStore };
