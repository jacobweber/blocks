import { observable, computed, action } from 'mobx';
import { PointXY, PointSymbolID } from 'utils/blocks';
import { debounce } from 'utils/helpers';

const appPadding = 10;
const sidebarWidth = 170;
const touchSidebarWidth = 120;
const touchSidebarHeight = 130;
const minPointSize = 10;
const maxPointSize = 30;

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
		const useTouch = 'ontouchstart' in window;
		const maxWidth = Math.floor((this.windowWidth - (useTouch ? touchSidebarWidth : sidebarWidth) - (appPadding * 2)) / this.width);
		const maxHeight = Math.floor((this.windowHeight - (appPadding * 2)) / this.height);
		return Math.min(maxHeight, maxWidth);
	}

	@computed get actualPointSizeVert(): number {
		const maxWidth = Math.floor((this.windowWidth - (appPadding * 2)) / this.width);
		const maxHeight = Math.floor((this.windowHeight - touchSidebarHeight - (appPadding * 2)) / this.height);
		return Math.min(maxHeight, maxWidth);
	}

	@computed get actualPointSize(): number {
		return Math.min(Math.max(this.vertical ? this.actualPointSizeVert : this.actualPointSizeHoriz, minPointSize), maxPointSize);
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
