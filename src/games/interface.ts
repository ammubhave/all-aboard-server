export interface Game {
    start(playerNames: string[]): void;
    takeAction(playerName: string, action: any): void;
    addPlayer(playerName: string): void;
    removePlayer(playerName: string): void;

    getBoard(): any;
    setOnBoardChangeCallback(onBoardChange: (board: any) => void): void;

    getHand(playerName: string): any;
    setOnHandChangeCallback(onHandChange: (playerName: string, hand: any) => void): void;
}