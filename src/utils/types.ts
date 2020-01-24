export enum GameState { Stopped, Active, Paused };

export enum KeyActions { NewGame, EndGame, PauseResumeGame, Left, Right, Down, Drop, RotateCCW, RotateCW, Undo }

export type ActionName = 'newGame' | 'endGame' | 'pauseResumeGame' | 'left' | 'right' | 'drop' | 'down' | 'rotateCCW' | 'rotateCW' | 'undo';
