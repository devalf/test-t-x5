import type { Order, OrderItem } from '@/models';

export const createMockOrderItem = (
  overrides: Partial<OrderItem> = {},
): OrderItem => ({
  id: 'item-1',
  productName: 'Test Product',
  quantity: 1,
  price: 25.0,
  ...overrides,
});

export const createMockOrder = (overrides: Partial<Order> = {}): Order => ({
  id: 'ORD-001',
  customerName: 'John Doe',
  customerEmail: 'john.doe@example.com',
  status: 'pending',
  items: [
    createMockOrderItem({
      id: 'item-1',
      productName: 'Product A',
      quantity: 2,
    }),
    createMockOrderItem({
      id: 'item-2',
      productName: 'Product B',
      quantity: 1,
      price: 50.0,
    }),
  ],
  totalAmount: 100.0,
  currency: 'USD',
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-15T12:00:00Z',
  shippingAddress: {
    street: '123 Main St',
    city: 'New York',
    country: 'USA',
    postalCode: '10001',
  },
  ...overrides,
});
