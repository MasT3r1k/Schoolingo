import { Injectable } from '@angular/core';
import { Config } from '@Schoolingo/config';
import { BehaviorSubject, Observable, Subject, filter, shareReplay } from 'rxjs';

export interface NotificationPayload {
  id: number;
  type: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  url?: string;
  icon?: string;
}

export interface WsMessage {
  type: string;
  payload?: any;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class WsService {
  private socket?: WebSocket;

  private connectionState$ = new BehaviorSubject<boolean>(false);
  public connected$ = this.connectionState$.asObservable();

  private incoming$ = new Subject<WsMessage>();
  
  // Notification-specific subjects for easy subscription
  private notifications$ = new Subject<NotificationPayload>();
  private unreadCount$ = new BehaviorSubject<number>(0);

  private reconnectDelay = 2000;
  private maxReconnectDelay = 30000;
  private currentReconnectDelay = 2000;
  private wsUrl = Config.WS_URL;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;

  private messageQueue: any[] = [];
  private pingInterval?: any;

  constructor() {
    // Don't auto-connect in constructor - let components control connection
  }

  /** 🔌 Connect to WebSocket */
  connect(): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    try {
      this.socket = new WebSocket(this.wsUrl);

      this.socket.onopen = () => {
        console.log('[WS] Connected');
        this.connectionState$.next(true);
        this.reconnectAttempts = 0;
        this.currentReconnectDelay = this.reconnectDelay;

        // Send queued messages
        while (this.messageQueue.length > 0) {
          const msg = this.messageQueue.shift();
          this.send(msg);
        }

        // Start ping interval for connection health
        this.startPingInterval();

        // Get initial unread count
        this.send({ type: 'get_unread_count' });
      };

      this.socket.onmessage = (msg) => {
        try {
          const data = JSON.parse(msg.data);
          this.handleMessage(data);
        } catch (err) {
          console.error('[WS] Invalid message', err);
        }
      };

      this.socket.onclose = (event) => {
        console.log('[WS] Disconnected', event.code, event.reason);
        this.connectionState$.next(false);
        this.stopPingInterval();

        // Reconnect with exponential backoff
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`[WS] Reconnecting in ${this.currentReconnectDelay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
          
          setTimeout(() => {
            this.connect();
          }, this.currentReconnectDelay);

          // Exponential backoff
          this.currentReconnectDelay = Math.min(
            this.currentReconnectDelay * 1.5,
            this.maxReconnectDelay
          );
        }
      };

      this.socket.onerror = (err) => {
        console.error('[WS] Error:', err);
      };
    } catch (err) {
      console.error('[WS] Failed to connect:', err);
    }
  }

  /** Handle incoming messages */
  private handleMessage(data: WsMessage): void {
    // Route to specific handlers
    switch (data.type) {
      case 'notification':
        this.handleNotification(data.payload);
        break;
      
      case 'unread_count':
        this.unreadCount$.next(data['count'] || 0);
        break;
      
      case 'notification_read_ack':
        // Decrement unread count
        const current = this.unreadCount$.getValue();
        if (current > 0) {
          this.unreadCount$.next(current - 1);
        }
        break;
      
      case 'pong':
        // Connection is healthy
        break;
      
      default:
        // Forward to general incoming stream
        this.incoming$.next(data);
    }
  }

  /** Handle real-time notification */
  private handleNotification(notification: NotificationPayload): void {
    // Increment unread count
    this.unreadCount$.next(this.unreadCount$.getValue() + 1);

    // Emit notification
    this.notifications$.next(notification);

    // Show browser notification if permitted
    this.showBrowserNotification(notification);
  }

  /** Show browser notification */
  private showBrowserNotification(notification: NotificationPayload): void {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    try {
      const browserNotif = new Notification(notification.title, {
        body: notification.body,
        icon: notification.icon || '/assets/logo/logo-48.png',
        badge: '/assets/logo/logo-48.png',
        tag: notification.type,
        data: { url: notification.url }
      });

      browserNotif.onclick = () => {
        window.focus();
        if (notification.url) {
          window.location.href = notification.url;
        }
        browserNotif.close();
      };

      // Auto-close after 5 seconds
      setTimeout(() => browserNotif.close(), 5000);
    } catch (err) {
      console.error('[WS] Failed to show notification:', err);
    }
  }

  /** Start ping interval */
  private startPingInterval(): void {
    this.stopPingInterval();
    this.pingInterval = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' });
      }
    }, 30000); // Ping every 30 seconds
  }

  /** Stop ping interval */
  private stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = undefined;
    }
  }

  /** Close connection */
  close(): void {
    this.stopPingInterval();
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnection
    this.socket?.close();
  }

  /** Send message */
  send(data: any): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('[WS] Not connected, queuing message...');
      this.messageQueue.push(data);
      return;
    }
    this.socket.send(JSON.stringify(data));
  }

  /** Listen for specific message type */
  onMessage<T = any>(type: string): Observable<T> {
    return this.incoming$.pipe(
      filter((msg: WsMessage) => msg?.type === type),
      shareReplay(1)
    ) as Observable<T>;
  }

  /** Get all notifications stream */
  getNotifications(): Observable<NotificationPayload> {
    return this.notifications$.asObservable();
  }

  /** Get unread count */
  getUnreadCount(): Observable<number> {
    return this.unreadCount$.asObservable();
  }

  /** Mark notification as read */
  markNotificationAsRead(notificationId: number): void {
    this.send({
      type: 'notification_read',
      notificationId
    });
  }

  /** Refresh unread count */
  refreshUnreadCount(): void {
    this.send({ type: 'get_unread_count' });
  }

  /** Get all messages stream */
  allMessages(): Observable<WsMessage> {
    return this.incoming$.asObservable();
  }

  /** Check if connected */
  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}
