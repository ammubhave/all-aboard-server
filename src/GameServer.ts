import express from "express";
import { Game } from "./games/interface";
import * as http from "http";
import * as SocketIO from "socket.io";
import Jaipur from "./games/jaipur";

class GameInfo {
    connectedBoards: Set<SocketIO.Socket>;
    connectedPlayers: Map<string, Set<SocketIO.Socket>>;
    game: Game;
    gameName: string;

    constructor(
        gameName: string,
        onBoardChange: (board: any) => void,
        onHandChange: (playerName: string, hand: any) => void
    ) {
        this.connectedBoards = new Set();
        this.connectedPlayers = new Map();
        this.gameName = gameName;

        switch (gameName) {
            case 'jaipur':
                this.game = new Jaipur();
        }

        this.game.setOnBoardChangeCallback(onBoardChange);
        this.game.setOnHandChangeCallback(onHandChange);
    }
}

export default class GameServer {
    public static readonly DEFAULT_PORT: number = 3000;
    private app: express.Application;
    private server: http.Server;
    private io: SocketIO.Server;
    private port: string | number;

    private games: Map<string, GameInfo>;

    constructor() {
        this.app = express();
        this.port = process.env.PORT || GameServer.DEFAULT_PORT;
        this.server = http.createServer(this.app);
        this.io = require("socket.io").listen(this.server, { origins: '*:*' });

        this.games = new Map();

        this.listen();
    }

    private onBoardChange = (gameCode: string, board: any) => {
        const myConnectedClients = this.games.get(gameCode);
        if (myConnectedClients === undefined) { return; }
        myConnectedClients.connectedBoards.forEach(socket => socket.emit("board", board));
    };

    private onHandChange = (gameCode: string, playerName: string, hand: any) => {
        const myConnectedClients = this.games.get(gameCode);
        if (myConnectedClients === undefined) { return; }
        const connectedPlayer = myConnectedClients.connectedPlayers.get(playerName);
        if (connectedPlayer === undefined) { return; }
        connectedPlayer.forEach(socket => socket.emit("hand", hand));
    };

    private listen(): void {
        this.server.listen(this.port, () => {
            console.log("Running server on port %s", this.port);
        });

        this.io.on("connect", (socket) => {
            const playerName: string = socket.handshake.query.playerName;
            const gameCode: string = socket.handshake.query.gameCode;
            const gameName: string = socket.handshake.query.gameName;

            console.log("Connected player %s with game code %s.", playerName, gameCode);

            if (!this.games.has(gameCode)) {
                this.games.set(
                    gameCode,
                    new GameInfo(
                        gameName,
                        (board) => this.onBoardChange(gameCode, board),
                        (playerName: string, hand: any) => this.onHandChange(gameCode, playerName, hand)));

                console.log("Game code %s created", gameCode);
            } else {
                if (this.games.get(gameCode).gameName !== gameName) {
                    console.log("Game code already associated with another game");
                    return;
                }
            }

            const connectedBoards = this.games.get(gameCode).connectedBoards;
            const connectedPlayers = this.games.get(gameCode).connectedPlayers;
            const game = this.games.get(gameCode).game;

            if (playerName == "board") {
                connectedBoards.add(socket);
                socket.emit("board", game.getBoard());
                socket.emit("players", Array.from(connectedPlayers.keys()));
            } else {
                if (!connectedPlayers.has(playerName)) {
                    connectedPlayers.set(playerName, new Set());
                }
                connectedPlayers.get(playerName).add(socket);
                socket.emit("hand", game.getHand(playerName));

                connectedBoards.forEach(socket => socket.emit("players", Array.from(connectedPlayers.keys())));
            }

            socket.on("action", (action: any) => game.takeAction(playerName, action));

            socket.on("start", () => game.start(Array.from(connectedPlayers.keys())));

            socket.on("disconnect", () => {
                if (playerName == "board") {
                    connectedBoards.delete(socket);
                } else {
                    connectedPlayers.get(playerName).delete(socket);
                    if (connectedPlayers.get(playerName).size == 0) {
                        connectedPlayers.delete(playerName);
                    }
                    connectedBoards.forEach(socket => socket.emit("players", Array.from(connectedPlayers.keys())));
                }

                if (connectedBoards.size === 0 && connectedPlayers.size === 0) {
                    this.games.delete(gameCode);
                    console.log("Game code %s deleted", gameCode);
                }

                console.log("Player %s disconnected", playerName);
            });
        });
    }

    public getApp(): express.Application {
        return this.app;
    }
}
