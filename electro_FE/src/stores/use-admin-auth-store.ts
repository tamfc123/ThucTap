import { UserResponse } from 'models/User';
import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { createTrackedSelector } from 'react-tracked';

interface AdminAuthState {
  jwtToken: string | null;
  user: UserResponse | null;
}

interface AdminAuthAction {
  updateJwtToken: (value: string) => void;
  updateUser: (value: UserResponse) => void;
  resetAdminAuthState: () => void;
  isOnlyEmployee: () => boolean;
}

const initialAuthState: AdminAuthState = {
  jwtToken: null,
  user: null,
};

const useAdminAuthStore = create<AdminAuthState & AdminAuthAction>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialAuthState,
        updateJwtToken: (value) => set(() => ({ jwtToken: value }), false, 'AdminAuthStore/updateJwtToken'),
        updateUser: (value) => set(() => ({ user: value }), false, 'AdminAuthStore/updateUser'),
        resetAdminAuthState: () => set(initialAuthState, false, 'AdminAuthStore/resetAdminAuthState'),
        isOnlyEmployee: () => {
          const user = get().user;
          return !!(user && !user.roles.map(role => role.code).includes('ADMIN'));
        },
      }),
      {
        name: 'electro-admin-auth-store',
        getStorage: () => localStorage,
      }
    ),
    {
      name: 'AdminAuthStore',
      anonymousActionType: 'AdminAuthStore',
    }
  )
);

// Rehydrate khi có thay đổi localStorage (giữ nguyên)
const withStorageDOMEvents = (store: typeof useAdminAuthStore) => {
  const storageEventCallback = (e: StorageEvent) => {
    if (e.key === store.persist.getOptions().name && e.newValue) {
      store.persist.rehydrate();
    }
  };

  window.addEventListener('storage', storageEventCallback);
  return () => {
    window.removeEventListener('storage', storageEventCallback);
  };
};

withStorageDOMEvents(useAdminAuthStore);

// 👇 Đây là hook React-tracked
const useTrackedAdminAuthStore = createTrackedSelector(useAdminAuthStore);

// 👇 Export cả hai
export { useAdminAuthStore, useTrackedAdminAuthStore };
