import {
  Dialog,
  DialogTitle,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';

import { useOrderActions, useOrder } from '@/features/orders';
import { useModalStore } from '@/stores/modalStore';
import { OrderEditForm, OrderEditFormData } from '@/forms';

interface OrderDetailsModalProps {
  open: boolean;
  onClose: () => void;
}

export const OrderDetailsModal = ({
  open,
  onClose,
}: OrderDetailsModalProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Get payload from modal store
  const { payload } = useModalStore();

  // Order hooks - handle own data fetching
  const { updateOrderStatus } = useOrderActions();
  const orderId = payload?.orderId as string | undefined;
  const { data: order } = useOrder(orderId || '');

  const handleFormSubmit = (data: OrderEditFormData) => {
    if (order && data.status !== order.status) {
      updateOrderStatus.mutate({
        orderId: order.id,
        newStatus: data.status,
      });
    }
    onClose();
  };

  if (!order) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          minHeight: isMobile ? '100vh' : 'auto',
          maxHeight: isMobile ? '100vh' : '90vh',
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h6" component="div">
          Order Details: {order.id}
        </Typography>
      </DialogTitle>

      <OrderEditForm
        order={order}
        isMobile={isMobile}
        onSubmit={handleFormSubmit}
        onCancel={onClose}
      />
    </Dialog>
  );
};
