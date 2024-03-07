import { NgModule } from '@angular/core';
import * as config from '@config';
import { io, Socket } from 'socket.io-client';
import { Storage } from './Storage';
import { Logger } from './Logger';
import { CookieService } from './Cookie';

@NgModule()
export class SocketService {
  constructor(
    private storage: Storage,
    private logger: Logger,
    private cookieService: CookieService
  ) {}

  /**
   * Main declaration of socket
   */
  public connected: boolean = false;
  private socket: Socket | null = null;
  public socket_err: boolean = false;
  private socket_errMsg: string = '';
  public socketFunctions: Record<string, Record<string, Function>> = {};
  public socketFunctionsNotConnected: Record<string, Record<string, Function>> = {};

  public addFunction(event: string, fn: Function, name: string = event): void {
    if (!this.socketFunctions[event]) {
      this.logger.send('Socket', 'Listening new event ' + event);
      this.socketFunctions[event] = {};
    }

    if (!this.socketFunctions[event][name])
      this.socketFunctions[event][name] = fn;
  }

  public addFunctionNotConnected(event: string, fn: Function, name: string = event): void {
    if (!this.socketFunctionsNotConnected[event]) {
      this.logger.send('Socket', 'Listening new event ' + event);
      this.socketFunctionsNotConnected[event] = {};
    }

    if (!this.socketFunctionsNotConnected[event][name])
      this.socketFunctionsNotConnected[event][name] = fn;
  }

  /**
   * Get Socket client, Socket status and Socket err msg
   * @returns socket information
   */
  public getSocket(): { Socket: Socket | null; err: boolean; errMsg: string } {
    return {
      Socket: this.socket,
      err: this.socket_err,
      errMsg: this.socket_errMsg,
    };
  }

  /**
   * Connect to socket as anonymous based on url from @config.server
   */
  public connectAnon(): Socket | void {
    try {
      this.socket = io(config.server);
      this.listenBasicEvents();
      this.socket?.onAny((event, ...args) => {
        this.connected = true;
        this.socket_err = false;
        if (
          this.socketFunctionsNotConnected[event] &&
          Object.values(this.socketFunctionsNotConnected[event]).length > 0
        ) {
          Object.values(this.socketFunctionsNotConnected[event]).forEach((fn: Function) => {
            fn(args?.[0]);
          });
        }
      });
      return this.socket;
    } catch (e) {
      this.socket?.disconnect();
      this.socket?.removeAllListeners();
    }
  }

  /**
   * Connect to socket as user based on from @config.server and @Schoolingo/user.token
   */
  public connectUser(): Socket | void {
    try {
      let token = this.cookieService.getCookie('token');
      if (token == '') return;

      this.socket = io(config.server, {
        extraHeaders: { Authorization: 'Bearer ' + token },
      });
      this.listenBasicEvents();
      this.socket?.onAny((event, ...args) => {
        this.connected = true;
        this.socket_err = false;
        if (
          this.socketFunctions[event] &&
          Object.values(this.socketFunctions[event]).length > 0
        ) {
          Object.values(this.socketFunctions[event]).forEach((fn: Function) => {
            fn(args?.[0]);
          });
        }
      });
      return this.socket;
    } catch (e) {
      this.socket?.disconnect();
      this.socket?.removeAllListeners();
    }
  }

  /**
   * Register basic socket listeners
   */
  private listenBasicEvents(): void {
    if (this.socket == null) {
      this.logger.send('Socket', 'No socket found');
      return;
    }
    this.socket.on('connect', () => {
      this.connected = true;
      this.socket_err = false;
      this.socket_errMsg = '';
      this.logger.send('Socket', 'Connected to socket.');
    });

    this.socket.on('connect_error', (data) => {
      this.connected = false;
      this.socket_err = true;
      this.socket_errMsg = data.message;
      this.socket?.removeAllListeners();
    });

    this.socket.on('disconnect', (data) => {
      this.socket?.removeAllListeners();
      this.connected = false;
      this.socket_err = false;
      this.socket_errMsg = 'Disconnect';
    });
  }
}
