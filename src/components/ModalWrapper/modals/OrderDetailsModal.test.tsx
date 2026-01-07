/**
 * Unit tests for OrderDetailsModal
 *
 * These tests focus on component-specific behavior like null states,
 * loading states, and payload handling. Integration tests cover
 * the full form interaction workflow.
 */
import { screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { OrderDetailsModal } from './OrderDetailsModal';

import type { Order } from '@/models';
// eslint-disable-next-line import/order
import {
  asMock,
  createMockOrder,
  createUseModalStoreMock,
  createUseOrderMock,
  createUseUpdateOrderStatusMock,
  renderWithProviders,
} from '@/test/helpers';

// Mock the hooks
vi.mock('@/features/orders', () => ({
  useUpdateOrderStatus: vi.fn(),
  useOrder: vi.fn(),
}));

vi.mock('@/stores/modalStore', () => ({
  useModalStore: vi.fn(),
}));

// Import mocked modules
import { useUpdateOrderStatus, useOrder } from '@/features/orders';
import { useModalStore } from '@/stores/modalStore';

describe('OrderDetailsModal', () => {
  const mockOnClose = vi.fn();
  const mockMutate = vi.fn();
  const mockOrder = createMockOrder();

  beforeEach(() => {
    vi.clearAllMocks();

    asMock(useModalStore).mockReturnValue(createUseModalStoreMock());
    asMock(useUpdateOrderStatus).mockReturnValue(
      createUseUpdateOrderStatusMock({ mutate: mockMutate }),
    );
    asMock(useOrder).mockReturnValue(createUseOrderMock({ data: mockOrder }));
  });

  describe('Loading and Null States', () => {
    it('should return null when order is not loaded', () => {
      asMock(useOrder).mockReturnValue(createUseOrderMock({ isLoading: true }));

      const { container } = renderWithProviders(
        <OrderDetailsModal open={true} onClose={mockOnClose} />,
      );

      expect(container.firstChild).toBeNull();
    });

    it('should return null when order fetch returns undefined', () => {
      asMock(useOrder).mockReturnValue(createUseOrderMock());

      const { container } = renderWithProviders(
        <OrderDetailsModal open={true} onClose={mockOnClose} />,
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Modal Behavior', () => {
    it('should not render dialog content when modal is closed', () => {
      renderWithProviders(
        <OrderDetailsModal open={false} onClose={mockOnClose} />,
      );

      expect(
        screen.queryByText(/Order Details: ORD-001/i),
      ).not.toBeInTheDocument();
    });

    it('should render dialog when open is true', () => {
      renderWithProviders(
        <OrderDetailsModal open={true} onClose={mockOnClose} />,
      );

      expect(screen.getByText(/Order Details: ORD-001/i)).toBeInTheDocument();
    });
  });

  describe('Different Order Statuses', () => {
    const statusTestCases: Array<{ status: Order['status']; label: string }> = [
      { status: 'pending', label: 'Pending' },
      { status: 'processing', label: 'Processing' },
      { status: 'shipped', label: 'Shipped' },
      { status: 'delivered', label: 'Delivered' },
      { status: 'cancelled', label: 'Cancelled' },
    ];

    statusTestCases.forEach(({ status, label }) => {
      it(`should display ${label} status correctly`, () => {
        asMock(useOrder).mockReturnValue(
          createUseOrderMock({ data: createMockOrder({ status }) }),
        );

        renderWithProviders(
          <OrderDetailsModal open={true} onClose={mockOnClose} />,
        );

        // Status appears in both chip and select - verify at least one exists
        const statusElements = screen.getAllByText(label);
        expect(statusElements.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('Payload Handling', () => {
    it('should handle missing orderId in payload gracefully', () => {
      asMock(useModalStore).mockReturnValue(
        createUseModalStoreMock({ payload: {} }),
      );
      asMock(useOrder).mockReturnValue(createUseOrderMock());

      const { container } = renderWithProviders(
        <OrderDetailsModal open={true} onClose={mockOnClose} />,
      );

      expect(container.firstChild).toBeNull();
    });

    it('should handle null payload gracefully', () => {
      asMock(useModalStore).mockReturnValue(
        createUseModalStoreMock({ payload: null }),
      );
      asMock(useOrder).mockReturnValue(createUseOrderMock());

      const { container } = renderWithProviders(
        <OrderDetailsModal open={true} onClose={mockOnClose} />,
      );

      expect(container.firstChild).toBeNull();
    });

    it('should handle undefined payload gracefully', () => {
      asMock(useModalStore).mockReturnValue({ payload: undefined });
      asMock(useOrder).mockReturnValue(createUseOrderMock());

      const { container } = renderWithProviders(
        <OrderDetailsModal open={true} onClose={mockOnClose} />,
      );

      expect(container.firstChild).toBeNull();
    });
  });
});
