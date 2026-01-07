import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { ORDER_QUERY_KEY, ORDERS_QUERY_KEY } from './queryKeys';

import type { Order, OrderStatus } from '@/models';

export const useOrder = (orderId: string) => {
  return useQuery<Order>({
    queryKey: [ORDER_QUERY_KEY, orderId],
    queryFn: async () => {
      const response = await fetch(`/api/orders/${orderId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch order');
      }

      return response.json();
    },
    enabled: !!orderId,
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      newStatus,
    }: {
      orderId: string;
      newStatus: OrderStatus;
    }) => {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate orders queries to refetch data
      queryClient.invalidateQueries({ queryKey: [ORDERS_QUERY_KEY] });
    },
  });
};
