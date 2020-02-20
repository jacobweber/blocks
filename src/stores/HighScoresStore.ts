import { observable, action } from 'mobx';

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

const minHighScore = 0;
const numScores = 10;

type DoneCallbackType = () => void;

class HighScoresStore {
	@observable visible: boolean = false;
	doneCallback: DoneCallbackType | null = null;
	@observable lastScoreName: string = '';
	@observable.ref scores: HighScores = defaultScores;
	@observable lastPosition: number | null = null;

	@action load() {
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

	@action save() {
		const str = JSON.stringify(this.scores);
		window.localStorage.setItem('highScores', str);
	}

	@action dialogShow(doneCallback?: DoneCallbackType) {
		this.visible = true;
		if (doneCallback) {
			this.doneCallback = doneCallback;
		}
	}

	@action dialogHide() {
		if (this.lastPosition !== null) {
			const entries = [...this.scores.entries];
			entries[this.lastPosition].name = this.lastScoreName;
			this.setScores({
				entries
			});
		}
		this.visible = false;
		this.lastPosition = null;
		if (this.doneCallback) {
			this.doneCallback();
			delete this.doneCallback;
		}
	}

	@action dialogReset() {
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

	@action recordIfHighScore(entry: HighScore): number | null {
		if (entry.score < minHighScore) return null;
		const position = this.getScorePosition(entry);
		if (position !== null) {
			this.setScores({
				entries: this.getScoresAfterAdding(entry, position)
			});
			this.lastScoreName = entry.name;
			this.lastPosition = position;
			return position;
		} else {
			return null;
		}
	}

	@action handleChangeLastScoreName(e: React.ChangeEvent<HTMLInputElement>): void {
		this.lastScoreName = e.target.value;
	}

	@action setScores(scores: HighScores): void {
		this.scores = scores;
		this.save();
	}
}

export { HighScoresStore };
