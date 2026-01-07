/**
 * Custom hook for managing WebSocket connections and real-time order updates
 */

import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import {
  mockWebSocket,
  WebSocketMessage,
  WebSocketState,
  UnsubscribeFn,
} from '../services/mockWebSocket';
import type { OrdersResponse } from '../features/orders/useOrders';

export const useWebSocket = () => {
  const queryClient = useQueryClient();
  const [connectionState, setConnectionState] = useState<WebSocketState>(
    mockWebSocket.getState(),
  );
  const unsubscribersRef = useRef<UnsubscribeFn[]>([]);

  // Set up event listeners and connection
  useEffect(() => {
    // Handle incoming WebSocket messages
    const handleMessage = (message: WebSocketMessage) => {
      console.log('WebSocket message received:', message);

      if (message.type === 'order_status_update') {
        const updatedOrder = message.data;

        /**
         * The cache is updated instead of refetching the proper endpoint due to MOCK data.
         * It will return the proper data since we simulate WS messages by updating separately.
         */

        // Update specific order in cache if it exists
        queryClient.setQueryData(['order', updatedOrder.id], updatedOrder);

        // Update the order in all cached orders lists
        queryClient.setQueriesData<OrdersResponse>(
          { queryKey: ['orders'] },
          (oldData) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              data: oldData.data.map((order) =>
                order.id === updatedOrder.id ? updatedOrder : order,
              ),
            };
          },
        );
      }
    };

    // Handle connection state changes
    const handleStateChange = (state: WebSocketState) => {
      console.log('WebSocket state changed:', state);
      setConnectionState(state);
    };

    // Handle connection errors
    const handleError = (error: Error) => {
      console.error('WebSocket error:', error);
    };

    // Handle connection open
    const handleOpen = () => {
      console.log('WebSocket connected');
    };

    // Handle connection close
    const handleClose = () => {
      console.log('WebSocket disconnected');
    };

    // Register event handlers and store unsubscribe functions
    unsubscribersRef.current = [
      mockWebSocket.onMessage(handleMessage),
      mockWebSocket.onStateChange(handleStateChange),
      mockWebSocket.onError(handleError),
      mockWebSocket.onOpen(handleOpen),
      mockWebSocket.onClose(handleClose),
    ];

    // Auto-connect on mount
    mockWebSocket.connect();

    // Cleanup on unmount
    return () => {
      // Unsubscribe all handlers
      unsubscribersRef.current.forEach((unsubscribe) => unsubscribe());
      unsubscribersRef.current = [];
      mockWebSocket.disconnect();
    };
  }, [queryClient]);

  return {
    connect: mockWebSocket.connect,
    disconnect: mockWebSocket.disconnect,
    getState: mockWebSocket.getState,
    connectionState,
    isConnected: connectionState === 'connected',
  };
};
