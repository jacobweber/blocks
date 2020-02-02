export enum GameState { Stopped, Active, Paused };

export enum KeyActions { NewGame, EndGame, PauseResumeGame, Left, LeftAccel, Right, RightAccel, Down, Drop, RotateCCW, RotateCW, Undo }

export type ActionName = 'newGame' | 'endGame' | 'pauseResumeGame' | 'left' | 'right' | 'down' | 'drop' | 'rotateCCW' | 'rotateCW' | 'undo';
