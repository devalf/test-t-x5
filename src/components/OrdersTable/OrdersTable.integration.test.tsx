/**
 * Integration tests for OrdersTable — Filtering/Sorting
 *
 * These tests verify that the OrdersTable component correctly passes
 * filtering and sorting parameters to the useOrders hook and renders
 * the data accordingly.
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { OrdersTable } from './OrdersTable';

import type { OrdersResponse } from '@/features/orders';
import type { Order } from '@/models';
// eslint-disable-next-line import/order
import { asMock, createMockOrder, renderWithProviders } from '@/test/helpers';

// Mock the useOrders hook
vi.mock('@/features/orders', () => ({
  useOrders: vi.fn(),
}));

// Mock the search store
vi.mock('@/stores/searchStore', () => ({
  useSearchStore: vi.fn(),
}));

import { useOrders } from '@/features/orders';
import { useSearchStore } from '@/stores/searchStore';

// Helper to create mock orders response
const createMockOrdersResponse = (
  orders: Order[],
  pagination = {
    page: 1,
    pageSize: 10,
    totalItems: orders.length,
    totalPages: 1,
  },
): OrdersResponse => ({
  data: orders,
  pagination,
});

// Helper to create mock useOrders return value
interface UseOrdersMockConfig {
  data?: OrdersResponse;
  isLoading?: boolean;
  error?: Error | null;
}

const createUseOrdersMock = (config: UseOrdersMockConfig = {}) => ({
  data: config.data ?? undefined,
  isLoading: config.isLoading ?? false,
  error: config.error ?? null,
});

describe('OrdersTable Integration — Filtering/Sorting', () => {
  const mockOnRowClick = vi.fn();

  // Sample orders with different statuses for testing
  const sampleOrders = [
    createMockOrder({
      id: 'ORD-001',
      customerName: 'Alice Johnson',
      status: 'pending',
      totalAmount: 150.0,
      createdAt: '2024-01-10T10:00:00Z',
    }),
    createMockOrder({
      id: 'ORD-002',
      customerName: 'Bob Smith',
      status: 'shipped',
      totalAmount: 250.0,
      createdAt: '2024-01-12T14:00:00Z',
    }),
    createMockOrder({
      id: 'ORD-003',
      customerName: 'Charlie Brown',
      status: 'delivered',
      totalAmount: 75.0,
      createdAt: '2024-01-08T09:00:00Z',
    }),
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock for search store
    asMock(useSearchStore).mockReturnValue({
      debouncedSearchQuery: '',
    });

    // Default mock for useOrders
    asMock(useOrders).mockReturnValue(
      createUseOrdersMock({
        data: createMockOrdersResponse(sampleOrders),
      }),
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Sorting', () => {
    it('should call useOrders without sort params initially', () => {
      renderWithProviders(<OrdersTable />);

      expect(useOrders).toHaveBeenCalledWith(
        expect.objectContaining({
          sortBy: undefined,
          sortOrder: undefined,
        }),
      );
    });

    it('should sort by Order ID ascending on first click', async () => {
      const user = userEvent.setup();

      renderWithProviders(<OrdersTable />);

      const orderIdHeader = screen.getByRole('button', { name: /order id/i });
      await user.click(orderIdHeader);

      await waitFor(() => {
        expect(useOrders).toHaveBeenLastCalledWith(
          expect.objectContaining({
            sortBy: 'id',
            sortOrder: 'asc',
            page: 1,
          }),
        );
      });
    });

    it('should sort by Order ID descending on second click', async () => {
      const user = userEvent.setup();

      renderWithProviders(<OrdersTable />);

      const orderIdHeader = screen.getByRole('button', { name: /order id/i });

      // First click - ascending
      await user.click(orderIdHeader);
      // Second click - descending
      await user.click(orderIdHeader);

      await waitFor(() => {
        expect(useOrders).toHaveBeenLastCalledWith(
          expect.objectContaining({
            sortBy: 'id',
            sortOrder: 'desc',
            page: 1,
          }),
        );
      });
    });

    it('should reset sorting on third click', async () => {
      const user = userEvent.setup();

      renderWithProviders(<OrdersTable />);

      const orderIdHeader = screen.getByRole('button', { name: /order id/i });

      // First click - ascending
      await user.click(orderIdHeader);
      // Second click - descending
      await user.click(orderIdHeader);
      // Third click - reset
      await user.click(orderIdHeader);

      await waitFor(() => {
        expect(useOrders).toHaveBeenLastCalledWith(
          expect.objectContaining({
            sortBy: undefined,
            sortOrder: undefined,
            page: 1,
          }),
        );
      });
    });

    it('should sort by Customer Name', async () => {
      const user = userEvent.setup();

      renderWithProviders(<OrdersTable />);

      const customerNameHeader = screen.getByRole('button', {
        name: /customer name/i,
      });
      await user.click(customerNameHeader);

      await waitFor(() => {
        expect(useOrders).toHaveBeenLastCalledWith(
          expect.objectContaining({
            sortBy: 'customerName',
            sortOrder: 'asc',
          }),
        );
      });
    });

    it('should sort by Status', async () => {
      const user = userEvent.setup();

      renderWithProviders(<OrdersTable />);

      const statusHeader = screen.getByRole('button', { name: /status/i });
      await user.click(statusHeader);

      await waitFor(() => {
        expect(useOrders).toHaveBeenLastCalledWith(
          expect.objectContaining({
            sortBy: 'status',
            sortOrder: 'asc',
          }),
        );
      });
    });

    it('should sort by Total Amount', async () => {
      const user = userEvent.setup();

      renderWithProviders(<OrdersTable />);

      const totalAmountHeader = screen.getByRole('button', {
        name: /total amount/i,
      });
      await user.click(totalAmountHeader);

      await waitFor(() => {
        expect(useOrders).toHaveBeenLastCalledWith(
          expect.objectContaining({
            sortBy: 'totalAmount',
            sortOrder: 'asc',
          }),
        );
      });
    });

    it('should sort by Created Date', async () => {
      const user = userEvent.setup();

      renderWithProviders(<OrdersTable />);

      const createdDateHeader = screen.getByRole('button', {
        name: /created date/i,
      });
      await user.click(createdDateHeader);

      await waitFor(() => {
        expect(useOrders).toHaveBeenLastCalledWith(
          expect.objectContaining({
            sortBy: 'createdAt',
            sortOrder: 'asc',
          }),
        );
      });
    });

    it('should switch to new column when sorting by a different column', async () => {
      const user = userEvent.setup();

      renderWithProviders(<OrdersTable />);

      // Sort by Order ID first
      const orderIdHeader = screen.getByRole('button', { name: /order id/i });
      await user.click(orderIdHeader);

      await waitFor(() => {
        expect(useOrders).toHaveBeenLastCalledWith(
          expect.objectContaining({
            sortBy: 'id',
            sortOrder: 'asc',
          }),
        );
      });

      // Now sort by Customer Name
      const customerNameHeader = screen.getByRole('button', {
        name: /customer name/i,
      });
      await user.click(customerNameHeader);

      await waitFor(() => {
        expect(useOrders).toHaveBeenLastCalledWith(
          expect.objectContaining({
            sortBy: 'customerName',
            sortOrder: 'asc',
          }),
        );
      });
    });

    it('should reset page to 1 when sorting', async () => {
      const user = userEvent.setup();

      // Mock with multiple pages
      asMock(useOrders).mockReturnValue(
        createUseOrdersMock({
          data: createMockOrdersResponse(sampleOrders, {
            page: 2,
            pageSize: 10,
            totalItems: 30,
            totalPages: 3,
          }),
        }),
      );

      renderWithProviders(<OrdersTable />);

      const orderIdHeader = screen.getByRole('button', { name: /order id/i });
      await user.click(orderIdHeader);

      await waitFor(() => {
        expect(useOrders).toHaveBeenLastCalledWith(
          expect.objectContaining({
            page: 1,
            sortBy: 'id',
          }),
        );
      });
    });

    it('should display sort indicator on active column', async () => {
      const user = userEvent.setup();

      renderWithProviders(<OrdersTable />);

      const orderIdHeader = screen.getByRole('button', { name: /order id/i });
      await user.click(orderIdHeader);

      // The TableCell containing the sort label should have aria-sort
      const headerCell = orderIdHeader.closest('th');
      expect(headerCell).toHaveAttribute('aria-sort', 'ascending');
    });
  });

  describe('Filtering by Status', () => {
    it('should pass statusFilter to useOrders', () => {
      renderWithProviders(<OrdersTable statusFilter="shipped" />);

      expect(useOrders).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'shipped',
        }),
      );
    });

    it('should pass undefined status when statusFilter is empty', () => {
      renderWithProviders(<OrdersTable statusFilter="" />);

      expect(useOrders).toHaveBeenCalledWith(
        expect.objectContaining({
          status: undefined,
        }),
      );
    });

    it('should reset page to 1 when statusFilter changes', () => {
      const { rerender } = renderWithProviders(
        <OrdersTable statusFilter="pending" />,
      );

      // Change the status filter
      rerender(<OrdersTable statusFilter="shipped" />);

      // The component should reset page to 1 via useEffect
      expect(useOrders).toHaveBeenLastCalledWith(
        expect.objectContaining({
          page: 1,
          status: 'shipped',
        }),
      );
    });

    it('should filter and display only matching status orders', () => {
      // Mock response with only shipped orders
      const shippedOrders = [
        createMockOrder({
          id: 'ORD-002',
          customerName: 'Bob Smith',
          status: 'shipped',
        }),
      ];

      asMock(useOrders).mockReturnValue(
        createUseOrdersMock({
          data: createMockOrdersResponse(shippedOrders),
        }),
      );

      renderWithProviders(<OrdersTable statusFilter="shipped" />);

      // Should display the shipped order
      expect(screen.getByText('ORD-002')).toBeInTheDocument();
      expect(screen.getByText('Bob Smith')).toBeInTheDocument();

      // Should only have one data row (plus header)
      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(2); // 1 header + 1 data row
    });
  });

  describe('Filtering by Search', () => {
    it('should pass search query from store to useOrders', () => {
      asMock(useSearchStore).mockReturnValue({
        debouncedSearchQuery: 'alice',
      });

      renderWithProviders(<OrdersTable />);

      expect(useOrders).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'alice',
        }),
      );
    });

    it('should pass undefined search when query is empty', () => {
      asMock(useSearchStore).mockReturnValue({
        debouncedSearchQuery: '',
      });

      renderWithProviders(<OrdersTable />);

      expect(useOrders).toHaveBeenCalledWith(
        expect.objectContaining({
          search: undefined,
        }),
      );
    });

    it('should reset page to 1 when search query changes', () => {
      const { rerender } = renderWithProviders(<OrdersTable />);

      // Simulate search query change
      asMock(useSearchStore).mockReturnValue({
        debouncedSearchQuery: 'bob',
      });

      rerender(<OrdersTable />);

      // The component should reset page via useEffect
      expect(useOrders).toHaveBeenLastCalledWith(
        expect.objectContaining({
          page: 1,
          search: 'bob',
        }),
      );
    });

    it('should display filtered results based on search', () => {
      asMock(useSearchStore).mockReturnValue({
        debouncedSearchQuery: 'charlie',
      });

      const searchResults = [
        createMockOrder({
          id: 'ORD-003',
          customerName: 'Charlie Brown',
          status: 'delivered',
        }),
      ];

      asMock(useOrders).mockReturnValue(
        createUseOrdersMock({
          data: createMockOrdersResponse(searchResults),
        }),
      );

      renderWithProviders(<OrdersTable />);

      expect(screen.getByText('ORD-003')).toBeInTheDocument();
      expect(screen.getByText('Charlie Brown')).toBeInTheDocument();
    });
  });

  describe('Combined Filtering and Sorting', () => {
    it('should apply both status filter and sort together', async () => {
      const user = userEvent.setup();

      renderWithProviders(<OrdersTable statusFilter="pending" />);

      const totalAmountHeader = screen.getByRole('button', {
        name: /total amount/i,
      });
      await user.click(totalAmountHeader);

      await waitFor(() => {
        expect(useOrders).toHaveBeenLastCalledWith(
          expect.objectContaining({
            status: 'pending',
            sortBy: 'totalAmount',
            sortOrder: 'asc',
          }),
        );
      });
    });

    it('should apply search, status filter, and sort together', async () => {
      const user = userEvent.setup();

      asMock(useSearchStore).mockReturnValue({
        debouncedSearchQuery: 'test',
      });

      renderWithProviders(<OrdersTable statusFilter="shipped" />);

      const customerNameHeader = screen.getByRole('button', {
        name: /customer name/i,
      });
      await user.click(customerNameHeader);

      await waitFor(() => {
        expect(useOrders).toHaveBeenLastCalledWith(
          expect.objectContaining({
            search: 'test',
            status: 'shipped',
            sortBy: 'customerName',
            sortOrder: 'asc',
            page: 1,
          }),
        );
      });
    });
  });

  describe('Pagination with Filtering/Sorting', () => {
    it('should maintain sort when changing page size', async () => {
      const user = userEvent.setup();

      asMock(useOrders).mockReturnValue(
        createUseOrdersMock({
          data: createMockOrdersResponse(sampleOrders, {
            page: 1,
            pageSize: 10,
            totalItems: 50,
            totalPages: 5,
          }),
        }),
      );

      renderWithProviders(<OrdersTable />);

      // First, apply sorting
      const orderIdHeader = screen.getByRole('button', { name: /order id/i });
      await user.click(orderIdHeader);

      await waitFor(() => {
        expect(useOrders).toHaveBeenLastCalledWith(
          expect.objectContaining({
            sortBy: 'id',
            sortOrder: 'asc',
          }),
        );
      });

      // Change page size
      const pageSizeSelect = screen.getByRole('combobox');
      await user.click(pageSizeSelect);

      const option25 = await screen.findByRole('option', { name: '25' });
      await user.click(option25);

      await waitFor(() => {
        expect(useOrders).toHaveBeenLastCalledWith(
          expect.objectContaining({
            pageSize: 25,
            page: 1,
            sortBy: 'id',
            sortOrder: 'asc',
          }),
        );
      });
    });

    it('should maintain filter when navigating pages', async () => {
      const user = userEvent.setup();

      asMock(useOrders).mockReturnValue(
        createUseOrdersMock({
          data: createMockOrdersResponse(sampleOrders, {
            page: 1,
            pageSize: 10,
            totalItems: 30,
            totalPages: 3,
          }),
        }),
      );

      renderWithProviders(<OrdersTable statusFilter="pending" />);

      // Navigate to page 2
      const page2Button = screen.getByRole('button', { name: 'Go to page 2' });
      await user.click(page2Button);

      await waitFor(() => {
        expect(useOrders).toHaveBeenLastCalledWith(
          expect.objectContaining({
            page: 2,
            status: 'pending',
          }),
        );
      });
    });
  });

  describe('Empty and Loading States', () => {
    it('should display loading spinner when loading', () => {
      asMock(useOrders).mockReturnValue(
        createUseOrdersMock({
          isLoading: true,
        }),
      );

      renderWithProviders(<OrdersTable />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should display "No orders found" when data is empty', () => {
      asMock(useOrders).mockReturnValue(
        createUseOrdersMock({
          data: createMockOrdersResponse([]),
        }),
      );

      renderWithProviders(<OrdersTable />);

      expect(screen.getByText('No orders found')).toBeInTheDocument();
    });

    it('should display error message when there is an error', () => {
      asMock(useOrders).mockReturnValue(
        createUseOrdersMock({
          error: new Error('Network error'),
        }),
      );

      renderWithProviders(<OrdersTable />);

      expect(
        screen.getByText('Failed to load orders: Network error'),
      ).toBeInTheDocument();
    });
  });

  describe('Row Interactions', () => {
    it('should call onRowClick with order ID when row is clicked', async () => {
      const user = userEvent.setup();

      renderWithProviders(<OrdersTable onRowClick={mockOnRowClick} />);

      const row = screen.getByText('ORD-001').closest('tr');
      await user.click(row!);

      expect(mockOnRowClick).toHaveBeenCalledWith('ORD-001');
    });

    it('should have pointer cursor when onRowClick is provided', () => {
      renderWithProviders(<OrdersTable onRowClick={mockOnRowClick} />);

      const row = screen.getByText('ORD-001').closest('tr');
      expect(row).toHaveStyle({ cursor: 'pointer' });
    });

    it('should have default cursor when onRowClick is not provided', () => {
      renderWithProviders(<OrdersTable />);

      const row = screen.getByText('ORD-001').closest('tr');
      expect(row).toHaveStyle({ cursor: 'default' });
    });
  });
});
