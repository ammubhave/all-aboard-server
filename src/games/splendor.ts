import { Game } from './interface';
import * as assert from 'assert';
import { rotateArrayRandom, shuffleArrayRandom } from '../util';
import { listenerCount } from 'cluster';

type Card = {
    color: string,
    prestige: number,
    cost: { white: number, black: number, red: number, blue: number, green: number; };
};

type Noble = {
    cost: { color: string, count: number; }[],
    prestige: number,
};

type BoardState = {
    faceupCards: Card[][],
    coins: { white: number, black: number, red: number, blue: number, green: number, gold: number; },
    nobles: Noble[],
    currentPlayerIndex: number,
};

type HandCardInfo = {
    count: number,
    prestige: number,
};

type HandCards = {
    green: HandCardInfo,
    blue: HandCardInfo,
    red: HandCardInfo,
    white: HandCardInfo,
    black: HandCardInfo,
};

type HandCoins = {
    green: number,
    blue: number,
    red: number,
    white: number,
    black: number,
    gold: number,
};

type PlayerHand = {
    handCards: HandCards,
    handCoins: HandCoins,
    reservedCards: Card[],
    nobles: Noble[],
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
        ] as [number[][], string][])) {
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
        ] as [number[][], string][])) {
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
        ] as [number[][], string][])) {
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
                });
            }
        }
        return cards;
    })();

    NOBLE_INFOS = [
        [3, 3, 0, 0, 3],
        [0, 3, 3, 3, 0],
        [3, 0, 0, 3, 3],
        [0, 0, 4, 4, 0],
        [0, 4, 4, 0, 0],
        [0, 0, 0, 4, 4],
        [4, 0, 0, 0, 4],
        [3, 3, 3, 0, 0],
        [0, 0, 3, 3, 3],
        [4, 4, 0, 0, 0],
    ];
    NOBLES = (() => {
        const nobles = new Set<Noble>();
        const COLOR_ORDER = ["white", "blue", "green", "red", "black"];
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
            });
        }
        return nobles;
    })();

    private onBoardChange: (board: any) => void;
    private onHandChange: (playerName: string, hand: any) => void;

    private playerNames: string[];
    private board: Card[][];
    private coins: { white: number, black: number, red: number, blue: number, green: number, gold: number; };
    private currentPlayerIndex: number;
    private drawPiles: Card[][];
    private playerHands: PlayerHand[];
    private nobles: Noble[];

    constructor() {
        this.onBoardChange = () => { };
        this.onHandChange = () => { };
        this.reset();
    }

    public reset() {
        this.playerNames = [];
        this.board = [];
        for (let i = 0; i < 3; i++) {
            this.board.push(new Array(4).fill(null));
        }
        this.resetDrawPiles();
        this.coins = { white: 0, blue: 0, green: 0, red: 0, black: 0, gold: 0 };
        this.nobles = [null, null, null, null, null];

        this.currentPlayerIndex = -1;
        this.playerHands = [];
        this.onBoardChange(this.getBoard());
        this.playerNames.forEach(playerName => this.onHandChange(playerName, this.getHand(playerName)));
    }

    public start(playerNames: string[]) {
        assert.notEqual(playerNames.length, 0, "No player connected");

        const gemCount = ((playerCount) => {
            switch (playerCount) {
                case 2:
                    return 4;
                case 3:
                    return 5;
                case 4:
                    return 7;
            }
            assert.fail();
        })(playerNames.length);

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

        this.nobles = shuffleArrayRandom(Array.from(this.NOBLES)).slice(0, playerNames.length + 1);
        for (let i = playerNames.length + 1; i < 5; i++) {
            this.nobles.push(null);
        }

        playerNames.forEach((_, playerIndex) => {
            this.playerHands.push({
                handCards: {
                    green: {
                        prestige: 0,
                        count: 0,
                    },
                    blue: {
                        prestige: 0,
                        count: 0,
                    },
                    red: {
                        prestige: 0,
                        count: 0,
                    },
                    white: {
                        prestige: 0,
                        count: 0,
                    },
                    black: {
                        prestige: 0,
                        count: 0,
                    },
                },
                handCoins: {
                    green: 0, blue: 0, red: 0, white: 0, black: 0, gold: 0,
                },
                reservedCards: [],
                nobles: []
            });
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

    public addPlayer(playerName: string) { }
    public removePlayer(playerName: string) { }

    public getBoard(): BoardState {
        return {
            faceupCards: this.board,
            coins: this.coins,
            nobles: this.nobles,
            currentPlayerIndex: this.currentPlayerIndex,
        };
    }

    public getHand(playerName: string) {
        const playerIndex = this.getPlayerIndex(playerName);
        return {
            handCards: this.playerHands[playerIndex].handCards,
            handCoins: this.playerHands[playerIndex].handCoins,
            reservedCards: this.playerHands[playerIndex].reservedCards,
            currentPlayerIndex: this.currentPlayerIndex,
            nobles: this.playerHands[playerIndex].nobles,
        };
    }

    public takeAction(playerName: string, action: any) {
        if (playerName === "board") {
            if (action.type === "coin") {
                const { color } = action;
            } else if (action.type == "card") {
                const { rowIndex, colIndex } = action;
            } else { // noble
                const { nobleIndex } = action;
                assert.notEqual(this.nobles[nobleIndex], null);

                for (const cost of this.nobles[nobleIndex].cost) {
                    // @ts-ignore
                    if (this.playerHands[this.currentPlayerIndex].handCards[cost.color] < cost.count) {
                        return;
                    }
                }
                this.playerHands[this.currentPlayerIndex].nobles.push(this.nobles[nobleIndex]);
                this.nobles[nobleIndex] = null;

                this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.playerNames.length;
            }
        } else {

        }
        // assert.notEqual(this.currentPlayerIndex, -1, "Game has not started");
        // // assert.equal(this.getWinner(), undefined, "Game has already ended");
        // assert.equal(this.board[y][x], "", "This space is already occupied");

        // const playerSymbol = this.getPlayerIndex(playerName) === 0 ? "X" : "O";
        // this.board[y][x] = playerSymbol;
        // this.onBoardChange(this.getBoard());
    }

    private resetDrawPiles() {
        this.drawPiles = [
            shuffleArrayRandom(Array.from(this.LEVEL3_CARDS)),
            shuffleArrayRandom(Array.from(this.LEVEL2_CARDS)),
            shuffleArrayRandom(Array.from(this.LEVEL1_CARDS)),
        ];
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

    private getPlayerIndex(playerName: string) {
        return this.playerNames.indexOf(playerName);
    }
}