import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useRoleStore = create(
  persist(
    (set) => ({
      role: null,
      setRole: (role) => set({ role }),
      clearRole: () => set({ role: null }),
    }),
    {
      name: 'role-storage',
    }
  )
);