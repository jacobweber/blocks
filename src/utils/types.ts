export enum GameState { Reset, Ended, Active, Paused };

export enum KeyActions { NewGame, NewGameOptions, EndGame, PauseResumeGame, Left, LeftAccel, Right, RightAccel, Down, Drop, RotateCCW, RotateCW, Undo }

export type ActionName = 'newGame' | 'newGameOptions' | 'endGame' | 'pauseResumeGame' | 'left' | 'right' | 'down' | 'drop' | 'rotateCCW' | 'rotateCW' | 'undo';
