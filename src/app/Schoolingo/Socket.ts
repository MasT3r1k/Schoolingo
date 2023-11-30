import { Injectable } from "@angular/core";
import * as config from '@config';
import { io, Socket } from 'socket.io-client';
import { Cache } from "./Cache";
import { Logger } from "./Logger";

@Injectable()
export class SocketService {
    constructor(
        private cache: Cache,
        private logger: Logger
    ) {
    }

    /**
     * Main declaration of socket
     */
    private socket: Socket | null = null;
    private socket_err: boolean = false;
    private socket_errMsg: string = '';

    /**
     * Get Socket client, Socket status and Socket err msg
     * @returns socket information
     */
    public getSocket(): { Socket: Socket | null;err: boolean;errMsg: string; } {
        return {
            Socket: this.socket,
            err: this.socket_err,
            errMsg: this.socket_errMsg
        }
    }

    /**
     * Connect to socket as anonymous based on url from @config.server
     */
    public connectAnon(): void {
        try {
            if (this.socket) this.socket.disconnect();
            this.socket = io(config.server);
            this.listenBasicEvents();
        } catch(e) {
            console.error(e);
            this.socket?.disconnect();
            this.socket?.removeAllListeners();
        }
    }

    /**
     * Connect to socket as user based on from @config.server and @Schoolingo/user.token
     */
    public connectUser(): void {
        try {
            let token = this.cache.get(this.cache.tokenCacheName);
            if (token == false || !token?.token || !token?.expiration) return;
            if (this.socket) this.socket.disconnect();

            this.socket = io(config.server, { extraHeaders: { Authorization: 'Bearer ' + token.token }});
            this.listenBasicEvents();
        } catch(e) {
            this.socket?.disconnect();
            this.socket?.removeAllListeners();
        }
    }

    /**
     * Register basic socket listeners
     */
    private listenBasicEvents(): void {
        if (this.socket == null) {console.log("No socket found");return;}
        this.socket.on('connect', () => {
            this.socket_err = false;
            this.socket_errMsg = '';
            this.logger.send('Socket', 'Connected to socket.');

        });

        this.socket.on('connect_error', (data) => {
            this.socket_err = true;
            this.socket_errMsg = data.message;
            this.socket?.removeAllListeners();
        })

        this.socket.on('disconnect', (data) => {
            this.socket?.removeAllListeners();
            this.socket = null;
            this.socket_err = false;
            this.socket_errMsg = 'Disconnect';
        })
    }

}