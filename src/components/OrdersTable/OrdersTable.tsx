import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Pagination,
  FormControl,
  Select,
  MenuItem,
  TableSortLabel,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useState, ChangeEvent, useEffect } from 'react';
import { SelectChangeEvent } from '@mui/material';

import { useOrders } from '@/features/orders';
import { useSearchStore } from '@/stores/searchStore';
import { formatDate, formatCurrency, capitalize } from '@/utils';

const getStatusBgColor = (status: string): string => {
  const statusColorMap: Record<string, string> = {
    pending: 'pending.light',
    delivered: 'success.light',
    shipped: 'info.light',
    processing: 'warning.light',
    cancelled: 'error.light',
  };

  return statusColorMap[status] ?? 'pending.light';
};

const getStatusTextColor = (status: string): string => {
  return status === 'cancelled' ? 'error.contrastText' : 'text.primary';
};

interface OrdersTableProps {
  statusFilter?: string;
  onRowClick?: (orderId: string) => void;
}

export const OrdersTable = ({
  statusFilter = '',
  onRowClick,
}: OrdersTableProps) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Use Zustand store for search state (read-only)
  const { debouncedSearchQuery } = useSearchStore();
  const { data, isLoading, error } = useOrders({
    page,
    pageSize,
    sortBy: sortBy || undefined,
    sortOrder: sortBy ? sortOrder : undefined,
    status: statusFilter || undefined,
    search: debouncedSearchQuery || undefined,
  });

  // Reset to first page when search query or status filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchQuery, statusFilter]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Failed to load orders: {error.message}
      </Alert>
    );
  }

  if (!data?.data?.length) {
    return (
      <Typography variant="body1" color="text.secondary" align="center" p={4}>
        No orders found
      </Typography>
    );
  }

  const handlePageChange = (_: ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handlePageSizeChange = (event: SelectChangeEvent<number>) => {
    const newPageSize = event.target.value as number;
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when changing page size
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      // If already sorting by this field, cycle through states
      if (sortOrder === 'asc') {
        setSortOrder('desc');
      } else if (sortOrder === 'desc') {
        // Third click resets sorting
        setSortBy('');
        setSortOrder('asc');
      }
    } else {
      // If sorting by different field, start with asc
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1); // Reset to first page when sorting
  };

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sortDirection={sortBy === 'id' ? sortOrder : false}>
                <TableSortLabel
                  active={sortBy === 'id'}
                  direction={sortBy === 'id' ? sortOrder : 'asc'}
                  onClick={() => handleSort('id')}
                >
                  Order ID
                </TableSortLabel>
              </TableCell>
              <TableCell
                sortDirection={sortBy === 'customerName' ? sortOrder : false}
              >
                <TableSortLabel
                  active={sortBy === 'customerName'}
                  direction={sortBy === 'customerName' ? sortOrder : 'asc'}
                  onClick={() => handleSort('customerName')}
                >
                  Customer Name
                </TableSortLabel>
              </TableCell>
              <TableCell
                sortDirection={sortBy === 'status' ? sortOrder : false}
              >
                <TableSortLabel
                  active={sortBy === 'status'}
                  direction={sortBy === 'status' ? sortOrder : 'asc'}
                  onClick={() => handleSort('status')}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell
                sortDirection={sortBy === 'totalAmount' ? sortOrder : false}
              >
                <TableSortLabel
                  active={sortBy === 'totalAmount'}
                  direction={sortBy === 'totalAmount' ? sortOrder : 'asc'}
                  onClick={() => handleSort('totalAmount')}
                >
                  Total Amount
                </TableSortLabel>
              </TableCell>
              <TableCell
                sortDirection={sortBy === 'createdAt' ? sortOrder : false}
              >
                <TableSortLabel
                  active={sortBy === 'createdAt'}
                  direction={sortBy === 'createdAt' ? sortOrder : 'asc'}
                  onClick={() => handleSort('createdAt')}
                >
                  Created Date
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.data.map((order) => (
              <TableRow
                key={order.id}
                hover
                onClick={() => onRowClick?.(order.id)}
                sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
              >
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>
                  <Box
                    component="span"
                    sx={{
                      px: 2,
                      py: 1,
                      borderRadius: 1,
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      width: '100%',
                      display: 'inline-block',
                      textAlign: 'center',
                      bgcolor: getStatusBgColor(order.status),
                      color: getStatusTextColor(order.status),
                    }}
                  >
                    {capitalize(order.status)}
                  </Box>
                </TableCell>
                <TableCell>
                  {formatCurrency(order.totalAmount, order.currency)}
                </TableCell>
                <TableCell>{formatDate(order.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {data?.pagination && (
        <Box
          display="flex"
          justifyContent={isMobile ? 'center' : 'space-between'}
          alignItems={isMobile ? 'stretch' : 'center'}
          mt={2}
          px={2}
          flexDirection={isMobile ? 'column' : 'row'}
          gap={isMobile ? 2 : 0}
        >
          <Box
            display="flex"
            alignItems="center"
            gap={2}
            justifyContent={isMobile ? 'center' : 'flex-start'}
          >
            <Typography variant="body2" color="text.secondary">
              Items per page:
            </Typography>
            <FormControl size="small" sx={{ minWidth: 80 }}>
              <Select value={pageSize} onChange={handlePageSizeChange}>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box display="flex" justifyContent={isMobile ? 'center' : 'flex-end'}>
            <Pagination
              count={data.pagination.totalPages}
              page={data.pagination.page}
              onChange={handlePageChange}
              color="primary"
              size={isMobile ? 'small' : 'medium'}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};
