import { Game } from './interface';
import * as assert from 'assert';
import { rotateArrayRandom, shuffleArrayRandom } from '../util';

type Card = string;
type BoardPlayerState = {
    sealsOfExcellence: number,
    camels: number,
    goodsTokens: {
        diamond: number[],
        gold: number[],
        silver: number[],
        cloth: number[],
        spice: number[],
        leather: number[],
    },
    bonusTokens: {
        bonus_3: number[],
        bonus_4: number[],
        bonus_5: number[],
    },
    hasCamelToken: boolean,
};
type PlayerState = {
    hand: Card[],
    handIsSelected: boolean[],
} & BoardPlayerState;
type BoardState = {
    playerStates: [BoardPlayerState, BoardPlayerState],
    market: [Card, Card, Card, Card, Card],
    topDiscard: Card,
    drawPileHasCards: boolean,
    goodsTokens: {
        diamond: number[],
        gold: number[],
        silver: number[],
        cloth: number[],
        spice: number[],
        leather: number[],
    },
    bonusTokens: {
        bonus_3: number[],
        bonus_4: number[],
        bonus_5: number[],
        camel: boolean,
    },
    currentPlayerIndex: number,
    // status: "no-started" | "turn-start" | "",
};
type HandState = {
    hand: Card[],
    handIsSelected: boolean[],
    displayText: string,
};

export default class Codenames implements Game {
    private static readonly GOODS_TOKENS_ALL = {
        diamond: [5, 5, 5, 7, 7],
        gold: [5, 5, 5, 6, 6],
        silver: [5, 5, 5, 5, 5],
        cloth: [1, 1, 2, 2, 3, 3, 5],
        spice: [1, 1, 2, 2, 3, 3, 5],
        leather: [1, 1, 1, 1, 1, 1, 2, 3, 4],
    };

    private static readonly BONUS_TOKENS_ALL = {
        bonus_3: [1, 2, 3, 1, 2, 3],
        bonus_4: [4, 5, 6, 4, 5, 6],
        bonus_5: [8, 9, 10, 8, 9, 10],
    };

    private static readonly CARDS_ALL = {
        diamond: 6,
        gold: 6,
        silver: 6,
        cloth: 8,
        spice: 8,
        leather: 10,
        camel: 11 - 3,
    };

    private playerStates: [PlayerState, PlayerState];
    private market: [Card, Card, Card, Card, Card];
    private marketIsSelected: [boolean, boolean, boolean, boolean, boolean];
    private drawPile: Card[];
    private drawPileOverdrawn: boolean;
    private goodsTokens: {
        diamond: number[],
        gold: number[],
        silver: number[],
        cloth: number[],
        spice: number[],
        leather: number[],
    };
    private bonusTokens: {
        bonus_3: number[],
        bonus_4: number[],
        bonus_5: number[],
    };
    private camelToken: boolean;
    private currentPlayerIndex: number;
    private playerNames: string[];
    private topDiscard: Card;
    private status: "reset" | "start-turn" | "take-single-good" | "exchange-goods" | "sell-cards" | "end-round" | "end-game";
    private lastGameLoser: number;

    private onBoardChange: (board: any) => void;
    private onHandChange: (playerName: string, hand: any) => void;

    constructor() {
        // this.onBoardChange = () => { };
        // this.onHandChange = () => { };
        // this.playerNames = [];
        // this.reset();
    }

    public reset() {
        // this.market = [null, null, null, null, null];
        // this.marketIsSelected = [false, false, false, false, false];

        // this.drawPile = [];
        // this.drawPileOverdrawn = false;
        // this.camelToken = false;

        // this.goodsTokens = {
        //     diamond: [],
        //     gold: [],
        //     silver: [],
        //     cloth: [],
        //     spice: [],
        //     leather: [],
        // };

        // this.bonusTokens = {
        //     bonus_3: [],
        //     bonus_4: [],
        //     bonus_5: [],
        // };

        // this.lastGameLoser = -1;

        // this.playerStates = [null, null];
        // [0, 1].forEach(i => {
        //     this.playerStates[i] = {
        //         sealsOfExcellence: 0,
        //         camels: 0,
        //         goodsTokens: {
        //             diamond: [],
        //             gold: [],
        //             silver: [],
        //             cloth: [],
        //             spice: [],
        //             leather: [],
        //         },
        //         bonusTokens: {
        //             bonus_3: [],
        //             bonus_4: [],
        //             bonus_5: [],
        //         },
        //         hand: [],
        //         handIsSelected: [],
        //         hasCamelToken: false,
        //     };
        // });

        // this.topDiscard = null;
        // this.currentPlayerIndex = -1;

        // this.status = "reset";

        // this.onBoardChange(this.getBoard());
        // this.playerNames.forEach(playerName => this.onHandChange(playerName, this.getHand(playerName)));
    }

    public start(playerNames: string[]) {
        // if (playerNames.length !== 2) return;
        // console.log("Starting game");
        // this.playerNames = playerNames;

        // this.newRound();
    }

    public setOnBoardChangeCallback(onBoardChange: (board: any) => void) {
        this.onBoardChange = onBoardChange;
    }

    public addPlayer(playerName: string) { }
    public removePlayer(playerName: string) { }

    public setOnContentChangeCallback(onContentChange: (playerName: string, content: any) => void) {
        // this.onHandChange = onHandChange;
    }

    public setOnHandChangeCallback(onHandChange: (playerName: string, hand: any) => void) {
        this.onHandChange = onHandChange;
    }

    public getBoard(): any {
        // const buttons: [string, string, boolean][] = [];
        // const marketIsSelectable = [false, false, false, false, false];

        // let disabled = true;
        // switch (this.status) {
        //     case 'reset':
        //         buttons.push(["start", "Start Game", false]);
        //         break;
        //     case "start-turn":
        //         buttons.push(["exchange-goods", "Exchange Goods", false]);

        //         disabled = true;
        //         if (this.playerStates[this.currentPlayerIndex].hand.length < 7 && !this.market.every(card => card === "camel")) {
        //             disabled = false;
        //         }
        //         buttons.push(["take-single-good", "Take Single Good", disabled]);

        //         disabled = true;
        //         if (!this.market.every(card => card !== "camel")) {
        //             disabled = false;
        //         }
        //         buttons.push(["take-all-camels", "Take All Camels", disabled]);

        //         const showSellCards = () => {
        //             const handCounts = { diamond: 0, silver: 0, gold: 0, cloth: 0, spice: 0, leather: 0 };
        //             // @ts-ignore
        //             this.playerStates[this.currentPlayerIndex].hand.forEach(card => handCounts[card] += 1);
        //             return handCounts.diamond > 1 || handCounts.silver > 1 || handCounts.gold > 1 || handCounts.cloth > 0 || handCounts.spice > 0 || handCounts.leather > 0;
        //         };
        //         disabled = true;
        //         if (showSellCards()) {
        //             disabled = false;
        //         }
        //         buttons.push(["sell-cards", "Sell Cards", disabled]);
        //         break;
        //     case "take-single-good":
        //         marketIsSelectable.forEach((_, i) => {
        //             if (this.market[i] !== "camel") { marketIsSelectable[i] = true; }
        //         });
        //         buttons.push(["cancel-take-single-good", "Cancel", false]);
        //         break;
        //     case "exchange-goods":
        //         marketIsSelectable.forEach((_, i) => {
        //             if (this.market[i] !== "camel") { marketIsSelectable[i] = true; }
        //         });

        //         disabled = true;
        //         const playerSelectedCards = this.playerStates[this.currentPlayerIndex].hand.filter((card, i) => this.playerStates[this.currentPlayerIndex].handIsSelected[i]);
        //         if (this.marketIsSelected.filter(value => value).length > 1 &&
        //             this.marketIsSelected.filter(value => value).length <= (this.playerStates[this.currentPlayerIndex].camels + this.playerStates[this.currentPlayerIndex].handIsSelected.filter(value => value).length) &&
        //             this.market.every((card, i) => !this.marketIsSelected[i] || playerSelectedCards.find(needle => needle == card) === undefined) &&
        //             this.playerStates[this.currentPlayerIndex].hand.length + this.marketIsSelected.filter(value => value).length - playerSelectedCards.length <= 7) {
        //             disabled = false;
        //         }
        //         buttons.push(["do-exchange-goods", "Exchange", disabled]);

        //         buttons.push(["cancel-exchange-goods", "Cancel", false]);
        //         break;
        //     case "sell-cards":
        //         const canSellCards = () => {
        //             let type = null;
        //             let count = 0;
        //             for (let i = 0; i < this.playerStates[this.currentPlayerIndex].hand.length; i++) {
        //                 if (!this.playerStates[this.currentPlayerIndex].handIsSelected[i]) {
        //                     continue;
        //                 }
        //                 if (type === null) {
        //                     type = this.playerStates[this.currentPlayerIndex].hand[i];
        //                 } else if (type !== this.playerStates[this.currentPlayerIndex].hand[i]) {
        //                     return false;
        //                 }
        //                 count++;
        //             }

        //             if (type === null) return false;
        //             if ((type === "diamond" || type === "silver" || type === "gold") && count < 2) return false;
        //             return true;
        //         };

        //         disabled = true;
        //         if (canSellCards()) {
        //             disabled = false;
        //         }
        //         buttons.push(["do-sell-cards", "Sell", disabled]);

        //         buttons.push(["cancel-sell-cards", "Cancel", false]);
        //         break;
        //     case "end-round":
        //         buttons.push(["next-round", "Next Round", false]);
        //         break;
        //     case "end-game":
        //         buttons.push(["reset", "Reset (Congratulations " + this.playerNames[this.currentPlayerIndex] + "!)", false]);;
        //         break;
        // }

        // const rupees = [0, 1].map(i => this.getScore(i));

        // return {
        //     playerStates: [0, 1].map(i => {
        //         return {
        //             sealsOfExcellence: this.playerStates[i].sealsOfExcellence,
        //             camels: this.playerStates[i].camels,
        //             goodsTokens: this.playerStates[i].goodsTokens,
        //             rupees: rupees[i],
        //             hasCamelToken: this.playerStates[i].hasCamelToken,
        //             bonusTokens: this.playerStates[i].bonusTokens,
        //         };
        //     }),
        //     market: this.market,
        //     marketIsSelected: this.marketIsSelected,
        //     marketIsSelectable,
        //     topDiscard: this.topDiscard,
        //     drawPileHasCards: this.drawPile.length > 0,
        //     goodsTokens: this.goodsTokens,
        //     bonusTokens: {
        //         bonus_3: this.bonusTokens.bonus_3.length,
        //         bonus_4: this.bonusTokens.bonus_4.length,
        //         bonus_5: this.bonusTokens.bonus_5.length,
        //     },
        //     camelToken: this.camelToken,
        //     currentPlayerIndex: this.currentPlayerIndex,
        //     buttons,
        // };
    }
    public getContent(playerName: string) {
    }

    public getHand(playerName: string) {
        // const playerIndex = this.getPlayerIndex(playerName);
        // if (playerIndex === -1) {
        //     return {
        //         hand: [],
        //         handIsSelected: [],
        //         displayText: "Waiting for a new game",
        //     };
        // }

        // const displayText = (() => {
        //     if (this.currentPlayerIndex !== playerIndex) return "";
        //     switch (this.status) {
        //         case "reset":
        //             return "Waiting for game to start";
        //         case "start-turn":
        //             return "It's your turn!";
        //         case "take-single-good":
        //             return "Pick a card from the board";
        //         case "sell-cards":
        //             return "Choose goods to sell";
        //         case "exchange-goods":
        //             return "Choose goods to exchange";
        //         case "end-round":
        //             if (this.lastGameLoser !== playerIndex) {
        //                 return "You gained a token of excellence";
        //             } else {
        //                 return "Your opponent gained a token of excellence";
        //             }
        //         case "end-game":
        //             if (this.lastGameLoser !== playerIndex) {
        //                 return "You Won!";
        //             } else {
        //                 return "You Lost!";
        //             }
        //     }
        //     return "";
        // })();

        // return {
        //     hand: this.playerStates[playerIndex].hand,
        //     handIsSelected: this.playerStates[playerIndex].handIsSelected,
        //     displayText,
        // };
    }

    public takeAction(playerName: string, action: any) {
        // console.log("action " + playerName + " " + action.type);
        // if (playerName === "board") {
        //     switch (action.type) {
        //         case "take-all-camels":
        //             this.market.forEach((card, i) => {
        //                 if (card !== "camel") {
        //                     return;
        //                 }
        //                 this.market[i] = this.drawFromDrawPile();
        //                 this.playerStates[this.currentPlayerIndex].camels += 1;
        //             });
        //             this.endPlayerTurn();
        //             break;
        //         case "take-single-good":
        //             this.status = "take-single-good";
        //             break;
        //         case "cancel-take-single-good":
        //             this.status = "start-turn";
        //             break;
        //         case "exchange-goods":
        //             this.status = "exchange-goods";
        //             break;
        //         case "cancel-exchange-goods":
        //             this.marketIsSelected.forEach((_, i) => this.marketIsSelected[i] = false);
        //             this.playerStates[this.currentPlayerIndex].handIsSelected.forEach((_, i) => this.playerStates[this.currentPlayerIndex].handIsSelected[i] = false);
        //             this.status = "start-turn";
        //             break;
        //         case "do-exchange-goods":
        //             const marketCards: [string, number][] = this.market.map((value, i) => [value, i] as [string, number]).filter((_, i) => this.marketIsSelected[i]);
        //             const playerCards: [string, number][] = this.playerStates[this.currentPlayerIndex].hand.map((value, i) => [value, i] as [string, number]).filter((_, i) => this.playerStates[this.currentPlayerIndex].handIsSelected[i]);

        //             for (let i = 0; i < playerCards.length; i++) {
        //                 this.playerStates[this.currentPlayerIndex].hand[playerCards[i][1]] = marketCards[i][0];
        //                 this.market[marketCards[i][1]] = playerCards[i][0];
        //             }
        //             this.playerStates[this.currentPlayerIndex].camels -= marketCards.length - playerCards.length;
        //             for (let i = playerCards.length; i < marketCards.length; i++) {
        //                 this.playerStates[this.currentPlayerIndex].hand.push(marketCards[i][0]);
        //                 this.market[marketCards[i][1]] = "camel";
        //             }

        //             this.marketIsSelected.forEach((_, i) => this.marketIsSelected[i] = false);
        //             this.playerStates[this.currentPlayerIndex].handIsSelected.forEach((_, i) => this.playerStates[this.currentPlayerIndex].handIsSelected[i] = false);
        //             this.status = "start-turn";
        //             this.endPlayerTurn();
        //             break;
        //         case "sell-cards":
        //             this.status = "sell-cards";
        //             break;
        //         case "cancel-sell-cards":
        //             this.playerStates[this.currentPlayerIndex].handIsSelected.forEach((_, i) => this.playerStates[this.currentPlayerIndex].handIsSelected[i] = false);
        //             this.status = "start-turn";
        //             break;
        //         case "do-sell-cards":
        //             const indices = this.playerStates[this.currentPlayerIndex].handIsSelected.map((value, i) => [value, i] as [boolean, number]).filter(([value, _]) => value).reverse().map(([value, i]) => i);
        //             const type = this.playerStates[this.currentPlayerIndex].hand[indices[0]];
        //             const count = indices.length;
        //             indices.map(i => this.playerStates[this.currentPlayerIndex].hand.splice(i, 1));

        //             // @ts-ignore
        //             const boardGoodsTokens: number[] = this.goodsTokens[type];
        //             // @ts-ignore
        //             const handGoodsTokens: number[] = this.playerStates[this.currentPlayerIndex].goodsTokens[type];

        //             for (let i = 0; i < count && boardGoodsTokens.length > 0; i++) {
        //                 handGoodsTokens.push(boardGoodsTokens.pop());
        //             }

        //             if (count == 3) {
        //                 if (this.bonusTokens.bonus_3.length > 0) this.playerStates[this.currentPlayerIndex].bonusTokens.bonus_3.push(this.bonusTokens.bonus_3.pop());
        //             } else if (count == 4) {
        //                 if (this.bonusTokens.bonus_4.length > 0) this.playerStates[this.currentPlayerIndex].bonusTokens.bonus_4.push(this.bonusTokens.bonus_4.pop());
        //             } else if (count >= 5) {
        //                 if (this.bonusTokens.bonus_5.length > 0) this.playerStates[this.currentPlayerIndex].bonusTokens.bonus_5.push(this.bonusTokens.bonus_5.pop());
        //             }
        //             this.topDiscard = type;
        //             this.playerStates[this.currentPlayerIndex].handIsSelected.forEach((_, i) => this.playerStates[this.currentPlayerIndex].handIsSelected[i] = false);
        //             this.endPlayerTurn();
        //             break;
        //         case "select-card":
        //             if (this.status == "take-single-good") {
        //                 this.playerStates[this.currentPlayerIndex].hand.push(this.market[action.index]);
        //                 this.market[action.index] = this.drawFromDrawPile();
        //                 this.endPlayerTurn();
        //             } else if (this.status == "exchange-goods") {
        //                 this.marketIsSelected[action.index] = !this.marketIsSelected[action.index];
        //             }
        //             break;
        //         case "next-round":
        //             this.newRound();
        //             break;
        //         case "reset":
        //             this.reset();
        //             this.status = "reset";

        //             this.onBoardChange(this.getBoard());
        //             this.playerNames.forEach(playerName => this.onHandChange(playerName, this.getHand(playerName)));
        //             return;
        //     }

        //     if (this.status !== "end-round" && Object.entries(this.goodsTokens).filter(([_, tokens]) => tokens.length === 0).length >= 3 ||
        //         this.drawPileOverdrawn) {
        //         this.status = "end-round";
        //         if (this.playerStates[0].camels > this.playerStates[1].camels) {
        //             this.playerStates[0].hasCamelToken = true;
        //             this.camelToken = false;
        //         } else if (this.playerStates[1].camels > this.playerStates[0].camels) {
        //             this.playerStates[1].hasCamelToken = true;
        //             this.camelToken = false;
        //         }

        //         if (this.getScore(0) > this.getScore(1)) {
        //             this.playerStates[0].sealsOfExcellence += 1;
        //             this.lastGameLoser = 1;
        //         } else if (this.getScore(1) > this.getScore(0)) {
        //             this.playerStates[1].sealsOfExcellence += 1;
        //             this.lastGameLoser = 0;
        //         } else {
        //             const playerBonuses = [0, 1].map(i => this.playerStates[i].bonusTokens.bonus_3.length + this.playerStates[i].bonusTokens.bonus_4.length + this.playerStates[i].bonusTokens.bonus_5.length);
        //             if (playerBonuses[0] > playerBonuses[1]) {
        //                 this.playerStates[0].sealsOfExcellence += 1;
        //                 this.lastGameLoser = 1;
        //             } else if (playerBonuses[1] > playerBonuses[0]) {
        //                 this.playerStates[1].sealsOfExcellence += 1;
        //                 this.lastGameLoser = 0;
        //             } else {
        //                 const playerGoods = [0, 1].map(i => Object.values(this.playerStates[i].goodsTokens).map(values => values.length).reduce((a, b) => a + b, 0));
        //                 if (playerGoods[0] > playerGoods[1]) {
        //                     this.playerStates[0].sealsOfExcellence += 1;
        //                     this.lastGameLoser = 1;
        //                 } else if (playerGoods[1] > playerGoods[0]) {
        //                     this.playerStates[1].sealsOfExcellence += 1;
        //                     this.lastGameLoser = 0;
        //                 }
        //             }
        //         }

        //         if (this.playerStates[0].sealsOfExcellence >= 2 || this.playerStates[1].sealsOfExcellence >= 2) {
        //             this.currentPlayerIndex = this.playerStates[0].sealsOfExcellence >= 2 ? 0 : 1;
        //             this.status = "end-game";
        //         }
        //     }
        // } else if (this.getPlayerIndex(playerName) === this.currentPlayerIndex) {
        //     if (action.type === "select-hand-card") {
        //         if (this.status === "exchange-goods" || this.status === "sell-cards") {
        //             this.playerStates[this.currentPlayerIndex].handIsSelected[action.index] = !this.playerStates[this.currentPlayerIndex].handIsSelected[action.index];
        //         }
        //     }
        // }

        // this.onBoardChange(this.getBoard());
        // this.playerNames.forEach(playerName => this.onHandChange(playerName, this.getHand(playerName)));
    }

    private getScore(i: number) {
        // const goodsCount = Object.values(this.playerStates[i].goodsTokens).map(values => values.reduce((a, b) => a + b, 0)).reduce((a, b) => a + b, 0);
        // const bonusCount = Object.values(this.playerStates[i].bonusTokens).map(values => values.reduce((a, b) => a + b, 0)).reduce((a, b) => a + b, 0);
        // return goodsCount + bonusCount + (this.playerStates[i].hasCamelToken ? 5 : 0);
    }

    private getPlayerIndex(playerName: string) {
        // return this.playerNames.indexOf(playerName);
    }
}