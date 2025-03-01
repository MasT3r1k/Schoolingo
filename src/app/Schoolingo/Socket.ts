import { NgModule } from "@angular/core";
import { io, Socket } from "socket.io-client";
import { BehaviorSubject, Observable } from "rxjs";
import { Config } from "@Schoolingo/Config";
import { SocketUpdateLocale, SocketUpdateTheme } from "./Socket.d";
import { errorAPI } from "@Components/Datalist/Datalist";
export { SocketUpdateLocale, SocketUpdateTheme }

@NgModule()
export class SocketService {
  public tokenStatus: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  public isConnected = false;
  public socket: Socket | null = null;

  /**
  * Get Socket client, Socket status and Socket err msg
  * @returns socket information
  */
  public getSocket(): typeof this.socket {
    return this.socket;
  }

  public connect(): void {
    this.socket = io(Config.socketIP, {
      withCredentials: true
    });

    this.socketEvents.forEach((value: Function[], event: string) => {
      value.forEach((listener: Function) => {
        this.socket?.on(event, listener as any);
      });
    });
    console.log(this.socketEvents)

    this.socket.on('system:error', (data: errorAPI | { username:string;error:string; }) => {
      console.log(data.error);
      if ('error' in data) {
        switch(data.error) {
          default:
            this.tokenStatus.next(data.error);
            break;
        }
      }
    });
    
    this.socket.onAny((event, ...args) => {
      this.tokenStatus.next('refresh_token');
      if (Config.DEV_MOD) {
        console.log(`Event ${event} got: `, args);
      }
    })

    this.socket.offAny((event, ...args) => {
      if (Config.DEV_MOD) {
        console.log('Event ' + event + ' off ' + args);
      }
  })
  }


  public socketEvents = new Map<string, Function[]>();
  public addFunction(event: string): Observable<any> {
    return new Observable<any>(observer => {
      const listener = (data: any) => observer.next(data);
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