import { Game } from '../interface';
import * as assert from 'assert';
import { shuffleArrayRandom } from '../../util';

function hasKey<O>(obj: O, key: keyof any): key is keyof O {
    return key in obj
}

type CardColor = "black" | "blue" | "green" | "red" | "white";
type CoinColor = CardColor | "gold";
type CardCost = { black?: number, blue?: number, green?: number, red?: number, white?: number; };
export type CardInfo = {
    color: CardColor,
    prestige: number,
    cost: CardCost,
    isSelectable?: boolean,
};
type NobleInfo = {
    cost: { color: CardColor, count: number; }[],
    prestige: number,
    nobleIndex: number,
    isSelectable?: boolean,
};

type Card = {
    color: CardColor,
    prestige: number,
    cost: { white: number, black: number, red: number, blue: number, green: number; };
    level: number,
};

type Noble = {
    cost: { color: CardColor, count: number; }[],
    prestige: number,
    nobleIndex: number,
};

type BoardState = {
    faceupCards: Card[][],
    coins: { white: number, black: number, red: number, blue: number, green: number, gold: number; },
    nobles: Noble[],
    currentPlayerIndex: number,
};

type PlayerState = {
    cards: {
        green: number,
        blue: number,
        red: number,
        white: number,
        black: number,
    },
    coins: {
        green: number,
        blue: number,
        red: number,
        white: number,
        black: number,
        gold: number,
    },
    reservedCards: Card[],
    prestige: number,
};

export default class Splendor implements Game {
    LEVEL1_WHITE = [
        [0, 3, 0, 0, 0, 0],
        [0, 0, 0, 2, 1, 0],
        [0, 1, 1, 1, 1, 0],
        [0, 2, 0, 0, 2, 0],
        [0, 0, 4, 0, 0, 1],
        [0, 1, 2, 1, 1, 0],
        [0, 2, 2, 0, 1, 0],
        [3, 1, 0, 0, 1, 0],
    ];
    LEVEL1_BLUE = [
        [1, 0, 0, 0, 2, 0],
        [0, 0, 0, 0, 3, 0],
        [1, 0, 1, 1, 1, 0],
        [0, 0, 2, 0, 2, 0],
        [0, 0, 0, 4, 0, 1],
        [1, 0, 1, 2, 1, 0],
        [1, 0, 2, 2, 0, 0],
        [0, 1, 3, 1, 0, 0],
    ];
    LEVEL1_GREEN = [
        [2, 1, 0, 0, 0, 0],
        [0, 0, 0, 3, 0, 0],
        [1, 1, 0, 1, 1, 0],
        [0, 2, 0, 2, 0, 0],
        [0, 0, 0, 0, 4, 1],
        [1, 1, 0, 1, 2, 0],
        [0, 1, 0, 2, 2, 0],
        [1, 3, 1, 0, 0, 0],
    ];
    LEVEL1_RED = [
        [0, 2, 1, 0, 0, 0],
        [3, 0, 0, 0, 0, 0],
        [1, 1, 1, 0, 1, 0],
        [2, 0, 0, 2, 0, 0],
        [4, 0, 0, 0, 0, 1],
        [2, 1, 1, 0, 1, 0],
        [2, 0, 1, 0, 2, 0],
        [1, 0, 0, 1, 3, 0],
    ];
    LEVEL1_black = [
        [0, 0, 2, 1, 0, 0],
        [0, 0, 3, 0, 0, 0],
        [1, 1, 1, 1, 0, 0],
        [2, 0, 2, 0, 0, 0],
        [0, 4, 0, 0, 0, 1],
        [1, 2, 1, 1, 0, 0],
        [2, 2, 0, 1, 0, 0],
        [0, 0, 1, 3, 1, 0],
    ];

    LEVEL2_WHITE = [
        [0, 0, 0, 5, 0, 2],
        [6, 0, 0, 0, 0, 3],
        [0, 0, 3, 2, 2, 1],
        [0, 0, 1, 4, 2, 2],
        [2, 3, 0, 3, 0, 1],
        [0, 0, 0, 5, 3, 2],
    ];
    LEVEL2_BLUE = [
        [0, 0, 5, 0, 0, 2],
        [0, 0, 6, 0, 0, 3],
        [2, 3, 0, 0, 2, 1],
        [3, 0, 2, 3, 0, 1],
        [4, 2, 0, 0, 1, 2],
        [0, 5, 3, 0, 0, 2],
    ];
    LEVEL2_GREEN = [
        [0, 0, 5, 0, 0, 2],
        [0, 0, 6, 0, 0, 3],
        [2, 3, 0, 0, 2, 1],
        [3, 0, 2, 3, 0, 1],
        [4, 2, 0, 0, 1, 2],
        [0, 5, 3, 0, 0, 2],
    ];
    LEVEL2_RED = [
        [0, 0, 0, 0, 5, 2],
        [0, 0, 0, 6, 0, 3],
        [2, 0, 0, 2, 3, 1],
        [1, 4, 2, 0, 0, 2],
        [0, 3, 0, 2, 3, 1],
        [3, 0, 0, 0, 5, 2],
    ];
    LEVEL2_black = [
        [0, 0, 0, 0, 5, 2],
        [0, 0, 0, 0, 6, 3],
        [3, 2, 2, 0, 0, 1],
        [0, 1, 4, 2, 0, 2],
        [3, 0, 3, 0, 2, 1],
        [0, 0, 5, 3, 0, 2],
    ];

    LEVEL3_WHITE = [
        [0, 0, 0, 0, 7, 4],
        [3, 0, 0, 0, 7, 5],
        [3, 0, 0, 3, 6, 4],
        [0, 3, 3, 5, 3, 3],
    ];
    LEVEL3_BLUE = [
        [7, 0, 0, 0, 0, 4],
        [7, 3, 0, 0, 0, 5],
        [6, 3, 0, 0, 3, 4],
        [3, 0, 3, 3, 5, 3],
    ];
    LEVEL3_GREEN = [
        [0, 7, 0, 0, 0, 4],
        [0, 7, 3, 0, 0, 5],
        [3, 6, 3, 0, 0, 4],
        [3, 5, 3, 0, 3, 3],
    ];
    LEVEL3_RED = [
        [0, 0, 7, 0, 0, 4],
        [0, 0, 7, 3, 0, 5],
        [0, 3, 6, 3, 0, 4],
        [3, 5, 3, 0, 3, 3],
    ];
    LEVEL3_black = [
        [0, 0, 0, 7, 0, 4],
        [0, 0, 0, 7, 3, 5],
        [0, 0, 3, 6, 3, 4],
        [3, 3, 5, 3, 0, 3],
    ];

    LEVEL1_CARDS = (() => {
        const cards = new Set<Card>();
        for (const [list, color] of ([
            [this.LEVEL1_WHITE, "white"],
            [this.LEVEL1_BLUE, "blue"],
            [this.LEVEL1_GREEN, "green"],
            [this.LEVEL1_RED, "red"],
            [this.LEVEL1_black, "black"],
        ] as [number[][], CardColor][])) {
            for (const card of list) {
                cards.add({
                    cost: {
                        white: card[0],
                        blue: card[1],
                        green: card[2],
                        red: card[3],
                        black: card[4],
                    },
                    prestige: card[5],
                    color,
                    level: 1,
                });
            }
        }
        return cards;
    })();

    LEVEL2_CARDS = (() => {
        const cards = new Set<Card>();
        for (const [list, color] of ([
            [this.LEVEL2_WHITE, "white"],
            [this.LEVEL2_BLUE, "blue"],
            [this.LEVEL2_GREEN, "green"],
            [this.LEVEL2_RED, "red"],
            [this.LEVEL2_black, "black"],
        ] as [number[][], CardColor][])) {
            for (const card of list) {
                cards.add({
                    cost: {
                        white: card[0],
                        blue: card[1],
                        green: card[2],
                        red: card[3],
                        black: card[4],
                    },
                    prestige: card[5],
                    color,
                    level: 2,
                });
            }
        }
        return cards;
    })();

    LEVEL3_CARDS = (() => {
        const cards = new Set<Card>();
        for (const [list, color] of ([
            [this.LEVEL3_WHITE, "white"],
            [this.LEVEL3_BLUE, "blue"],
            [this.LEVEL3_GREEN, "green"],
            [this.LEVEL3_RED, "red"],
            [this.LEVEL3_black, "black"],
        ] as [number[][], CardColor][])) {
            for (const card of list) {
                cards.add({
                    cost: {
                        white: card[0],
                        blue: card[1],
                        green: card[2],
                        red: card[3],
                        black: card[4],
                    },
                    prestige: card[5],
                    color,
                    level: 3,
                });
            }
        }
        return cards;
    })();

    NOBLE_INFOS = [
        [3, 3, 0, 0, 3, 2],
        [0, 3, 3, 3, 0, 1],
        [3, 0, 0, 3, 3, 7],
        [0, 0, 4, 4, 0, 10],
        [0, 4, 4, 0, 0, 5],
        [0, 0, 0, 4, 4, 9],
        [4, 0, 0, 0, 4, 3],
        [3, 3, 3, 0, 0, 6],
        [0, 0, 3, 3, 3, 8],
        [4, 4, 0, 0, 0, 4],
    ];

    NOBLES = (() => {
        const nobles = new Set<Noble>();
        const COLOR_ORDER: CardColor[] = ["white", "blue", "green", "red", "black"];
        for (const info of this.NOBLE_INFOS) {
            const cost = [];
            for (let i = 0; i < COLOR_ORDER.length; i++) {
                if (info[i] !== 0) {
                    cost.push({
                        color: COLOR_ORDER[i],
                        count: info[i]
                    });
                }
            }
            nobles.add({
                cost,
                prestige: 3,
                nobleIndex: info[5],
            });
        }
        return nobles;
    })();

    private onBoardChange: (board: any) => void;
    private onHandChange: (playerName: string, hand: any) => void;

    private playerNames: string[];
    private playerNamesStandby: string[];
    private board: Card[][];
    private coins: { white: number, black: number, red: number, blue: number, green: number, gold: number; };
    private currentPlayerIndex: number;
    private drawPiles: Card[][];
    private playerStates: PlayerState[];
    private nobles: Noble[];
    private status: string;
    private firstTurnIndex: number;
    private temp: string;
    private temp2: string;

    constructor() {
        this.onBoardChange = () => { };
        this.onHandChange = () => { };
        this.playerNames = [];
        this.playerNamesStandby = [];
        this.reset();
    }

    public reset() {
        this.playerNames = Array.from(this.playerNamesStandby);
        this.playerNamesStandby = [];
        this.playerStates = [];
        this.playerNames.forEach(_ => {
            this.playerStates.push({
                cards: {
                    green: 0,
                    blue: 0,
                    red: 0,
                    white: 0,
                    black: 0,
                },
                coins: {
                    green: 0, blue: 0, red: 0, white: 0, black: 0, gold: 0,
                },
                reservedCards: [],
                prestige: 0,
            });
        });


        this.board = [];
        for (let i = 0; i < 3; i++) {
            this.board.push(new Array(4).fill(null));
        }

        // reset draw piles
        this.drawPiles = [
            shuffleArrayRandom(Array.from(this.LEVEL3_CARDS)),
            shuffleArrayRandom(Array.from(this.LEVEL2_CARDS)),
            shuffleArrayRandom(Array.from(this.LEVEL1_CARDS)),
        ];

        this.coins = { white: 0, blue: 0, green: 0, red: 0, black: 0, gold: 0 };
        this.nobles = [null, null, null, null, null];

        this.currentPlayerIndex = -1;

        this.status = "reset";

        this.onBoardChange(this.getBoard());
        this.playerNames.forEach(playerName => this.onHandChange(playerName, this.getHand(playerName)));
    }

    public start() {
        if (this.playerNames.length < 2 || this.playerNames.length > 4) return;
        console.log("Starting game");

        this.playerNamesStandby = Array.from(this.playerNames);

        const gemCount = ((playerCount) => {
            switch (playerCount) {
                case 2:
                    return 4;
                case 3:
                    return 5;
                case 4:
                    return 7;
            }
        })(this.playerNames.length);

        this.coins = {
            white: gemCount,
            blue: gemCount,
            green: gemCount,
            red: gemCount,
            black: gemCount,
            gold: 5
        };

        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 4; j++) {
                this.drawFromDrawPile(i + 1);
            }
        }

        this.nobles = shuffleArrayRandom(Array.from(this.NOBLES)).slice(0, this.playerNames.length + 1);

        this.playerStates = [];
        this.playerNames.forEach((_, playerIndex) => {
            this.playerStates.push({
                cards: {
                    green: 0,
                    blue: 0,
                    red: 0,
                    white: 0,
                    black: 0,
                },
                coins: {
                    green: 0, blue: 0, red: 0, white: 0, black: 0, gold: 0,
                },
                reservedCards: [],
                prestige: 0,
            });
        });

        this.currentPlayerIndex = this.firstTurnIndex = Math.floor(Math.random() * this.playerNames.length);

        this.status = "start-turn";

        // this.onBoardChange(this.getBoard());
        // this.playerNames.forEach(playerName => this.onHandChange(playerName, this.getHand(playerName)));
    }

    public setOnContentChangeCallback(onContentChange: (playerName: string, content: any) => void) {
        this.setOnBoardChangeCallback((board: any) => onContentChange('board', board));
        this.setOnHandChangeCallback((playerName: string, hand: any) => onContentChange(playerName, hand));
    }

    public setOnBoardChangeCallback(onBoardChange: (board: any) => void) {
        this.onBoardChange = onBoardChange;
    }

    public setOnHandChangeCallback(onHandChange: (playerName: string, hand: any) => void) {
        this.onHandChange = onHandChange;
    }

    public addPlayer(playerName: string) {
        if (playerName === "board") return;

        if (this.status === "reset") {
            this.playerNames.push(playerName);
            this.playerStates.push({
                cards: {
                    green: 0,
                    blue: 0,
                    red: 0,
                    white: 0,
                    black: 0,
                },
                coins: {
                    green: 0, blue: 0, red: 0, white: 0, black: 0, gold: 0,
                },
                reservedCards: [],
                prestige: 0,
            });
        } else {
            this.playerNamesStandby.push(playerName);
        }

        this.onBoardChange(this.getBoard());
    }
    public removePlayer(playerName: string) {
        if (playerName === "board") return;

        if (this.status === "reset") {
            this.playerStates.splice(this.playerNames.indexOf(playerName), 1);
            this.playerNames.splice(this.playerNames.indexOf(playerName), 1);
        } else {
            this.playerNamesStandby.splice(this.playerNamesStandby.indexOf(playerName), 1);
        }

        this.onBoardChange(this.getBoard());
    }

    public getContent(playerName: string) {
        if (playerName === "board") return this.getBoard();
        else return this.getHand(playerName);
    }

    public getBoard() {
        const buttons: [string, string, boolean][] = [["Back", "back", true], ["Reset", "reset", this.status !== "reset"]];

        let displayText = "";
        let playerCoinsSelectable = false;
        let pilesSelectable = [false, false, false];
        let faceupCardsSelectable: boolean[][] = [];
        for (let i = 0; i < this.board.length; i++) {
            faceupCardsSelectable.push(new Array(this.board[i].length).fill(false))
        }
        let noblesSelectable: boolean[] = [];
        for (let i = 0; i < this.nobles.length; i++) {
            noblesSelectable.push(false);
        }

        switch (this.status) {
            case "reset":
                buttons.push(["Start Game", "start", this.playerNames.length >= 2 && this.playerNames.length <= 4]);
                break;
            case "start-turn":
                buttons.push(["Take Coins", "take-coins-button", this.getTotalNonGoldCoinsOnBoard() !== 0]);
                buttons.push(["Reserve Card", "reserve-card-button", this.playerStates[this.currentPlayerIndex].reservedCards.length < 3]);
                buttons.push(["Buy Card", "buy-card-button", true]);
                buttons.push(["Skip Turn", "skip-turn", true]);
                displayText = this.playerNames[this.currentPlayerIndex] + "'s Turn";
                break;
            case "start-coin-take":
                displayText = "Choose a coin to take";
                buttons.push(["Cancel", "cancel-to-start-turn", true]);
                break;
            case "coin1-taken":
                displayText = "Choose second coin to take";
                break;
            case "coin2-taken":
                displayText = "Choose third coin to take";
                break;
            case "discard-coins":
                displayText = "Return coins until you have 10 coins";
                playerCoinsSelectable = true;
                break;
            case "start-reserve-card":
                displayText = "Choose a card to reserve";
                buttons.push(["Cancel", "cancel-to-start-turn", true]);
                pilesSelectable = [true, true, true];
                faceupCardsSelectable = [];
                for (let i = 0; i < this.board.length; i++) {
                    faceupCardsSelectable.push(new Array(this.board[i].length).fill(true))
                }
                break;
            case "start-buy-card":
                displayText = "Choose a card to take";
                buttons.push(["Cancel", "cancel-to-start-turn", true]);
                const buyableCards = this.getBuyableCards();
                for (let i = 0; i < this.board.length; i++) {
                    for (let j = 0; j < this.board[i].length; j++) {
                        if (buyableCards.board[i][j])
                            faceupCardsSelectable[i][j] = true;
                    }
                }
                break;
            case "choose-noble":
                noblesSelectable = this.getEligibleNobles();
                displayText = "Choose a noble";
                break;
            case "game-over":
                displayText = "Game Over! Congratulations" + this.getWinners().map(index => " " + this.playerNames[index]).join(",") + "!";
                break;
        }

        if (this.playerStates.map(state => state.prestige >= 1).reduce((p, c) => p || c, false) && this.status === "start-turn") {
            displayText = "Last Round - " + displayText;
        }

        return {
            buttons,
            faceupCards: this.board.map((row, rowIndex) => {
                return row.map((card, colIndex) => {
                    if (card === null) return card;
                    return { ...card, isSelectable: faceupCardsSelectable[rowIndex][colIndex] };
                });
            }),
            coins: this.coins,
            coinsSelectable: this.getSelectableCoins(),
            pilesSelectable,
            pilesVisible: [this.drawPiles[2].length > 0, this.drawPiles[1].length > 0, this.drawPiles[0].length > 0],
            nobles: this.nobles.map((noble, index) => {
                if (noble === null) return noble;
                return { ...noble, isSelectable: noblesSelectable[index] };
            }),
            displayText,
            playerStates: this.playerNames.map((name, index) => {
                return {
                    name,
                    isTurn: this.currentPlayerIndex === index,
                    coins: this.playerStates[index]?.coins,
                    coinsSelectable: index === this.currentPlayerIndex ? playerCoinsSelectable : false,
                    prestige: this.playerStates[index].prestige,
                    reservedCards: this.playerStates[index].reservedCards.map(card => card.level),
                    cards: this.playerStates[index].cards,
                }
            })
        };
    }

    public getHand(playerName: string) {
        const playerIndex = this.getPlayerIndex(playerName);
        if (playerIndex === -1) return { hand: [], displayText: "Waiting for game to start" };

        let cardsSelectable = new Array<boolean>(this.playerStates[playerIndex].reservedCards.length).fill(false);

        let displayText = "";
        switch (this.status) {
            case "reset":
                displayText = "Waiting for game to start";
                break;
            case "start-turn":
                if (playerIndex === this.currentPlayerIndex) displayText = "It's your turn";
                break;
            case "start-buy-card":
                if (playerIndex !== this.currentPlayerIndex) break;
                const buyableCards = this.getBuyableCards();
                for (let i = 0; i < this.playerStates[playerIndex].reservedCards.length; i++) {
                    if (buyableCards.hand[i])
                        cardsSelectable[i] = true;
                }
                if (this.playerStates[playerIndex].reservedCards.length > 0)
                    displayText = "Choose a card to buy";
                break;
        }

        return {
            hand: this.playerStates[playerIndex].reservedCards.map((card, index) => {
                if (card === null) return card;
                return { ...card, isSelectable: cardsSelectable[index] };
            }),
            displayText,
        };
    }

    public takeAction(playerName: string, action: any) {
        console.log(playerName, action);
        switch (action.type) {
            case "reset":
                this.reset();
                return;
            case "start":
                if (this.status !== "reset" || this.playerNames.length < 2 || this.playerNames.length > 4) return;
                this.start();
                break;
            case "skip-turn":
                this.status = "end-turn";
                break;
            case "take-coins-button":
                this.status = "start-coin-take";
                break;
            case "select-coin":
                // can only select coin when in these states.
                if (this.status !== "start-coin-take" && this.status !== "coin1-taken" && this.status !== "coin2-taken") return;
                const { color } = action;
                // invalid color
                if (!hasKey(this.coins, color)) return;
                // can't draw from empty pile
                if (this.coins[color] == 0) return;
                // can't draw second coin from the same pile if less than 4.
                if ((this.temp === color || this.temp2 === color) && this.coins[color] < 3) return;

                this.playerStates[this.currentPlayerIndex].coins[color]++;
                this.coins[color]--;

                switch (this.status) {
                    case "start-coin-take":
                        this.status = "coin1-taken";
                        this.temp = color;
                        if (!this.areAnyCoinsSelectable()) {
                            if (this.getTotalCoins(this.currentPlayerIndex) > 10) {
                                this.status = "discard-coins";
                            } else {
                                this.temp = this.temp2 = "";
                                this.status = "end-turn";
                            }
                        }
                        break;
                    case "coin1-taken":
                        this.status = "coin2-taken";
                        this.temp2 = color;
                        if (!this.areAnyCoinsSelectable()) {
                            if (this.getTotalCoins(this.currentPlayerIndex) > 10) {
                                this.status = "discard-coins";
                            } else {
                                this.temp = this.temp2 = "";
                                this.status = "end-turn";
                            }
                        }
                        if (this.temp !== color) break;
                    case "coin2-taken":
                        if (this.getTotalCoins(this.currentPlayerIndex) > 10) {
                            this.status = "discard-coins";
                        } else {
                            this.temp = this.temp2 = "";
                            this.status = "end-turn";
                        }
                        break;
                }
                break;
            case "reserve-card-button":
                this.status = "start-reserve-card";
                break;
            case "cancel-to-start-turn":
                this.status = "start-turn";
                break;
            case "select-pile-card":
                const { level } = action;
                switch (this.status) {
                    case "start-reserve-card":
                        if (this.playerStates[this.currentPlayerIndex].reservedCards.length == 3) return;
                        if (this.drawPiles[3 - level].length === 0) return;
                        this.playerStates[this.currentPlayerIndex].reservedCards.push(this.drawDoNotPlaceFromDrawPile(level));
                        if (this.coins.gold > 0) {
                            this.coins.gold--;
                            this.playerStates[this.currentPlayerIndex].coins.gold++;
                            if (this.getTotalCoins(this.currentPlayerIndex) > 10) {
                                this.status = "discard-coins";
                            } else {
                                this.status = "end-turn";
                            }
                        } else {
                            this.status = "end-turn";
                        }
                        break;
                    default:
                        return;
                }
                break;
            case "select-board-card":
                const { rowIndex, colIndex } = action;
                switch (this.status) {
                    case "start-reserve-card":
                        if (this.playerStates[this.currentPlayerIndex].reservedCards.length == 3) return;
                        const card = this.board[rowIndex][colIndex];
                        this.board[rowIndex][colIndex] = null;
                        this.drawFromDrawPile(card.level);
                        this.playerStates[this.currentPlayerIndex].reservedCards.push(card);
                        if (this.coins.gold > 0) {
                            this.coins.gold--;
                            this.playerStates[this.currentPlayerIndex].coins.gold++;
                            if (this.getTotalCoins(this.currentPlayerIndex) > 10) {
                                this.status = "discard-coins";
                            } else {
                                this.status = "end-turn";
                            }
                        } else {
                            this.status = "end-turn";
                        }
                        break;
                    case "start-buy-card":
                        {
                            const buyableCards = this.getBuyableCards().board;
                            if (!buyableCards[rowIndex][colIndex]) return;
                            const card = this.board[rowIndex][colIndex];
                            this.board[rowIndex][colIndex] = null;
                            this.drawFromDrawPile(card.level);

                            const cost = card.cost;
                            ["blue", "red", "green", "white", "black"].forEach(color => {
                                if (!hasKey(cost, color) || cost[color] === 0) return;
                                cost[color] -= this.playerStates[this.currentPlayerIndex].cards[color];
                                cost[color] = Math.max(0, cost[color]);
                            });
                            ["blue", "red", "green", "white", "black"].forEach(color => {
                                if (!hasKey(cost, color) || cost[color] === 0) return;
                                const consumed = cost[color] <= this.playerStates[this.currentPlayerIndex].coins[color] ? cost[color] : this.playerStates[this.currentPlayerIndex].coins[color];
                                this.playerStates[this.currentPlayerIndex].coins[color] -= consumed;
                                cost[color] -= consumed;
                            });
                            ["blue", "red", "green", "white", "black"].forEach(color => {
                                if (!hasKey(cost, color) || cost[color] === 0) return;
                                this.playerStates[this.currentPlayerIndex].coins.gold -= cost[color];
                            });

                            this.playerStates[this.currentPlayerIndex].prestige += card.prestige;
                            this.playerStates[this.currentPlayerIndex].cards[card.color]++;

                            this.status = "check-prestige";
                        }
                        break;
                    default:
                        return;
                }
                break;
            case "select-hand-card":
                if (this.status !== "start-buy-card") return;
                const { index } = action;
                const buyableCards = this.getBuyableCards().hand;
                if (!buyableCards[index]) return;
                const card = this.playerStates[this.currentPlayerIndex].reservedCards[index];
                this.playerStates[this.currentPlayerIndex].reservedCards.splice(index, 1);

                const cost = card.cost;
                ["blue", "red", "green", "white", "black"].forEach(color => {
                    if (!hasKey(cost, color) || cost[color] === 0) return;
                    cost[color] -= this.playerStates[this.currentPlayerIndex].cards[color];
                    cost[color] = Math.max(0, cost[color]);
                });
                ["blue", "red", "green", "white", "black"].forEach(color => {
                    if (!hasKey(cost, color) || cost[color] === 0) return;
                    const consumed = cost[color] <= this.playerStates[this.currentPlayerIndex].coins[color] ? cost[color] : this.playerStates[this.currentPlayerIndex].coins[color];
                    this.playerStates[this.currentPlayerIndex].coins[color] -= consumed;
                    cost[color] -= consumed;
                });
                ["blue", "red", "green", "white", "black"].forEach(color => {
                    if (!hasKey(cost, color) || cost[color] === 0) return;
                    this.playerStates[this.currentPlayerIndex].coins.gold -= cost[color];
                });

                this.playerStates[this.currentPlayerIndex].prestige += card.prestige;
                this.playerStates[this.currentPlayerIndex].cards[card.color]++;

                this.status = "check-prestige";
                break;
            case "select-player-coin":
                {
                    const { color } = action;
                    if (hasKey(this.playerStates[this.currentPlayerIndex].coins, color) && this.playerStates[this.currentPlayerIndex].coins[color] > 0) {
                        this.playerStates[this.currentPlayerIndex].coins[color]--;
                        this.coins[color]++;
                    }
                    if (this.getTotalCoins(this.currentPlayerIndex) <= 10) {
                        this.status = "end-turn";
                    }
                }
                break;
            case "buy-card-button":
                this.status = "start-buy-card";
                break;
            case "select-noble-card":
                {
                    const { index } = action;
                    const eligible = this.getEligibleNobles();
                    if (!eligible[index]) return;
                    const noble = this.nobles[index];
                    this.nobles[index] = null;
                    this.playerStates[this.currentPlayerIndex].prestige += noble.prestige;
                    this.status = "end-turn";
                }
                break;
        }

        // if (action.type == "card") {
        //     const { rowIndex, colIndex } = action;
        // } else { // noble
        //     // const { nobleIndex } = action;
        //     // assert.notEqual(this.nobles[nobleIndex], null);

        //     // for (const cost of this.nobles[nobleIndex].cost) {
        //     //     // @ts-ignore
        //     //     if (this.playerHands[this.currentPlayerIndex].handCards[cost.color] < cost.count) {
        //     //         return;
        //     //     }
        //     // }
        //     // this.playerStates[this.currentPlayerIndex].nobles.push(this.nobles[nobleIndex]);
        //     // this.nobles[nobleIndex] = null;

        //     // this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.playerNames.length;
        // }


        if (this.status === "check-prestige") {
            if (this.areAnyEligibleNobles()) {
                this.status = "choose-noble";
            } else {
                this.status = "end-turn";
            }
        }

        if (this.status === "end-turn") {
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.playerNames.length;

            if (this.currentPlayerIndex === this.firstTurnIndex && this.getWinners() !== null) {
                this.status = "game-over";
                this.currentPlayerIndex = -1;
            }
            else {
                this.status = "start-turn";
            }
        }

        this.onBoardChange(this.getBoard());
        this.playerNames.forEach(playerName => this.onHandChange(playerName, this.getHand(playerName)));
    }

    private drawFromDrawPile(level: number) {
        if (this.drawPiles[3 - level].length === 0) {
            return;
        }
        for (let i = 0; i < 4; i++) {
            if (this.board[3 - level][i] === null) {
                this.board[3 - level][i] = this.drawPiles[3 - level].pop();
                return;
            }
        }
        console.log(this.board);
        assert.fail();
    }

    private drawDoNotPlaceFromDrawPile(level: number) {
        if (this.drawPiles[3 - level].length === 0) {
            return;
        }
        return this.drawPiles[3 - level].pop();
    }

    private getPlayerIndex(playerName: string) {
        return this.playerNames.indexOf(playerName);
    }

    private getTotalCoins(playerIndex: number) {
        return Object.values(this.playerStates[playerIndex].coins).reduce((previousValue, currentValue) => previousValue + currentValue, 0);
    }

    private getTotalNonGoldCoinsOnBoard() {
        return ["white", "black", "red", "blue", "green"].reduce((prev, color) => prev + (hasKey(this.coins, color) && this.coins[color]), 0);
    }

    private getSelectableCoins() {
        const coinsSelectable = {
            blue: false, red: false, green: false, white: false, black: false, gold: false
        };
        switch (this.status) {
            case "start-coin-take":
                ["blue", "red", "green", "white", "black"].forEach(color => {
                    if (hasKey(coinsSelectable, color) && this.coins[color] > 0) {
                        coinsSelectable[color] = true;
                    }
                });
                break;
            case "coin1-taken":
                ["blue", "red", "green", "white", "black"].forEach(color => {
                    if (hasKey(coinsSelectable, color) && this.coins[color] > 0 && !(this.coins[color] < 3 && this.temp === color)) {
                        coinsSelectable[color] = true;
                    }
                });
                break;
            case "coin2-taken":
                ["blue", "red", "green", "white", "black"].forEach(color => {
                    if (hasKey(coinsSelectable, color) && this.coins[color] > 0 && this.temp !== color && this.temp2 !== color) {
                        coinsSelectable[color] = true;
                    }
                });
                break;
        }
        return coinsSelectable;
    }

    private areAnyCoinsSelectable() {
        return Object.values(this.getSelectableCoins()).reduce((prev, cur) => prev || cur, false);
    }

    private isCardBuyable(card: Card) {
        if (card === null) return false;
        const leftOver = Object.keys(card.cost)
            .map(color =>
                Math.max(0,
                    (hasKey(card.cost, color) && card.cost[color]) -
                    (hasKey(this.playerStates[this.currentPlayerIndex].cards, color) && this.playerStates[this.currentPlayerIndex].cards[color]) -
                    (hasKey(this.playerStates[this.currentPlayerIndex].coins, color) && this.playerStates[this.currentPlayerIndex].coins[color])))
            .reduce((p, c) => p + c, 0);
        return leftOver <= this.playerStates[this.currentPlayerIndex].coins.gold;
    }

    private getBuyableCards() {
        return {
            board: this.board.map((row, rowIndex) => {
                return row.map((card, colIndex) => {
                    return this.isCardBuyable(card);
                })
            }),
            hand: this.playerStates[this.currentPlayerIndex].reservedCards.map(card => this.isCardBuyable(card)),
        }
    }

    private getBuyableCardsCount() {
        const buyableCards = this.getBuyableCards();
        return buyableCards.hand.reduce((p, c) => p + (c === true ? 1 : 0), 0) +
            buyableCards.board.reduce((p, c) => p + c.reduce((p2, c2) => p2 + (c2 === true ? 1 : 0), 0), 0);
    }

    private getEligibleNobles() {
        return this.nobles.map(noble => {
            if (noble === null) return false;
            return noble.cost.map(({ color, count }) => {
                return this.playerStates[this.currentPlayerIndex].cards[color] >= count;
            }).reduce((p, c) => p && c, true);
        })
    }

    private areAnyEligibleNobles() {
        return this.getEligibleNobles().reduce((p, c) => p || c, false);
    }

    private getWinners() {
        const prestiges = this.playerStates.map((state, index) => [state.prestige, Object.values(state.cards).reduce((p, c) => p + c, 0), index]).sort((a, b) => (a[0] - b[0]) * 100 + b[1] - b[0]).reverse();
        if (prestiges[0][0] >= 1) {
            const winners: number[] = [];
            prestiges.forEach(([prestige, dev, index]) => {
                if (prestige === prestiges[0][0] && dev === prestiges[0][1]) {
                    winners.push(index);
                }
            })
            return winners;
        }
        return null;
    }
}
