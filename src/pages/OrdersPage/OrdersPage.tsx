import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery,
  SelectChangeEvent,
} from '@mui/material';
import { useState } from 'react';

import { SearchField } from '@/components/SearchField';
import { OrdersTable } from '@/components/OrdersTable/OrdersTable';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { ModalWrapper } from '@/components/ModalWrapper';
import { ORDER_STATUSES } from '@/models';
import { capitalize } from '@/utils';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useModal } from '@/utils/modal';

export const OrdersPage = () => {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Initialize WebSocket connection for real-time updates
  useWebSocket();

  // Modal store hooks
  const { openOrderDetails } = useModal();

  const handleStatusChange = (event: SelectChangeEvent<string>) => {
    const newStatus = event.target.value;
    setStatusFilter(newStatus);
  };

  const handleRowClick = (orderId: string) => {
    // Open the order details modal with the order ID as payload
    openOrderDetails(orderId);
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h4" component="h1">
          Orders Dashboard
        </Typography>
        <ConnectionStatus />
      </Box>

      {/* Mobile Layout: Search as top block, Status filter below */}
      {isMobile ? (
        <Box mb={2}>
          <Box mb={2}>
            <SearchField />
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="body2" color="text.secondary">
              Status:
            </Typography>
            <FormControl size="small" sx={{ minWidth: 120, flex: 1 }}>
              <Select
                value={statusFilter}
                onChange={handleStatusChange}
                displayEmpty
                fullWidth
              >
                <MenuItem value="">All Statuses</MenuItem>
                {ORDER_STATUSES.map((status) => (
                  <MenuItem key={status} value={status}>
                    {capitalize(status)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      ) : (
        /* Desktop Layout: Search and Status side by side */
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          gap={2}
          mb={2}
        >
          <SearchField />

          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="body2" color="text.secondary">
              Status:
            </Typography>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={statusFilter}
                onChange={handleStatusChange}
                displayEmpty
              >
                <MenuItem value="">All Statuses</MenuItem>
                {ORDER_STATUSES.map((status) => (
                  <MenuItem key={status} value={status}>
                    {capitalize(status)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      )}

      <OrdersTable statusFilter={statusFilter} onRowClick={handleRowClick} />

      <ModalWrapper />
    </Box>
  );
};
