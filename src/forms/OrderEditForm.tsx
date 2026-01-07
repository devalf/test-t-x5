import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useEffect } from 'react';

import { OrderEditFormData, orderEditFormSchema } from './orderEditForm.schema';

import { Order, OrderStatus, ORDER_STATUSES } from '@/models';
import { formatDate, formatCurrency, capitalize } from '@/utils';

interface OrderEditFormProps {
  order: Order;
  isMobile: boolean;
  onSubmit: (data: OrderEditFormData) => void;
  onCancel: () => void;
}

const getStatusColor = (
  status: OrderStatus,
): 'success' | 'warning' | 'info' | 'error' | 'pending' => {
  switch (status) {
    case 'delivered':
      return 'success';
    case 'processing':
      return 'warning';
    case 'shipped':
      return 'info';
    case 'cancelled':
      return 'error';
    case 'pending':
    default:
      return 'pending';
  }
};

export const OrderEditForm = ({
  order,
  isMobile,
  onSubmit,
  onCancel,
}: OrderEditFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<OrderEditFormData>({
    resolver: zodResolver(orderEditFormSchema),
    defaultValues: {
      status: order.status,
    },
  });

  // Reset form when order changes
  useEffect(() => {
    reset({ status: order.status });
  }, [order.id, order.status, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Customer Information */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle2" gutterBottom>
                Customer Information
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                <Typography variant="body2">
                  <strong>Name:</strong> {order.customerName}
                </Typography>
                <Typography variant="body2">
                  <strong>Email:</strong> {order.customerEmail}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Order Status */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle2" gutterBottom>
                Order Status
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <Chip
                  label={capitalize(order.status)}
                  color={getStatusColor(order.status)}
                  size="small"
                />
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <FormControl
                      size="small"
                      sx={{ minWidth: 120 }}
                      error={!!errors.status}
                    >
                      <InputLabel>Change Status</InputLabel>
                      <Select
                        value={field.value}
                        onChange={(event) => field.onChange(event.target.value)}
                        label="Change Status"
                      >
                        {ORDER_STATUSES.map((status) => (
                          <MenuItem key={status} value={status}>
                            {capitalize(status)}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.status && (
                        <FormHelperText>{errors.status.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Box>
            </Paper>
          </Grid>

          {/* Shipping Address */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle2" gutterBottom>
                Shipping Address
              </Typography>
              <Box display="flex" flexDirection="column" gap={0.5}>
                <Typography variant="body2">
                  {order.shippingAddress.street}
                </Typography>
                <Typography variant="body2">
                  {order.shippingAddress.city},{' '}
                  {order.shippingAddress.postalCode}
                </Typography>
                <Typography variant="body2">
                  {order.shippingAddress.country}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Order Summary */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle2" gutterBottom>
                Order Summary
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                <Typography variant="body2">
                  <strong>Created:</strong> {formatDate(order.createdAt)}
                </Typography>
                <Typography variant="body2">
                  <strong>Updated:</strong> {formatDate(order.updatedAt)}
                </Typography>
                <Typography variant="body2">
                  <strong>Total Amount:</strong>{' '}
                  {formatCurrency(order.totalAmount, order.currency)}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Order Items */}
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Order Items ({order.items.length})
              </Typography>
              <TableContainer>
                <Table size={isMobile ? 'small' : 'medium'}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">
                          {formatCurrency(item.price, order.currency)}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(
                            item.price * item.quantity,
                            order.currency,
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} sx={{ fontWeight: 'bold' }}>
                        Total
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(order.totalAmount, order.currency)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button onClick={onCancel} variant="outlined" type="button">
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={!isDirty}>
          Save Changes
        </Button>
      </DialogActions>
    </form>
  );
};
