import { decorate, observable, action } from 'mobx';

export interface HighScore {
	name: string;
	score: number;
	rows: number;
	startLevel: number;
	endLevel: number;
	totalTime: number;
	time: number;
}

export interface HighScores {
	entries: Array<HighScore>;
}

const defaultScores: HighScores = {
	entries: []
}

const numScores = 10;

class HighScoresStore {
	visible: boolean = false;
	scores: HighScores = defaultScores;
	lastPosition: number | null = null;

	load() {
		const str = window.localStorage.getItem('highScores');
		let scores;
		if (str) {
			try {
				scores = JSON.parse(str);
			} catch (e) {
			}
		}
		this.scores = Object.assign({}, defaultScores, scores || {});
	}

	save() {
		const str = JSON.stringify(this.scores);
		window.localStorage.setItem('highScores', str);
	}

	dialogShow() {
		this.visible = true;
	}

	dialogHide() {
		this.visible = false;
		this.lastPosition = null;
	}

	dialogReset() {
		this.setScores(defaultScores);
		this.lastPosition = null;
	}

	getScorePosition(entry: HighScore): number | null {
		for (let i = 0; i < this.scores.entries.length; i++) {
			if (entry.score > this.scores.entries[i].score) {
				return i;
			}
		};
		if (this.scores.entries.length < numScores) {
			return this.scores.entries.length;
		}
		return null;
	}

	getScoresAfterAdding(entry: HighScore, position: number): Array<HighScore> {
		const scores = this.scores.entries;
		return [ ...scores.slice(0, position), entry, ...scores.slice(position) ].slice(0, numScores);
	}

	recordIfHighScore(entry: HighScore): number | null {
		const position = this.getScorePosition(entry);
		if (position !== null) {
			this.setScores({
				entries: this.getScoresAfterAdding(entry, position)
			});
			this.lastPosition = position;
			return position;
		} else {
			return null;
		}
	}

	setScores(scores: HighScores): void {
		this.scores = scores;
		this.save();
	}
}

decorate(HighScoresStore, {
	visible: observable,
	scores: observable.ref,
	lastPosition: observable,
	load: action,
	save: action,
	setScores: action,
	dialogShow: action,
	dialogHide: action,
	dialogReset: action,
	recordIfHighScore: action
});

export { HighScoresStore };