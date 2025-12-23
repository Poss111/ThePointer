import { Injectable } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Observable } from 'rxjs';
import { SessionResponse, VoteResponse } from './session.service';

export interface SessionUpdateMessage {
  type: 'SESSION_UPDATE' | 'SESSION_CLOSED';
  session: SessionResponse | null;
  votes: VoteResponse[] | null;
}

@Injectable({
  providedIn: 'root'
})
export class RealtimeService {
  private client?: Client;

  connectToSession(sessionId: string): Observable<SessionUpdateMessage> {
    // Clean up any existing connection
    if (this.client) {
      this.client.deactivate();
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
    });

    return new Observable<SessionUpdateMessage>((subscriber) => {
      let subscription: StompSubscription | undefined;

      this.client!.onConnect = () => {
        subscription = this.client!.subscribe(`/topic/sessions/${sessionId}`, (message: IMessage) => {
          try {
            const payload = JSON.parse(message.body) as SessionUpdateMessage;
            subscriber.next(payload);
          } catch (e) {
            console.error('Failed to parse websocket message', e);
          }
        });
      };

      this.client!.onStompError = (frame) => {
        console.error('STOMP error', frame);
        subscriber.error(frame);
      };

      this.client!.onWebSocketError = (event) => {
        console.error('WebSocket error', event);
      };

      this.client!.activate();

      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
        if (this.client) {
          this.client.deactivate();
          this.client = undefined;
        }
      };
    });
  }
}


