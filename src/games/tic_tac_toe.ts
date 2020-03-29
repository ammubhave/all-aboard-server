import { Game } from './interface';
import * as assert from 'assert';
import { rotateArrayRandom } from '../util';

export default class TicTacTow implements Game {
    private onBoardChange: (board: any) => void;

    private playerNames: string[];
    private board: string[][];
    private currentPlayerIndex: number;

    constructor() {
        this.reset();
    }

    public reset() {
        this.board = new Array(3).fill("");
        this.currentPlayerIndex = -1;
    }

    public start(playerNames: string[]) {
        assert.equal(playerNames.length, 2, "Exactly 2 players can play");
        this.playerNames = rotateArrayRandom(playerNames);
        this.currentPlayerIndex = 0;
    }

    public setOnBoardChangeCallback(onBoardChange: (board: any) => void) {
        this.onBoardChange = onBoardChange;
    }

    public setOnHandChangeCallback(_onHandChange: (playerName: string, hand: any) => void) {
    }

    public getBoard() {
        return {
            board: this.board,
            currentPlayer: this.currentPlayerIndex !== -1 ? this.playerNames[this.currentPlayerIndex] : undefined,
            winner: this.getWinner(),
        };
    }

    public getHand(playerName: string): any {
        return undefined;
    }

    public takeAction(playerName: string, [x, y]: [number, number]) {
        assert.notEqual(this.currentPlayerIndex, -1, "Game has not started");
        assert.equal(this.getWinner(), undefined, "Game has already ended");
        assert.equal(this.board[y][x], "", "This space is already occupied");

        const playerSymbol = this.getPlayerIndex(playerName) === 0 ? "X" : "O";
        this.board[y][x] = playerSymbol;
        this.onBoardChange(this.getBoard());
    }

    private getPlayerIndex(playerName: string) {
        return this.playerNames.indexOf(playerName);
    }

    private getWinner(): number {
        for (const player of ["X", "O"]) {
            const playerIndex = player === "X" ? 0 : 1;
            for (let i = 0; i < 3; i++) {
                if (this.board[i].every(value => value === player))
                    return playerIndex;
            }
            for (let i = 0; i < 3; i++) {
                if (this.board.every(row => row[i] === player))
                    return playerIndex;
            }
            if (this.board.every((row, i) => row[i] == player))
                return playerIndex;
            if (this.board.every((row, i) => row[row.length - i - 1] == player))
                return playerIndex;
        }

        return undefined;
    }
}