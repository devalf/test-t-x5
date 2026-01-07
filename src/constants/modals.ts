export const MODAL_TYPES = {
  ORDER_DETAILS: 'ORDER_DETAILS',
  // Add other modal types here as needed
  // CREATE_ORDER: 'CREATE_ORDER',
  // EDIT_CUSTOMER: 'EDIT_CUSTOMER',
  // DELETE_CONFIRMATION: 'DELETE_CONFIRMATION',
} as const;

export type ModalType = (typeof MODAL_TYPES)[keyof typeof MODAL_TYPES];
