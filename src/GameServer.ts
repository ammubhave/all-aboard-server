import express from "express";
import { Game } from "./games/interface";
import * as http from "http";
import * as SocketIO from "socket.io";
import Jaipur from "./games/jaipur";
import Codenames from "./games/codenames";

type GameKey = string;

class GameInfo {
    connectedBoards: Set<SocketIO.Socket>;
    connectedPlayers: Map<string, Set<SocketIO.Socket>>;
    game: Game;

    constructor(
        gameName: string,
        onBoardChange: (board: any) => void,
        onHandChange: (playerName: string, hand: any) => void
    ) {
        this.connectedBoards = new Set();
        this.connectedPlayers = new Map();

        switch (gameName) {
            case 'codenames':
                this.game = new Codenames();
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
    private password: string;

    private games: Map<GameKey, GameInfo>;

    constructor() {
        this.app = express();
        this.port = process.env.PORT || GameServer.DEFAULT_PORT;
        this.password = process.env.PASSWORD || "";
        this.server = http.createServer(this.app);
        this.io = require("socket.io").listen(this.server, { origins: '*:*' });

        this.io.use((socket, next) => {
            const password = socket.handshake.query.password || "";
            if (password === this.password) return next();
            console.log("Authentication failed: %s", password);
            return next(new Error('Authentication error'));
        });

        this.games = new Map();

        this.listen();
    }

    private onBoardChange = (gameKey: GameKey, board: any) => {
        const myConnectedClients = this.games.get(gameKey);
        if (myConnectedClients === undefined) { return; }
        myConnectedClients.connectedBoards.forEach(socket => socket.emit("board", board));
    };

    private onHandChange = (gameKey: GameKey, playerName: string, hand: any) => {
        const myConnectedClients = this.games.get(gameKey);
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
            const gameKey: string = `${gameName}#####${gameCode}`;

            console.log("Connected player %s with game code %s.", playerName, gameKey);

            if (!this.games.has(gameKey)) {
                this.games.set(
                    gameKey,
                    new GameInfo(
                        gameName,
                        (board) => this.onBoardChange(gameKey, board),
                        (playerName: string, hand: any) => this.onHandChange(gameKey, playerName, hand)));

                console.log("Game code %s created", gameKey);
            }

            const connectedBoards = this.games.get(gameKey).connectedBoards;
            const connectedPlayers = this.games.get(gameKey).connectedPlayers;
            const game = this.games.get(gameKey).game;

            if (playerName == "board") {
                connectedBoards.add(socket);
                socket.emit("board", game.getBoard());
                socket.emit("players", Array.from(connectedPlayers.keys()));
            } else {
                if (!connectedPlayers.has(playerName)) {
                    connectedPlayers.set(playerName, new Set());
                    game.addPlayer(playerName);
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
                        game.removePlayer(playerName);
                    }
                    connectedBoards.forEach(socket => socket.emit("players", Array.from(connectedPlayers.keys())));
                }

                if (connectedBoards.size === 0 && connectedPlayers.size === 0) {
                    this.games.delete(gameKey);
                    console.log("Game code %s deleted", gameKey);
                }

                console.log("Player %s disconnected", playerName);
            });
        });
    }

    public getApp(): express.Application {
        return this.app;
    }
}
