/**
 * Mock WebSocket implementation for real-time order updates
 */

import { Order, OrderStatus } from '@/models';

export type WebSocketMessageType = 'order_status_update';

export interface WebSocketMessage {
  type: WebSocketMessageType;
  data: Order;
}

export type WebSocketState =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'reconnecting';

export interface WebSocketEventHandlers {
  onOpen?: () => void;
  onMessage?: (message: WebSocketMessage) => void;
  onClose?: () => void;
  onError?: (error: Error) => void;
  onStateChange?: (state: WebSocketState) => void;
}

// Handler with ID for removal
interface Handler<T> {
  id: string;
  callback: T;
}

// Store multiple handlers for each event type
interface EventHandlers {
  onOpen: Handler<() => void>[];
  onMessage: Handler<(message: WebSocketMessage) => void>[];
  onClose: Handler<() => void>[];
  onError: Handler<(error: Error) => void>[];
  onStateChange: Handler<(state: WebSocketState) => void>[];
}

// Cleanup function type
export type UnsubscribeFn = () => void;

export class MockWebSocket {
  private state: WebSocketState = 'disconnected';
  private intervalId: NodeJS.Timeout | null = null;
  private reconnectTimeoutId: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private maxReconnectDelay = 30000; // Max 30 seconds
  private eventHandlers: EventHandlers = {
    onOpen: [],
    onMessage: [],
    onClose: [],
    onError: [],
    onStateChange: [],
  };
  private isManualClose = false;
  private firstOrder: Order | null = null;

  constructor() {
    this.setState('disconnected');
  }

  // Generate unique handler ID
  private generateHandlerId = (): string => {
    return `handler_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  };

  // Event handler registration - returns unsubscribe function
  public onOpen = (callback: () => void): UnsubscribeFn => {
    const id = this.generateHandlerId();
    this.eventHandlers.onOpen.push({ id, callback });
    return () => {
      this.eventHandlers.onOpen = this.eventHandlers.onOpen.filter(
        (h) => h.id !== id,
      );
    };
  };

  public onMessage = (
    callback: (message: WebSocketMessage) => void,
  ): UnsubscribeFn => {
    const id = this.generateHandlerId();
    this.eventHandlers.onMessage.push({ id, callback });
    return () => {
      this.eventHandlers.onMessage = this.eventHandlers.onMessage.filter(
        (h) => h.id !== id,
      );
    };
  };

  public onClose = (callback: () => void): UnsubscribeFn => {
    const id = this.generateHandlerId();
    this.eventHandlers.onClose.push({ id, callback });
    return () => {
      this.eventHandlers.onClose = this.eventHandlers.onClose.filter(
        (h) => h.id !== id,
      );
    };
  };

  public onError = (callback: (error: Error) => void): UnsubscribeFn => {
    const id = this.generateHandlerId();
    this.eventHandlers.onError.push({ id, callback });
    return () => {
      this.eventHandlers.onError = this.eventHandlers.onError.filter(
        (h) => h.id !== id,
      );
    };
  };

  public onStateChange = (
    callback: (state: WebSocketState) => void,
  ): UnsubscribeFn => {
    const id = this.generateHandlerId();
    this.eventHandlers.onStateChange.push({ id, callback });
    return () => {
      this.eventHandlers.onStateChange =
        this.eventHandlers.onStateChange.filter((h) => h.id !== id);
    };
  };

  // Connection management
  public connect = (): void => {
    if (this.state === 'connected' || this.state === 'connecting') {
      return;
    }

    this.isManualClose = false;
    this.setState('connecting');

    // Fetch the first order and then connect
    this.fetchFirstOrder()
      .then(() => {
        setTimeout(
          () => {
            if (this.isManualClose) {
              return;
            }

            this.resetReconnectionAttempts(); // Reset on successful connection
            this.setState('connected');
            this.eventHandlers.onOpen.forEach((h) => h.callback());
            this.startRealTimeUpdates();
          },
          Math.random() * 1000 + 500,
        ); // 500-1500ms connection delay
      })
      .catch((error: unknown) => {
        console.error('Failed to connect:', error);
        this.setState('disconnected');
        this.eventHandlers.onError.forEach((h) =>
          h.callback(error instanceof Error ? error : new Error(String(error))),
        );
      });
  };

  public disconnect = (): void => {
    this.isManualClose = true;
    this.stopRealTimeUpdates();
    this.clearReconnectTimeout();
    this.setState('disconnected');
    this.eventHandlers.onClose.forEach((h) => h.callback());
  };

  public getState = (): WebSocketState => {
    return this.state;
  };

  // Private methods
  private setState = (newState: WebSocketState): void => {
    if (this.state !== newState) {
      this.state = newState;
      this.eventHandlers.onStateChange.forEach((h) => h.callback(newState));
    }
  };

  private fetchFirstOrder = async (): Promise<void> => {
    try {
      const response = await fetch('/api/orders?page=1&pageSize=1');
      const data = await response.json();

      if (data.data && data.data.length > 0) {
        this.firstOrder = data.data[0] as Order;
        console.log('Fetched first order:', this.firstOrder.id);
      } else {
        throw new Error('No orders found');
      }
    } catch (error) {
      console.warn('Failed to fetch first order:', error);
      throw error;
    }
  };

  private startRealTimeUpdates = (): void => {
    this.stopRealTimeUpdates(); // Clear any existing interval

    // Send updates every 3-5 seconds
    const interval = Math.random() * 2000 + 3000; // 3000-5000ms

    this.intervalId = setInterval(() => {
      if (this.state === 'connected') {
        this.sendRandomUpdate();
      }
    }, interval);
  };

  private stopRealTimeUpdates = (): void => {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  };

  private clearReconnectTimeout = (): void => {
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }
  };

  private sendRandomUpdate = (): void => {
    // Simulate random disconnection (10% chance)
    if (Math.random() < 0.1) {
      this.simulateDisconnection();
      return;
    }

    const message = this.generateRandomMessage();
    this.eventHandlers.onMessage.forEach((h) => h.callback(message));
  };

  private generateRandomMessage = (): WebSocketMessage => {
    // Only update existing orders (first order from API)
    return {
      type: 'order_status_update',
      data: this.generateOrderStatusUpdate(),
    };
  };

  private generateOrderStatusUpdate = (): Order => {
    // Use the dynamically fetched first order
    if (!this.firstOrder) {
      throw new Error('First order not available');
    }

    // Progress status forward through the lifecycle
    const statusProgression: OrderStatus[] = [
      'pending',
      'processing',
      'shipped',
      'delivered',
    ];

    // Find current status index and progress to next
    const currentIndex = statusProgression.indexOf(this.firstOrder.status);
    const nextIndex =
      currentIndex >= 0 && currentIndex < statusProgression.length - 1
        ? currentIndex + 1
        : 0; // Reset to pending if delivered or not found
    const newStatus = statusProgression[nextIndex]!;

    const now = new Date().toISOString();

    // Update the stored order with new status
    this.firstOrder = {
      ...this.firstOrder,
      status: newStatus,
      updatedAt: now,
    };

    return this.firstOrder;
  };

  private simulateDisconnection = (): void => {
    this.setState('disconnected');
    this.stopRealTimeUpdates();
    this.eventHandlers.onClose.forEach((h) => h.callback());

    // Start reconnection logic if not manually closed
    if (!this.isManualClose) {
      this.attemptReconnect();
    }
  };

  private attemptReconnect = (): void => {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.eventHandlers.onError.forEach((h) =>
        h.callback(new Error('Max reconnection attempts reached')),
      );
      return;
    }

    this.reconnectAttempts++;
    this.setState('reconnecting');

    // Exponential backoff with jitter
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      this.maxReconnectDelay,
    );
    const jitter = Math.random() * 1000; // Add up to 1 second of jitter
    const finalDelay = delay + jitter;

    this.reconnectTimeoutId = setTimeout(() => {
      if (!this.isManualClose) {
        this.connect();
      }
    }, finalDelay);
  };

  // Reset reconnection attempts on successful connection
  private resetReconnectionAttempts = (): void => {
    this.reconnectAttempts = 0;
  };
}

// Singleton instance for the app
export const mockWebSocket = new MockWebSocket();
