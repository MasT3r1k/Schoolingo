import { NgModule } from "@angular/core";
import { Storage } from "@Schoolingo/Storage";
import { CookieService } from "./Cookie";
import { Socket } from "socket.io-client";
import { Observable } from "rxjs";

@NgModule()
export class SocketService {
    constructor(
        private storage: Storage,
        private cookieService: CookieService
    ) {}

    public isConnected: boolean = false;
    private socket: Socket | null = null;

    /**
    * Get Socket client, Socket status and Socket err msg
    * @returns socket information
    */
    public getSocket(): Socket | null {
        return this.socket;
    }


    public socketEvents: Map<string, Function[]> = new Map<string, Function[]>();
    public addFunction(event: string): Observable<any> {
        return new Observable<any>(observer => {
          const listener = (data: any) => observer.next(data);
          this.socket?.on(event, listener);
          if (!this.socketEvents.has(event)) {
            this.socketEvents.set(event, []);
          }
          this.socketEvents.get(event)?.push(listener);
        });
    }



}