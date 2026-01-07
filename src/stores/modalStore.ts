import { create } from 'zustand';

import { ModalType } from '@/constants/modals';

interface ModalState {
  currentModal: ModalType | null;
  payload: Record<string, unknown> | null;
  openModal: (modalType: ModalType, payload?: Record<string, unknown>) => void;
  closeModal: () => void;
  isOpen: (modalType: ModalType) => boolean;
  getPayload: <T = Record<string, unknown>>() => T | null;
}

export const useModalStore = create<ModalState>((set, get) => ({
  currentModal: null,
  payload: null,

  openModal: (modalType: ModalType, payload?: Record<string, unknown>) => {
    set({
      currentModal: modalType,
      payload: payload || null,
    });
  },

  closeModal: () => {
    set({
      currentModal: null,
      payload: null,
    });
  },

  isOpen: (modalType: ModalType) => {
    return get().currentModal === modalType;
  },

  getPayload: <T = Record<string, unknown>>() => {
    return (get().payload as T) || null;
  },
}));
