import { Game } from './interface';
import * as assert from 'assert';
import { rotateArrayRandom, shuffleArrayRandom } from '../util';

export default class Sequence implements Game {
    private static readonly BOARD_LAYOUT = [
        ["XX", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "XX"],
        ["C6", "C5", "C4", "C3", "C2", "HA", "HK", "HQ", "HT", "ST"],
        ["C7", "SA", "D2", "D3", "D4", "D5", "D6", "D7", "H9", "SQ"],
        ["C8", "SK", "C6", "C5", "C4", "C3", "C2", "D8", "H8", "SK"],
        ["C9", "SQ", "C7", "H6", "H5", "H4", "HA", "D9", "H7", "SA"],
        ["CT", "ST", "C8", "H7", "H2", "H3", "HK", "DT", "H6", "D2"],
        ["CQ", "S9", "C9", "H8", "H9", "HT", "HQ", "DQ", "H5", "D3"],
        ["CK", "S8", "CT", "CQ", "CK", "CA", "DA", "DK", "H4", "D4"],
        ["CA", "S7", "S6", "S5", "S4", "S3", "S2", "H2", "H3", "D5"],
        ["XX", "DA", "DK", "DQ", "DT", "D9", "D8", "D7", "D6", "XX"]
    ];

    private static readonly ALL_CARDS = (() => {
        const allCards: string[] = [];
        for (const suit of ["H", "C", "S", "D"]) {
            for (const val of ["A", "2", "3", "4", "5", "6", "7", "8", "9", "T", "Q", "K"]) {
                allCards.push(suit + val);
                allCards.push(suit + val);
            }
            allCards.push(suit + "j");
            allCards.push(suit + "J");
        }
        return allCards;
    })();

    private onBoardChange: (board: any) => void;
    private onHandChange: (playerName: string, hand: any) => void;

    private playerNames: string[];
    private board: string[][];
    private currentPlayerIndex: number;
    private drawPile: string[];
    private playerHands: string[][];

    constructor() {
        this.onBoardChange = () => { };
        this.onHandChange = () => { };
        this.reset();
    }

    public reset() {
        this.playerNames = [];
        this.board = [];
        Sequence.BOARD_LAYOUT.forEach(row => {
            this.board.push(new Array(row.length).fill(""));
        });
        this.resetDrawPile();
        this.currentPlayerIndex = -1;
        this.playerHands = [];
        this.onBoardChange(this.getBoard());
        this.playerNames.forEach(playerName => this.onHandChange(playerName, this.getHand(playerName)));
    }

    public start(playerNames: string[]) {
        assert.notEqual(playerNames.length, 0, "No player connected");

        playerNames.forEach((_, playerIndex) => {
            this.playerHands.push([]);
            for (let i = 0; i < this.getInitialHandSize(playerNames.length); i++) {
                this.drawFromDrawPile(playerIndex);
            }
        });
        this.playerNames = rotateArrayRandom(playerNames);
        this.currentPlayerIndex = 0;
        this.onBoardChange(this.getBoard());
        this.playerNames.forEach(playerName => this.onHandChange(playerName, this.getHand(playerName)));
    }

    public setOnBoardChangeCallback(onBoardChange: (board: any) => void) {
        this.onBoardChange = onBoardChange;
    }

    public setOnHandChangeCallback(onHandChange: (playerName: string, hand: any) => void) {
        this.onHandChange = onHandChange;
    }

    public getBoard() {
        const layout = Sequence.BOARD_LAYOUT.map((row, rowIndex) => row.map((card, colIndex) => {
            return {
                card,
                state: this.board[rowIndex][colIndex],
            };
        }));

        return {
            layout,
            currentPlayer: this.currentPlayerIndex !== -1 ? this.playerNames[this.currentPlayerIndex] : undefined,
            // winner: this.getWinner(),
        };
    }

    public getHand(playerName: string) {
        const playerIndex = this.getPlayerIndex(playerName);
        if (playerIndex === -1) {
            return {};
        }
        return {
            hand: this.playerHands[playerIndex]
        };
    }

    public takeAction(playerName: string, [x, y]: [number, number]) {
        assert.notEqual(this.currentPlayerIndex, -1, "Game has not started");
        // assert.equal(this.getWinner(), undefined, "Game has already ended");
        assert.equal(this.board[y][x], "", "This space is already occupied");

        const playerSymbol = this.getPlayerIndex(playerName) === 0 ? "X" : "O";
        this.board[y][x] = playerSymbol;
        this.onBoardChange(this.getBoard());
    }

    private resetDrawPile() {
        this.drawPile = shuffleArrayRandom(Sequence.ALL_CARDS.slice());
    }

    private drawFromDrawPile(playerIndex: number) {
        if (this.drawPile.length === 0) {
            this.resetDrawPile();
        }
        this.playerHands[playerIndex].push(this.drawPile.pop());
    }

    private getPlayerIndex(playerName: string) {
        return this.playerNames.indexOf(playerName);
    }

    private getInitialHandSize(playerCount: number) {
        switch (playerCount) {
            case 2:
                return 7;
            case 3:
            case 4:
                return 6;
            case 6:
                return 5;
            case 8:
            case 9:
                return 4;
            case 10:
            case 12:
                return 3;
        }
        assert.fail("Invalid player count: " + playerCount);
    }
}