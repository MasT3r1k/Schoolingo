import { NgModule } from "@angular/core";
import { CookieService } from "./Cookie";
import { io, Socket } from "socket.io-client";
import { Observable } from "rxjs";
import { socketIP } from "./Config";
import { SocketUpdateLocale, SocketUpdateTheme } from "./Socket.d";
export { SocketUpdateLocale, SocketUpdateTheme }

@NgModule()
export class SocketService {
  constructor(
      private cookieService: CookieService
  ) {}

  public isConnected: boolean = false;
  public socket: Socket | null = null;

  /**
  * Get Socket client, Socket status and Socket err msg
  * @returns socket information
  */
  public getSocket(): Socket | null {
    return this.socket;
  }

  public connect(): void {
    let token = this.cookieService.getCookie('token');
    if (token == '') {
      this.socket = io(socketIP);
      return;
    }
    this.socket = io(socketIP, {
      extraHeaders: { authorization: 'Bearer ' + token }
    });
  }


  public socketEvents: Map<string, Function[]> = new Map<string, Function[]>();
  public addFunction(event: string): Observable<any> {
    return new Observable<any>(observer => {
      const listener: Function = (data: any) => observer.next(data);
      this.socket?.on(event, listener as any);
      if (!this.socketEvents.has(event)) {
        this.socketEvents.set(event, []);
      }
      this.socketEvents.get(event)?.push(listener);
    });
  }

  public emit(event: string, data: any = {}): void {
    if (!this.socket) return;
    this.socket.emit(event, data); 
  }
    

  public disconnect(): void {
    if (!this.socket) return;
    this.socket?.disconnect();
  }

}