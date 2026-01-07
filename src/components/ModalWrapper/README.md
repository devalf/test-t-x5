# Modal System Documentation

This directory contains the common modal wrapper system that manages all modals in the application through Zustand state management.

## Architecture

The modal system consists of:

1. **Modal Constants** (`src/constants/modals.ts`) - Defines all available modal types
2. **Modal Store** (`src/stores/modalStore.ts`) - Zustand store for modal state and payload management
3. **Modal Wrapper** (`src/components/ModalWrapper/ModalWrapper.tsx`) - Generic component that renders the appropriate modal
4. **Modal Utils** (`src/utils/modal.ts`) - Convenience hooks for opening modals

## Key Principles

- **Generic ModalWrapper**: The wrapper component knows nothing about business logic
- **Self-contained Modals**: Each modal handles its own data fetching and business logic
- **Payload-based Communication**: Modals receive data through the payload system
- **Type Safety**: Full TypeScript support for modal types and payloads

## Usage

### Opening a Modal

```tsx
import { useModal } from '@/utils/modal';

const MyComponent = () => {
  const { openOrderDetails } = useModal();

  const handleViewOrder = (orderId: string) => {
    openOrderDetails(orderId);
  };

  return <button onClick={() => handleViewOrder('ORD-123')}>View Order</button>;
};
```

### Creating a New Modal

1. **Add the modal constant** in `src/constants/modals.ts`:

```tsx
export const MODAL_TYPES = {
  ORDER_DETAILS: 'ORDER_DETAILS',
  CREATE_ORDER: 'CREATE_ORDER', // Add this
} as const;
```

2. **Create the modal component** with self-contained logic:

```tsx
interface CreateOrderModalProps {
  open: boolean;
  onClose: () => void;
}

export const CreateOrderModal = ({ open, onClose }: CreateOrderModalProps) => {
  // Get payload from modal store
  const { payload } = useModalStore();

  // Handle own data fetching
  const { createOrder } = useOrderActions();
  const initialData = payload as OrderData;

  const handleSubmit = (data: OrderData) => {
    createOrder.mutate(data);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      {/* Modal content */}
    </Dialog>
  );
};
```

3. **Add the modal case** in `src/components/ModalWrapper/ModalWrapper.tsx`:

```tsx
case MODAL_TYPES.CREATE_ORDER:
  return (
    <CreateOrderModal
      open={isOpen(MODAL_TYPES.CREATE_ORDER)}
      onClose={handleClose}
    />
  );
```

4. **Add convenience method** in `src/utils/modal.ts`:

```tsx
export const useModal = () => {
  const { openModal, closeModal, isOpen, getPayload } = useModalStore();

  return {
    openOrderDetails: (orderId: string) => {
      openModal(MODAL_TYPES.ORDER_DETAILS, { orderId });
    },
    openCreateOrder: (initialData?: OrderData) => {
      openModal(MODAL_TYPES.CREATE_ORDER, initialData);
    },
    openModal,
    closeModal,
    isOpen,
    getPayload,
  };
};
```

### Modal Payload System

The payload system allows you to pass data to modals:

```tsx
// Opening modal with payload
openModal(MODAL_TYPES.ORDER_DETAILS, {
  orderId: 'ORD-123',
  readOnly: true,
});

// Accessing payload in modal (self-contained)
const MyModal = ({ open, onClose }: MyModalProps) => {
  // Modal fetches its own payload from the store
  const { payload } = useModalStore();
  const orderId = payload?.orderId;
  const readOnly = payload?.readOnly;

  // Modal handles its own data fetching
  const { data: order } = useOrder(orderId || '');
};
```

## Benefits

1. **Separation of Concerns** - ModalWrapper is generic, modals handle their own logic
2. **Centralized Management** - All modal state in one place
3. **Type Safety** - TypeScript support for modal types and payloads
4. **Payload Support** - Pass any data to modals through the state
5. **Escape Key Support** - Automatic escape key handling
6. **Easy Extension** - Simple pattern for adding new modals
7. **Self-contained Components** - Each modal manages its own data and business logic

## Example: Order Details Modal

The Order Details Modal demonstrates the new pattern:

1. **Constants**: `MODAL_TYPES.ORDER_DETAILS`
2. **Store**: Uses payload `{ orderId: string }`
3. **Modal**: Handles own data fetching with `useOrder(orderId)`
4. **Wrapper**: Simply renders modal with payload
5. **Utils**: `openOrderDetails(orderId)` convenience method
6. **Usage**: Parent components only need to call `openOrderDetails(id)`

This architecture ensures that the ModalWrapper remains generic and each modal is responsible for its own business logic and data management.
