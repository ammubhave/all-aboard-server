export interface Game {
    takeAction(playerName: string, action: any): void;
    addPlayer(playerName: string): void;
    removePlayer(playerName: string): void;

    getContent(playerName: string): any;
    setOnContentChangeCallback(onContentChange: (playerName: string, content: any) => void): void;
}