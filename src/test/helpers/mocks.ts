import { Mock } from 'vitest';

import type { Order } from '@/models';

/**
 * Type-safe mock function getter to avoid `as unknown as Mock` boilerplate
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const asMock = <T extends (...args: any[]) => any>(fn: T): Mock =>
  fn as unknown as Mock;

/**
 * Configuration for useOrder hook mock
 */
export interface UseOrderMockConfig {
  data?: Order;
  isLoading?: boolean;
  error?: Error | null;
}

/**
 * Creates a mock return value for useOrder hook
 */
export const createUseOrderMock = (config: UseOrderMockConfig = {}) => ({
  data: config.data ?? undefined,
  isLoading: config.isLoading ?? false,
  error: config.error ?? null,
});

/**
 * Configuration for useModalStore mock
 */
export interface UseModalStoreMockConfig {
  payload?: { orderId?: string } | null;
}

/**
 * Creates a mock return value for useModalStore
 */
export const createUseModalStoreMock = (
  config: UseModalStoreMockConfig = {},
) => ({
  payload: config.payload ?? { orderId: 'ORD-001' },
});

/**
 * Configuration for useUpdateOrderStatus mock
 */
export interface UseUpdateOrderStatusMockConfig {
  mutate?: Mock;
  isLoading?: boolean;
}

/**
 * Creates a mock return value for useUpdateOrderStatus hook
 */
export const createUseUpdateOrderStatusMock = (
  config: UseUpdateOrderStatusMockConfig = {},
) => ({
  mutate: config.mutate ?? ((() => {}) as unknown as Mock),
  isLoading: config.isLoading ?? false,
});
