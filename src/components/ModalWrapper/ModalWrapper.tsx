import { OrderDetailsModal } from './modals/OrderDetailsModal';

import { useModalStore } from '@/stores/modalStore';
import { MODAL_TYPES } from '@/constants/modals';

export const ModalWrapper = () => {
  const { currentModal, closeModal, isOpen } = useModalStore();

  // Render different modals based on currentModal type
  switch (currentModal) {
    case MODAL_TYPES.ORDER_DETAILS:
      return (
        <OrderDetailsModal
          open={isOpen(MODAL_TYPES.ORDER_DETAILS)}
          onClose={closeModal}
        />
      );

    // Example of how to add new modals:
    // case MODAL_TYPES.CREATE_ORDER:
    //   return (
    //     <CreateOrderModal
    //       open={isOpen(MODAL_TYPES.CREATE_ORDER)}
    //       onClose={handleClose}
    //     />
    //   );

    default:
      return null;
  }
};
