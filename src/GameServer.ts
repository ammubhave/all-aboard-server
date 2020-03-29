import express from "express";
import { Game } from "./games/interface";
import * as http from "http";
import * as SocketIO from "socket.io";

export default class GameServer {
    public static readonly DEFAULT_PORT: number = 3000;
    private app: express.Application;
    private server: http.Server;
    private io: SocketIO.Server;
    private port: string | number;

    private game: Game;

    private connectedBoards: Set<SocketIO.Socket>;
    private connectedPlayers: Map<string, Set<SocketIO.Socket>>;

    constructor(game: Game) {
        this.app = express();
        this.port = process.env.PORT || GameServer.DEFAULT_PORT;
        this.server = http.createServer(this.app);
        this.io = require("socket.io").listen(this.server, { origins: '*:*' });

        this.connectedBoards = new Set();
        this.connectedPlayers = new Map();

        this.game = game;
        this.game.setOnBoardChangeCallback(this.onBoardChange);
        this.game.setOnHandChangeCallback(this.onHandChange);

        this.listen();
    }

    private onBoardChange = (board: any) => {
        this.connectedBoards.forEach(socket => socket.emit("board", board));
    };

    private onHandChange = (playerName: string, hand: any) => {
        if (!this.connectedPlayers.has(playerName)) {
            return;
        }
        this.connectedPlayers.get(playerName).forEach(socket => socket.emit("hand", hand));
    };

    private listen(): void {
        this.server.listen(this.port, () => {
            console.log("Running server on port %s", this.port);
        });

        this.io.on("connect", (socket) => {
            let playerName: string = socket.handshake.query.playerName;

            console.log("Connected player %s on port %s.", playerName, this.port);

            if (playerName == "board") {
                this.connectedBoards.add(socket);
                socket.emit("board", this.game.getBoard());
                socket.emit("players", Array.from(this.connectedPlayers.keys()));
            } else {
                if (!this.connectedPlayers.has(playerName)) {
                    this.connectedPlayers.set(playerName, new Set());
                }
                this.connectedPlayers.get(playerName).add(socket);
                socket.emit("hand", this.game.getHand(playerName));

                this.connectedBoards.forEach(socket => socket.emit("players", Array.from(this.connectedPlayers.keys())));
            }

            socket.on("action", (action: any) => this.game.takeAction(playerName, action));

            socket.on("start", () => this.game.start(Array.from(this.connectedPlayers.keys())));

            socket.on("disconnect", () => {
                if (playerName == "board") {
                    this.connectedBoards.delete(socket);
                } else {
                    this.connectedPlayers.get(playerName).delete(socket);
                    if (this.connectedPlayers.get(playerName).size == 0) {
                        this.connectedPlayers.delete(playerName);
                    }
                    this.connectedBoards.forEach(socket => socket.emit("players", Array.from(this.connectedPlayers.keys())));
                }

                console.log("Player %s disconnected", playerName);
            });
        });
    }

    public getApp(): express.Application {
        return this.app;
    }
}
