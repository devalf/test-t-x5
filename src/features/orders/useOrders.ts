import { useQuery } from '@tanstack/react-query';

import { ORDERS_QUERY_KEY } from './queryKeys';

import type { Order } from '@/models';

export interface OrdersResponse {
  data: Order[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface UseOrdersOptions {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
  search?: string;
}

export const useOrders = (options: UseOrdersOptions = {}) => {
  const {
    page = 1,
    pageSize = 10,
    sortBy,
    sortOrder,
    status,
    search,
  } = options;

  return useQuery<OrdersResponse>({
    queryKey: [
      ORDERS_QUERY_KEY,
      page,
      pageSize,
      sortBy,
      sortOrder,
      status,
      search,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      if (sortBy) {
        params.append('sortBy', sortBy);
        params.append('sortOrder', sortOrder || 'asc');
      }

      if (status) {
        params.append('status', status);
      }

      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`/api/orders?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      return response.json();
    },
  });
};
