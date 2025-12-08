import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, filter, retry, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WsService {
  private socket?: WebSocket;

  private connectionState$ = new BehaviorSubject<boolean>(false);
  public connected$ = this.connectionState$.asObservable();

  private incoming$ = new Subject<any>();

  private reconnectDelay = 2000;
  private wsUrl = 'ws://localhost:3000/ws';

  private messageQueue: any[] = [];

  constructor() {
    this.connect();
  }

  /** 🔌 Připojení k WebSocketu */
  connect() {
    this.socket = new WebSocket(this.wsUrl);

    this.socket.onopen = () => {
      console.log('WS connected');
      this.connectionState$.next(true);

      // 📨 Odeslání všech zpráv, co čekaly
      this.messageQueue.forEach((msg) => this.send(msg));
      this.messageQueue = [];
    };

    this.socket.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data);
        this.incoming$.next(data);
      } catch (err) {
        console.error('Invalid WS message', err);
      }
    };

    this.socket.onclose = () => {
      console.log('WS disconnected');
      this.connectionState$.next(false);

      setTimeout(() => {
        console.log('WS reconnecting...');
        this.connect();
      }, this.reconnectDelay);
    };

    this.socket.onerror = (err) => {
      console.error('WS error:', err);
      this.socket?.close();
    };
  }

  close(): void {
    this.socket?.close();
  }

  /** ✉️ Odeslání zprávy */
  send(data: any) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('WS not connected, queuing message...');
      this.messageQueue.push(data);
      return;
    }
    this.socket.send(JSON.stringify(data));
  }

  /** 🎯 Poslouchej jen konkrétní typ zprávy */
  onMessage<T = any>(type: string): Observable<T> {
    return this.incoming$.pipe(
      filter((msg: any) => msg?.type === type),
      shareReplay(1)
    );
  }

  /** 🔊 Poslouchání všech zpráv */
  allMessages(): Observable<any> {
    return this.incoming$.asObservable();
  }
}
