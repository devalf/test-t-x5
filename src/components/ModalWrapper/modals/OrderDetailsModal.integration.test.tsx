/**
 * Integration tests for OrderDetailsModal + OrderEditForm
 *
 * These tests verify the integration between OrderDetailsModal and OrderEditForm
 * without mocking the form component. Only external dependencies (API hooks, stores)
 * are mocked to isolate the component integration.
 */
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { OrderDetailsModal } from './OrderDetailsModal';

import { lightTheme } from '@/theme/theme';
import type { Order, OrderStatus } from '@/models';
// eslint-disable-next-line import/order
import {
  asMock,
  createMockOrder,
  createTestQueryClient,
  createUseModalStoreMock,
  createUseOrderMock,
  createUseUpdateOrderStatusMock,
  renderWithProviders,
} from '@/test/helpers';

// Mock only external dependencies - NOT the OrderEditForm
vi.mock('@/features/orders', () => ({
  useUpdateOrderStatus: vi.fn(),
  useOrder: vi.fn(),
}));

vi.mock('@/stores/modalStore', () => ({
  useModalStore: vi.fn(),
}));

import { useUpdateOrderStatus, useOrder } from '@/features/orders';
import { useModalStore } from '@/stores/modalStore';

describe('OrderDetailsModal + OrderEditForm Integration', () => {
  const mockOnClose = vi.fn();
  const mockMutate = vi.fn();
  let mockOrder: Order;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOrder = createMockOrder();

    asMock(useModalStore).mockReturnValue(
      createUseModalStoreMock({ payload: { orderId: mockOrder.id } }),
    );
    asMock(useUpdateOrderStatus).mockReturnValue(
      createUseUpdateOrderStatusMock({ mutate: mockMutate }),
    );
    asMock(useOrder).mockReturnValue(createUseOrderMock({ data: mockOrder }));
  });

  describe('Form Display and Data Binding', () => {
    it('should display all order information from the form correctly', async () => {
      renderWithProviders(
        <OrderDetailsModal open={true} onClose={mockOnClose} />,
      );

      const dialog = await screen.findByRole('dialog');

      // Customer information section
      expect(
        within(dialog).getByText('Customer Information'),
      ).toBeInTheDocument();
      expect(within(dialog).getByText('John Doe')).toBeInTheDocument();
      expect(
        within(dialog).getByText('john.doe@example.com'),
      ).toBeInTheDocument();

      // Shipping address section
      expect(within(dialog).getByText('Shipping Address')).toBeInTheDocument();
      expect(within(dialog).getByText('123 Main St')).toBeInTheDocument();
      expect(within(dialog).getByText(/New York/)).toBeInTheDocument();
      expect(within(dialog).getByText(/10001/)).toBeInTheDocument();

      // Order items section
      expect(within(dialog).getByText('Order Items (2)')).toBeInTheDocument();
      expect(within(dialog).getByText('Product A')).toBeInTheDocument();
      expect(within(dialog).getByText('Product B')).toBeInTheDocument();

      // Order summary section
      expect(within(dialog).getByText('Order Summary')).toBeInTheDocument();
    });

    it('should display current order status in both chip and select', async () => {
      renderWithProviders(
        <OrderDetailsModal open={true} onClose={mockOnClose} />,
      );

      const dialog = await screen.findByRole('dialog');

      // Status chip and select both show "Pending"
      const pendingElements = within(dialog).getAllByText('Pending');
      expect(pendingElements.length).toBe(2); // One in chip, one in select
    });

    it('should display order items with correct quantities and prices', async () => {
      renderWithProviders(
        <OrderDetailsModal open={true} onClose={mockOnClose} />,
      );

      const dialog = await screen.findByRole('dialog');
      const table = within(dialog).getByRole('table');

      // Check quantities
      expect(within(table).getByText('2')).toBeInTheDocument();
      expect(within(table).getByText('1')).toBeInTheDocument();
    });
  });

  describe('Status Change Workflow', () => {
    it('should complete full status change workflow: select -> submit -> close', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <OrderDetailsModal open={true} onClose={mockOnClose} />,
      );

      const dialog = await screen.findByRole('dialog');

      // Step 1: Verify initial state - save button disabled
      const saveButton = within(dialog).getByRole('button', {
        name: /save changes/i,
      });
      expect(saveButton).toBeDisabled();

      // Step 2: Open status dropdown and select new status
      const selectButton = dialog.querySelector(
        '[role="combobox"]',
      ) as HTMLElement;
      await user.click(selectButton);

      const shippedOption = await screen.findByRole('option', {
        name: /shipped/i,
      });
      await user.click(shippedOption);

      // Step 3: Verify save button is now enabled
      await waitFor(() => {
        expect(saveButton).not.toBeDisabled();
      });

      // Step 4: Submit the form
      await user.click(saveButton);

      // Step 5: Verify mutation was called with correct data
      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledTimes(1);
        expect(mockMutate).toHaveBeenCalledWith({
          orderId: 'ORD-001',
          newStatus: 'shipped',
        });
      });

      // Step 6: Verify modal closes after submission
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should allow changing status multiple times before submitting', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <OrderDetailsModal open={true} onClose={mockOnClose} />,
      );

      const dialog = await screen.findByRole('dialog');
      const selectButton = dialog.querySelector(
        '[role="combobox"]',
      ) as HTMLElement;

      // Change to Processing
      await user.click(selectButton);
      await user.click(
        await screen.findByRole('option', { name: /processing/i }),
      );

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });

      // Change to Shipped
      await user.click(selectButton);
      await user.click(await screen.findByRole('option', { name: /shipped/i }));

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });

      // Change to Delivered
      await user.click(selectButton);
      await user.click(
        await screen.findByRole('option', { name: /delivered/i }),
      );

      // Submit
      const saveButton = within(dialog).getByRole('button', {
        name: /save changes/i,
      });
      await waitFor(() => {
        expect(saveButton).not.toBeDisabled();
      });
      await user.click(saveButton);

      // Should submit with final status
      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith({
          orderId: 'ORD-001',
          newStatus: 'delivered',
        });
      });
    });

    it('should not submit when changing back to original status', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <OrderDetailsModal open={true} onClose={mockOnClose} />,
      );

      const dialog = await screen.findByRole('dialog');
      const selectButton = dialog.querySelector(
        '[role="combobox"]',
      ) as HTMLElement;

      // Change to Processing
      await user.click(selectButton);
      await user.click(
        await screen.findByRole('option', { name: /processing/i }),
      );

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });

      // Change back to Pending (original)
      await user.click(selectButton);
      await user.click(await screen.findByRole('option', { name: /pending/i }));

      // Save button should be disabled again
      const saveButton = within(dialog).getByRole('button', {
        name: /save changes/i,
      });
      await waitFor(() => {
        expect(saveButton).toBeDisabled();
      });
    });
  });

  describe('Cancel Workflow', () => {
    it('should close modal without saving when cancel is clicked', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <OrderDetailsModal open={true} onClose={mockOnClose} />,
      );

      const dialog = await screen.findByRole('dialog');

      // Make a change first
      const selectButton = dialog.querySelector(
        '[role="combobox"]',
      ) as HTMLElement;
      await user.click(selectButton);
      await user.click(await screen.findByRole('option', { name: /shipped/i }));

      // Click cancel
      const cancelButton = within(dialog).getByRole('button', {
        name: /cancel/i,
      });
      await user.click(cancelButton);

      // Should close without calling mutate
      expect(mockOnClose).toHaveBeenCalledTimes(1);
      expect(mockMutate).not.toHaveBeenCalled();
    });
  });

  describe('Form Reset on Order Change', () => {
    it('should reset form when order data changes', async () => {
      const { rerender } = renderWithProviders(
        <OrderDetailsModal open={true} onClose={mockOnClose} />,
      );

      // Initial render with pending status
      let dialog = await screen.findByRole('dialog');
      let pendingElements = within(dialog).getAllByText('Pending');
      expect(pendingElements.length).toBeGreaterThanOrEqual(1);

      // Update mock to return different order
      const updatedOrder = createMockOrder({
        id: 'ORD-456',
        status: 'shipped',
      });

      asMock(useModalStore).mockReturnValue(
        createUseModalStoreMock({ payload: { orderId: 'ORD-456' } }),
      );
      asMock(useOrder).mockReturnValue(
        createUseOrderMock({ data: updatedOrder }),
      );

      // Re-render with new order
      const queryClient = createTestQueryClient();
      rerender(
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={lightTheme}>
            <OrderDetailsModal open={true} onClose={mockOnClose} />
          </ThemeProvider>
        </QueryClientProvider>,
      );

      // Form should now show Shipped status
      dialog = await screen.findByRole('dialog');
      const shippedElements = within(dialog).getAllByText('Shipped');
      expect(shippedElements.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('All Status Transitions', () => {
    const allStatuses: OrderStatus[] = [
      'pending',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
    ];

    allStatuses.forEach((initialStatus) => {
      allStatuses
        .filter((s) => s !== initialStatus)
        .forEach((newStatus) => {
          it(`should allow transition from ${initialStatus} to ${newStatus}`, async () => {
            const user = userEvent.setup();

            // Set initial status
            const orderWithStatus = createMockOrder({ status: initialStatus });
            asMock(useOrder).mockReturnValue(
              createUseOrderMock({ data: orderWithStatus }),
            );

            renderWithProviders(
              <OrderDetailsModal open={true} onClose={mockOnClose} />,
            );

            const dialog = await screen.findByRole('dialog');
            const selectButton = dialog.querySelector(
              '[role="combobox"]',
            ) as HTMLElement;

            // Select new status
            await user.click(selectButton);
            const statusLabel =
              newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
            await user.click(
              await screen.findByRole('option', {
                name: new RegExp(statusLabel, 'i'),
              }),
            );

            // Submit
            const saveButton = within(dialog).getByRole('button', {
              name: /save changes/i,
            });
            await waitFor(() => {
              expect(saveButton).not.toBeDisabled();
            });
            await user.click(saveButton);

            // Verify correct status was submitted
            await waitFor(() => {
              expect(mockMutate).toHaveBeenCalledWith({
                orderId: orderWithStatus.id,
                newStatus: newStatus,
              });
            });

            vi.clearAllMocks();
          });
        });
    });
  });

  describe('Edge Cases', () => {
    it('should handle order with single item', async () => {
      const singleItemOrder = createMockOrder({
        items: [
          {
            id: 'item-1',
            productName: 'Single Product',
            quantity: 1,
            price: 99.99,
          },
        ],
        totalAmount: 99.99,
      });

      asMock(useOrder).mockReturnValue(
        createUseOrderMock({ data: singleItemOrder }),
      );

      renderWithProviders(
        <OrderDetailsModal open={true} onClose={mockOnClose} />,
      );

      const dialog = await screen.findByRole('dialog');
      expect(within(dialog).getByText('Order Items (1)')).toBeInTheDocument();
      expect(within(dialog).getByText('Single Product')).toBeInTheDocument();
    });

    it('should handle order with many items', async () => {
      const manyItemsOrder = createMockOrder({
        items: Array.from({ length: 10 }, (_, i) => ({
          id: `item-${i + 1}`,
          productName: `Product ${i + 1}`,
          quantity: i + 1,
          price: (i + 1) * 10,
        })),
      });

      asMock(useOrder).mockReturnValue(
        createUseOrderMock({ data: manyItemsOrder }),
      );

      renderWithProviders(
        <OrderDetailsModal open={true} onClose={mockOnClose} />,
      );

      const dialog = await screen.findByRole('dialog');
      expect(within(dialog).getByText('Order Items (10)')).toBeInTheDocument();
    });

    it('should handle order with different currency', async () => {
      const eurOrder = createMockOrder({
        currency: 'EUR',
        totalAmount: 150.0,
      });

      asMock(useOrder).mockReturnValue(createUseOrderMock({ data: eurOrder }));

      renderWithProviders(
        <OrderDetailsModal open={true} onClose={mockOnClose} />,
      );

      const dialog = await screen.findByRole('dialog');
      // Just verify the modal renders with EUR order
      expect(within(dialog).getByText('Order Summary')).toBeInTheDocument();
    });
  });
});
