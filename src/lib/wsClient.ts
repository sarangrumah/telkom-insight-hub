import type { TicketRecord, TicketMessageRecord } from './apiClient';

type WSEventConnected = { type: 'connected' };
type WSEventTicketCreated = { type: 'ticketCreated'; ticket: TicketRecord };
type WSEventTicketUpdated = { type: 'ticketUpdated'; ticket: TicketRecord };
type WSEventTicketClosed = { type: 'ticketClosed'; ticket: TicketRecord };
type WSEventMessageCreated = {
  type: 'messageCreated';
  message: TicketMessageRecord;
  ticket?: TicketRecord;
};

// Fallback for forward-compat if backend emits new events we don't know yet
type WSEventUnknown = { type: string; payload?: unknown };

export type WSEvent =
  | WSEventConnected
  | WSEventTicketCreated
  | WSEventTicketUpdated
  | WSEventTicketClosed
  | WSEventMessageCreated
  | WSEventUnknown;

type Listener = (evt: WSEvent) => void;

class WSClient {
  private static _instance: WSClient | null = null;
  private ws: WebSocket | null = null;
  private listeners = new Set<Listener>();
  private reconnectTimer: number | null = null;
  private initialized = false;

  static get instance(): WSClient {
    if (!WSClient._instance) {
      WSClient._instance = new WSClient();
    }
    return WSClient._instance;
  }

  subscribe(listener: Listener): () => void {
    this.ensureConnected();
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private ensureConnected() {
    if (this.initialized && this.ws && this.ws.readyState <= WebSocket.OPEN) {
      return;
    }

    const rawApiBase = (import.meta.env.VITE_API_BASE_URL as string) || '';
    const apiBase = rawApiBase.endsWith('/panel') ? rawApiBase.slice(0, -6) : rawApiBase;
    
    let wsUrl = '';
    if (apiBase) {
      wsUrl = apiBase.replace(/^http/, 'ws') + '/panel/ws';
    } else {
      // Construct absolute WS URL from current location
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      wsUrl = `${protocol}//${window.location.host}/panel/ws`;
    }
    const token = localStorage.getItem('app.jwt.token') || '';

    const connect = () => {
      try {
        this.ws = new WebSocket(`${wsUrl}?token=${encodeURIComponent(token)}`);

        this.ws.onmessage = (evt) => {
          try {
            const payload = JSON.parse(evt.data) as WSEvent;
            if (!payload || typeof payload !== 'object') return;
            // Fan out to listeners
            for (const l of [...this.listeners]) {
              try {
                l(payload);
              } catch {
                // ignore listener errors to not break others
              }
            }
          } catch {
            // ignore parse errors
          }
        };

        this.ws.onclose = () => {
          if (this.reconnectTimer == null) {
            // simple reconnect after 3s
            this.reconnectTimer = window.setTimeout(() => {
              this.reconnectTimer = null;
              connect();
            }, 3000) as unknown as number;
          }
        };

        this.ws.onerror = () => {
          // errors will trigger onclose and reconnect
        };

        this.initialized = true;
      } catch {
        // first attempt failed, schedule reconnect
        if (this.reconnectTimer == null) {
          this.reconnectTimer = window.setTimeout(() => {
            this.reconnectTimer = null;
            connect();
          }, 3000) as unknown as number;
        }
      }
    };

    connect();
  }
}

export const wsClient = WSClient.instance;