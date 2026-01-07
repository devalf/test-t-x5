import { useModalStore } from '@/stores/modalStore';
import { MODAL_TYPES } from '@/constants/modals';

/**
 * Convenience hook for opening modals with type safety
 */
export const useModal = () => {
  const { openModal, closeModal, isOpen, getPayload } = useModalStore();

  return {
    openOrderDetails: (orderId: string) => {
      openModal(MODAL_TYPES.ORDER_DETAILS, { orderId });
    },
    openModal,
    closeModal,
    isOpen,
    getPayload,
  };
};
