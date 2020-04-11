import { Game } from './interface';
import * as assert from 'assert';
import { rotateArrayRandom, shuffleArrayRandom } from '../util';
import { readFileSync } from "fs";
import path from "path";

type BoardCell = {
    kind: string,
    color?: string,
    value?: string,
    isSelectable?: boolean,
};

export default class Codenames implements Game {
    private allWords: string[];
    private bluePlayers: string[];
    private redPlayers: string[];
    private playersStandingBy: string[];

    private boardWords: string[][];
    private boardColors: string[][];
    private boardRevealed: boolean[][];
    private status: "player-selection" | "board" | "game-over";
    private currentTurn: string;

    private onContentChange: (playerName: string, content: any) => void;

    constructor() {
        this.onContentChange = () => { };
        this.allWords = readFileSync('./src/games/codenames-words.txt').toString().split('\n').map(word => word.trim().toUpperCase());
        this.playersStandingBy = [];
        this.currentTurn = undefined;
        this.redPlayers = [];
        this.bluePlayers = [];
        console.log(this.allWords);

        this.reset();
    }

    public addPlayer(playerName: string) {
        if (playerName === "board") return;

        if (this.status === "player-selection") {
            if (this.bluePlayers.length < this.redPlayers.length) this.bluePlayers.push(playerName);
            else this.redPlayers.push(playerName);
        } else {
            this.playersStandingBy.push(playerName);
        }
        this.refresh();
    }

    public removePlayer(playerName: string) {
        if (playerName === "board") return;

        if (this.status === "player-selection") {
            if (this.bluePlayers.indexOf(playerName) !== -1) this.bluePlayers.splice(this.bluePlayers.indexOf(playerName), 1);
            if (this.redPlayers.indexOf(playerName) !== -1) this.redPlayers.splice(this.redPlayers.indexOf(playerName), 1);
        } else {
            this.playersStandingBy.splice(this.playersStandingBy.indexOf(playerName), 1);
        }
        this.refresh();
    }

    public setOnContentChangeCallback(onContentChange: (playerName: string, content: any) => void) {
        this.onContentChange = onContentChange;
    }

    public getContent(playerName: string) {
        const buttons: [string, string, boolean][] = [["Back", "back", true]];
        let displayText = "";
        let playerNameDisplay: string | null = null;
        let board: BoardCell[][] = [];

        const redCodemaster = this.redPlayers.length >= 1 ? this.redPlayers[0] : undefined;
        const blueCodemaster = this.bluePlayers.length >= 1 ? this.bluePlayers[0] : undefined;
        const playerTeam = this.getPlayerTeam(playerName);
        const playerTeamCapitalized = playerTeam === "red" ? "Red" : "Blue";
        const otherTeamCapitalized = playerTeam === "red" ? "Blue" : "Red";

        const colorToKind = (color: string) => {
            switch (color) {
                case 'red':
                    return 'agent-red';
                case 'blue':
                    return 'agent-blue';
                case 'white':
                    return 'bystander';
                case 'black':
                    return 'assasin';
            }
        };

        if (this.status === "player-selection") {
            if (playerName !== "board") {
                buttons.push(["Become Codemaster", "become-codemaster", !this.isCodemaster(playerName)]);
                buttons.push(["Switch to " + (playerTeam === "red" ? "Blue" : "Red") + " Team", "switch-team", true]);
            }

            buttons.push(["Start Game", "start", this.redPlayers.length >= 2 && this.bluePlayers.length >= 2]);

            displayText = "Player Selection";
            if (playerName !== "board") {
                displayText += " (" + playerName + ")";
            }
        } else if (this.status === "board") {
            this.boardWords.forEach((row, rowIndex) => {
                board.push([]);
                row.forEach((word, colIndex) => {
                    board[board.length - 1].push({
                        kind: this.boardRevealed[rowIndex][colIndex] ? colorToKind(this.boardColors[rowIndex][colIndex]) : "word",
                        color: (this.isCodemaster(playerName) || this.boardRevealed[rowIndex][colIndex]) ? this.boardColors[rowIndex][colIndex] : "white",
                        value: word,
                        isSelectable: (!this.isCodemaster(playerName) && !this.boardRevealed[rowIndex][colIndex] && playerTeam === this.currentTurn)
                    });
                });
            });

            buttons.push(["Reset", "reset", true]);
            if (playerName === redCodemaster || playerName === blueCodemaster) {
                displayText = this.currentTurn === playerTeam ? ("Your team's turn") : (otherTeamCapitalized + " team's turn");
                playerNameDisplay = playerName + " - " + playerTeamCapitalized + " Team - Codemaster";
            } else if (this.bluePlayers.indexOf(playerName) !== -1 || this.redPlayers.indexOf(playerName) !== -1) {
                displayText = this.currentTurn === playerTeam ? ("Your turn") : (otherTeamCapitalized + " team's turn");
                playerNameDisplay = playerName + " - " + playerTeamCapitalized + " Team - Player";
                buttons.push(["End Turn", "end-turn", playerTeam === this.currentTurn]);
            } else { // unjoined player / board
                displayText = this.currentTurn === playerTeam ? (playerTeamCapitalized + " team's turn") : otherTeamCapitalized + " team's turn";
                if (playerName !== "board")
                    playerNameDisplay = playerName;
            }
        } else if (this.status === "game-over") {
            this.boardWords.forEach((row, rowIndex) => {
                board.push([]);
                row.forEach((word, colIndex) => {
                    board[board.length - 1].push({
                        kind: this.boardRevealed[rowIndex][colIndex] ? colorToKind(this.boardColors[rowIndex][colIndex]) : "word",
                        color: this.boardColors[rowIndex][colIndex],
                        value: word,
                        isSelectable: false,
                    });
                });
            });

            buttons.push(["Reset", "reset", true]);
            displayText = (this.currentTurn === "red" ? "Red" : "Blue") + " Team Wins!";
            playerNameDisplay = playerName + " - " + playerTeamCapitalized + " Team";
        }

        return {
            players: {
                red: this.redPlayers.slice(1),
                redCodemaster,
                blue: this.bluePlayers.slice(1),
                blueCodemaster,
            },
            buttons,
            playerNameDisplay,
            displayText,
            status: this.status,
            board,
        };
    }

    public takeAction(playerName: string, action: any) {
        switch (action.type) {
            case "reset":
                this.reset();
                break;
            case "become-codemaster":
                {
                    const team = this.getPlayerTeam(playerName);
                    if (team === "red") {
                        this.redPlayers.splice(this.redPlayers.indexOf(playerName), 1);
                        this.redPlayers.unshift(playerName);
                    } else {
                        this.bluePlayers.splice(this.bluePlayers.indexOf(playerName), 1);
                        this.bluePlayers.unshift(playerName);
                    }
                }
                break;
            case "switch-team":
                {
                    const team = this.getPlayerTeam(playerName);
                    if (team === "red") {
                        this.redPlayers.splice(this.redPlayers.indexOf(playerName), 1);
                        this.bluePlayers.push(playerName);
                    } else {
                        this.bluePlayers.splice(this.bluePlayers.indexOf(playerName), 1);
                        this.redPlayers.push(playerName);
                    }
                }
                break;
            case "start":
                this.start();
                break;
            case "card":
                if (this.boardRevealed[action.rowIndex][action.colIndex]) return;

                this.boardRevealed[action.rowIndex][action.colIndex] = true;
                if (this.boardColors[action.rowIndex][action.colIndex] === "white" || this.boardColors[action.rowIndex][action.colIndex] === (this.getPlayerTeam(playerName) === "red" ? "blue" : "red")) {
                    this.currentTurn = this.currentTurn === "red" ? "blue" : "red";
                } else if (this.boardColors[action.rowIndex][action.colIndex] === "black") {
                    this.currentTurn === "red" ? "blue" : "red";
                    this.status = "game-over";
                } else {
                    if (this.isWon(this.getPlayerTeam(playerName))) {
                        this.status = "game-over";
                    }
                }
                break;
            case "end-turn":
                this.currentTurn = this.currentTurn === "red" ? "blue" : "red";
                break;
        }

        this.refresh();
    }

    private refresh() {
        this.onContentChange("board", this.getContent("board"));
        [...this.redPlayers, ...this.bluePlayers].forEach(playerName => this.onContentChange(playerName, this.getContent(playerName)));
    }

    private reset() {
        this.status = "player-selection";

        let indices: number[] = [];
        this.redPlayers.forEach((playerName, index) => {
            if (this.playersStandingBy.indexOf(playerName) === -1) {
                indices.push(index);
            } else {
                this.playersStandingBy.splice(this.playersStandingBy.indexOf(playerName), 1);
            }
        });
        for (const index of indices.reverse()) {
            this.redPlayers.splice(index, 1);
        }

        indices = [];
        this.bluePlayers.forEach((playerName, index) => {
            if (this.playersStandingBy.indexOf(playerName) === -1) {
                indices.push(index);
            } else {
                this.playersStandingBy.splice(this.playersStandingBy.indexOf(playerName), 1);
            }
        });
        for (const index of indices.reverse()) {
            this.bluePlayers.splice(index, 1);
        }

        this.playersStandingBy.forEach(playerName => this.addPlayer(playerName));
        this.playersStandingBy = [];

        this.boardWords = [];
        this.boardColors = [];
        this.boardRevealed = [];
        for (let i = 0; i < 5; i++) this.boardRevealed.push(new Array(5).fill(false));
        this.refresh();
    }

    private start() {
        this.status = "board";

        shuffleArrayRandom(this.allWords).slice(0, 25).forEach(word => {
            if (this.boardWords.length === 0 || this.boardWords[this.boardWords.length - 1].length >= 5) this.boardWords.push([]);
            this.boardWords[this.boardWords.length - 1].push(word);
        });

        this.currentTurn = shuffleArrayRandom(["red", "blue"]).pop();

        shuffleArrayRandom([
            ...new Array<string>(8).fill("red"),
            ...new Array<string>(8).fill("blue"),
            ...new Array<string>(7).fill("white"),
            "black",
            this.currentTurn]).forEach(color => {
                if (this.boardColors.length === 0 || this.boardColors[this.boardColors.length - 1].length >= 5) this.boardColors.push([]);
                this.boardColors[this.boardColors.length - 1].push(color);
            });

        [...this.redPlayers, ...this.bluePlayers].forEach(playerName => this.playersStandingBy.push(playerName));
    }

    private getPlayerTeam(playerName: string) {
        if (this.redPlayers.indexOf(playerName) !== -1) return "red";
        if (this.bluePlayers.indexOf(playerName) !== -1) return "blue";
        return undefined;
    }

    private otherTeam(team: string) {
        if (team == "red") return "blue"; else return "red";
    }

    private isCodemaster(playerName: string) {
        return (this.redPlayers.length > 0 && this.redPlayers[0] === playerName) || (this.bluePlayers.length > 0 && this.bluePlayers[0] === playerName);
    }

    private isWon(team: string) {
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                if (!this.boardRevealed[i][j] && this.boardColors[i][j] === team)
                    return false;
            }
        }
        return true;
    }
}