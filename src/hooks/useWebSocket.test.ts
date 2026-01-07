import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';

import {
  mockWebSocket,
  WebSocketMessage,
  WebSocketState,
} from '../services/mockWebSocket';

import { useWebSocket } from './useWebSocket';

import { createMockOrder } from '@/test/helpers';

// Mock the mockWebSocket service
vi.mock('../services/mockWebSocket', () => {
  const createMockWebSocketService = () => {
    let messageHandler: ((msg: WebSocketMessage) => void) | null = null;
    let stateChangeHandler: ((state: WebSocketState) => void) | null = null;
    let errorHandler: ((error: Error) => void) | null = null;
    let openHandler: (() => void) | null = null;
    let closeHandler: (() => void) | null = null;
    let currentState: WebSocketState = 'disconnected';

    return {
      connect: vi.fn(),
      disconnect: vi.fn(),
      getState: vi.fn(() => currentState),
      onMessage: vi.fn((handler: (msg: WebSocketMessage) => void) => {
        messageHandler = handler;
        return vi.fn(); // unsubscribe function
      }),
      onStateChange: vi.fn((handler: (state: WebSocketState) => void) => {
        stateChangeHandler = handler;
        return vi.fn();
      }),
      onError: vi.fn((handler: (error: Error) => void) => {
        errorHandler = handler;
        return vi.fn();
      }),
      onOpen: vi.fn((handler: () => void) => {
        openHandler = handler;
        return vi.fn();
      }),
      onClose: vi.fn((handler: () => void) => {
        closeHandler = handler;
        return vi.fn();
      }),
      // Test helpers to trigger events
      __triggerMessage: (msg: WebSocketMessage) => messageHandler?.(msg),
      __triggerStateChange: (state: WebSocketState) => {
        currentState = state;
        stateChangeHandler?.(state);
      },
      __triggerError: (error: Error) => errorHandler?.(error),
      __triggerOpen: () => openHandler?.(),
      __triggerClose: () => closeHandler?.(),
      __setState: (state: WebSocketState) => {
        currentState = state;
      },
    };
  };

  const mockService = createMockWebSocketService();

  return {
    mockWebSocket: mockService,
    WebSocketState: {},
  };
});

// Type for the mocked service with test helpers
type MockedWebSocketService = typeof mockWebSocket & {
  __triggerMessage: (msg: WebSocketMessage) => void;
  __triggerStateChange: (state: WebSocketState) => void;
  __triggerError: (error: Error) => void;
  __triggerOpen: () => void;
  __triggerClose: () => void;
  __setState: (state: WebSocketState) => void;
};

const mockedWebSocket = mockWebSocket as MockedWebSocketService;

describe('useWebSocket', () => {
  let queryClient: QueryClient;
  let unsubscribeFns: Mock[];

  const createWrapper = () => {
    return ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children);
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Create fresh QueryClient for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Create mock unsubscribe functions
    unsubscribeFns = [vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn()];

    // Setup mock return values for event handlers
    (mockWebSocket.onMessage as Mock).mockReturnValue(unsubscribeFns[0]);
    (mockWebSocket.onStateChange as Mock).mockReturnValue(unsubscribeFns[1]);
    (mockWebSocket.onError as Mock).mockReturnValue(unsubscribeFns[2]);
    (mockWebSocket.onOpen as Mock).mockReturnValue(unsubscribeFns[3]);
    (mockWebSocket.onClose as Mock).mockReturnValue(unsubscribeFns[4]);

    // Set initial state
    mockedWebSocket.__setState('disconnected');
    (mockWebSocket.getState as Mock).mockReturnValue('disconnected');
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('initialization', () => {
    it('should return initial connection state from mockWebSocket', () => {
      (mockWebSocket.getState as Mock).mockReturnValue('disconnected');

      const { result } = renderHook(() => useWebSocket(), {
        wrapper: createWrapper(),
      });

      expect(result.current.connectionState).toBe('disconnected');
      expect(result.current.isConnected).toBe(false);
    });

    it('should expose connect, disconnect, and getState methods', () => {
      const { result } = renderHook(() => useWebSocket(), {
        wrapper: createWrapper(),
      });

      expect(result.current.connect).toBe(mockWebSocket.connect);
      expect(result.current.disconnect).toBe(mockWebSocket.disconnect);
      expect(result.current.getState).toBe(mockWebSocket.getState);
    });

    it('should auto-connect on mount', () => {
      renderHook(() => useWebSocket(), {
        wrapper: createWrapper(),
      });

      expect(mockWebSocket.connect).toHaveBeenCalledTimes(1);
    });
  });

  describe('event handler registration', () => {
    it('should register all event handlers on mount', () => {
      renderHook(() => useWebSocket(), {
        wrapper: createWrapper(),
      });

      expect(mockWebSocket.onMessage).toHaveBeenCalledTimes(1);
      expect(mockWebSocket.onStateChange).toHaveBeenCalledTimes(1);
      expect(mockWebSocket.onError).toHaveBeenCalledTimes(1);
      expect(mockWebSocket.onOpen).toHaveBeenCalledTimes(1);
      expect(mockWebSocket.onClose).toHaveBeenCalledTimes(1);
    });

    it('should register handlers with callback functions', () => {
      renderHook(() => useWebSocket(), {
        wrapper: createWrapper(),
      });

      expect(mockWebSocket.onMessage).toHaveBeenCalledWith(
        expect.any(Function),
      );
      expect(mockWebSocket.onStateChange).toHaveBeenCalledWith(
        expect.any(Function),
      );
      expect(mockWebSocket.onError).toHaveBeenCalledWith(expect.any(Function));
      expect(mockWebSocket.onOpen).toHaveBeenCalledWith(expect.any(Function));
      expect(mockWebSocket.onClose).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('cleanup on unmount', () => {
    it('should unsubscribe all handlers on unmount', () => {
      const { unmount } = renderHook(() => useWebSocket(), {
        wrapper: createWrapper(),
      });

      unmount();

      unsubscribeFns.forEach((unsubscribe) => {
        expect(unsubscribe).toHaveBeenCalledTimes(1);
      });
    });

    it('should disconnect on unmount', () => {
      const { unmount } = renderHook(() => useWebSocket(), {
        wrapper: createWrapper(),
      });

      unmount();

      expect(mockWebSocket.disconnect).toHaveBeenCalledTimes(1);
    });
  });

  describe('connection state changes', () => {
    it('should update connectionState when state changes', async () => {
      const { result } = renderHook(() => useWebSocket(), {
        wrapper: createWrapper(),
      });

      expect(result.current.connectionState).toBe('disconnected');

      // Get the registered state change handler and call it
      const stateChangeHandler = (mockWebSocket.onStateChange as Mock).mock
        .calls[0]![0];

      act(() => {
        stateChangeHandler('connecting');
      });

      expect(result.current.connectionState).toBe('connecting');

      act(() => {
        stateChangeHandler('connected');
      });

      expect(result.current.connectionState).toBe('connected');
      expect(result.current.isConnected).toBe(true);
    });

    it('should set isConnected to true only when state is connected', async () => {
      const { result } = renderHook(() => useWebSocket(), {
        wrapper: createWrapper(),
      });

      const stateChangeHandler = (mockWebSocket.onStateChange as Mock).mock
        .calls[0]![0];

      // Test all states
      const states: WebSocketState[] = [
        'connecting',
        'disconnected',
        'reconnecting',
      ];

      for (const state of states) {
        act(() => {
          stateChangeHandler(state);
        });
        expect(result.current.isConnected).toBe(false);
      }

      act(() => {
        stateChangeHandler('connected');
      });
      expect(result.current.isConnected).toBe(true);
    });
  });

  describe('message handling', () => {
    it('should update specific order in cache on order_status_update message', async () => {
      const mockOrder = createMockOrder();
      const updatedOrder = { ...mockOrder, status: 'shipped' as const };

      // Pre-populate cache with the order
      queryClient.setQueryData(['order', mockOrder.id], mockOrder);

      renderHook(() => useWebSocket(), {
        wrapper: createWrapper(),
      });

      // Get the message handler and trigger a message
      const messageHandler = (mockWebSocket.onMessage as Mock).mock
        .calls[0]![0];

      act(() => {
        messageHandler({
          type: 'order_status_update',
          data: updatedOrder,
        });
      });

      // Verify the specific order cache was updated
      const cachedOrder = queryClient.getQueryData(['order', mockOrder.id]);
      expect(cachedOrder).toEqual(updatedOrder);
    });

    it('should update order in orders list cache on order_status_update message', async () => {
      const mockOrder1 = createMockOrder();
      const mockOrder2 = createMockOrder({
        id: 'order-2',
        status: 'processing',
      });
      const updatedOrder1 = { ...mockOrder1, status: 'shipped' as const };

      // Pre-populate cache with orders list
      queryClient.setQueryData(['orders', { page: 1 }], {
        data: [mockOrder1, mockOrder2],
        total: 2,
        page: 1,
        pageSize: 10,
      });

      renderHook(() => useWebSocket(), {
        wrapper: createWrapper(),
      });

      const messageHandler = (mockWebSocket.onMessage as Mock).mock
        .calls[0]![0];

      act(() => {
        messageHandler({
          type: 'order_status_update',
          data: updatedOrder1,
        });
      });

      // Verify the orders list cache was updated
      const cachedOrders = queryClient.getQueryData<{
        data: (typeof mockOrder1)[];
      }>(['orders', { page: 1 }]);
      expect(cachedOrders?.data[0]).toEqual(updatedOrder1);
      expect(cachedOrders?.data[1]).toEqual(mockOrder2);
    });

    it('should not modify cache if order is not in the list', async () => {
      const mockOrder1 = createMockOrder();
      const nonExistentOrder = createMockOrder({
        id: 'order-999',
        status: 'shipped',
      });

      // Pre-populate cache
      queryClient.setQueryData(['orders', { page: 1 }], {
        data: [mockOrder1],
        total: 1,
        page: 1,
        pageSize: 10,
      });

      renderHook(() => useWebSocket(), {
        wrapper: createWrapper(),
      });

      const messageHandler = (mockWebSocket.onMessage as Mock).mock
        .calls[0]![0];

      act(() => {
        messageHandler({
          type: 'order_status_update',
          data: nonExistentOrder,
        });
      });

      // Verify existing order was not modified
      const cachedOrders = queryClient.getQueryData<{
        data: (typeof mockOrder1)[];
      }>(['orders', { page: 1 }]);
      expect(cachedOrders?.data[0]).toEqual(mockOrder1);
      expect(cachedOrders?.data.length).toBe(1);
    });

    it('should handle empty cache gracefully', async () => {
      const updatedOrder = createMockOrder({ status: 'shipped' });

      renderHook(() => useWebSocket(), {
        wrapper: createWrapper(),
      });

      const messageHandler = (mockWebSocket.onMessage as Mock).mock
        .calls[0]![0];

      // Should not throw when cache is empty
      expect(() => {
        act(() => {
          messageHandler({
            type: 'order_status_update',
            data: updatedOrder,
          });
        });
      }).not.toThrow();
    });

    it('should update multiple cached order lists', async () => {
      const mockOrder = createMockOrder();
      const updatedOrder = { ...mockOrder, status: 'delivered' as const };

      // Pre-populate multiple cache entries
      queryClient.setQueryData(['orders', { page: 1 }], {
        data: [mockOrder],
        total: 1,
        page: 1,
        pageSize: 10,
      });
      queryClient.setQueryData(['orders', { page: 2 }], {
        data: [mockOrder],
        total: 1,
        page: 2,
        pageSize: 10,
      });

      renderHook(() => useWebSocket(), {
        wrapper: createWrapper(),
      });

      const messageHandler = (mockWebSocket.onMessage as Mock).mock
        .calls[0]![0];

      act(() => {
        messageHandler({
          type: 'order_status_update',
          data: updatedOrder,
        });
      });

      // Both cache entries should be updated
      const page1 = queryClient.getQueryData<{ data: (typeof mockOrder)[] }>([
        'orders',
        { page: 1 },
      ]);
      const page2 = queryClient.getQueryData<{ data: (typeof mockOrder)[] }>([
        'orders',
        { page: 2 },
      ]);

      expect(page1?.data[0]!.status).toBe('delivered');
      expect(page2?.data[0]!.status).toBe('delivered');
    });
  });

  describe('console logging', () => {
    let consoleLogSpy: ReturnType<typeof vi.spyOn>;
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleLogSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('should log message when WebSocket message is received', () => {
      const mockOrder = createMockOrder();

      renderHook(() => useWebSocket(), {
        wrapper: createWrapper(),
      });

      const messageHandler = (mockWebSocket.onMessage as Mock).mock
        .calls[0]![0];

      act(() => {
        messageHandler({
          type: 'order_status_update',
          data: mockOrder,
        });
      });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        'WebSocket message received:',
        expect.objectContaining({ type: 'order_status_update' }),
      );
    });

    it('should log when connection state changes', () => {
      renderHook(() => useWebSocket(), {
        wrapper: createWrapper(),
      });

      const stateChangeHandler = (mockWebSocket.onStateChange as Mock).mock
        .calls[0]![0];

      act(() => {
        stateChangeHandler('connected');
      });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        'WebSocket state changed:',
        'connected',
      );
    });

    it('should log error when WebSocket error occurs', () => {
      renderHook(() => useWebSocket(), {
        wrapper: createWrapper(),
      });

      const errorHandler = (mockWebSocket.onError as Mock).mock.calls[0]![0];
      const testError = new Error('Connection failed');

      act(() => {
        errorHandler(testError);
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'WebSocket error:',
        testError,
      );
    });

    it('should log when WebSocket connects', () => {
      renderHook(() => useWebSocket(), {
        wrapper: createWrapper(),
      });

      const openHandler = (mockWebSocket.onOpen as Mock).mock.calls[0]![0];

      act(() => {
        openHandler();
      });

      expect(consoleLogSpy).toHaveBeenCalledWith('WebSocket connected');
    });

    it('should log when WebSocket disconnects', () => {
      renderHook(() => useWebSocket(), {
        wrapper: createWrapper(),
      });

      const closeHandler = (mockWebSocket.onClose as Mock).mock.calls[0]![0];

      act(() => {
        closeHandler();
      });

      expect(consoleLogSpy).toHaveBeenCalledWith('WebSocket disconnected');
    });
  });

  describe('hook stability', () => {
    it('should not re-register handlers on re-render', () => {
      const { rerender } = renderHook(() => useWebSocket(), {
        wrapper: createWrapper(),
      });

      expect(mockWebSocket.onMessage).toHaveBeenCalledTimes(1);

      rerender();

      // Should still be called only once
      expect(mockWebSocket.onMessage).toHaveBeenCalledTimes(1);
    });

    it('should maintain stable method references', () => {
      const { result, rerender } = renderHook(() => useWebSocket(), {
        wrapper: createWrapper(),
      });

      const initialConnect = result.current.connect;
      const initialDisconnect = result.current.disconnect;
      const initialGetState = result.current.getState;

      rerender();

      expect(result.current.connect).toBe(initialConnect);
      expect(result.current.disconnect).toBe(initialDisconnect);
      expect(result.current.getState).toBe(initialGetState);
    });
  });
});
