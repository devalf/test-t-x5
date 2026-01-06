import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material';
import { useState } from 'react';

import { SearchField } from '@/components/SearchField';
import { OrdersTable } from '@/components/OrdersTable/OrdersTable';
import { ORDER_STATUSES } from '@/models';
import { capitalize } from '@/utils';

export const OrdersPage = () => {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleStatusChange = (event: SelectChangeEvent<string>) => {
    const newStatus = event.target.value;
    setStatusFilter(newStatus);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Orders Dashboard
      </Typography>

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

      <OrdersTable statusFilter={statusFilter} />
    </Box>
  );
};
