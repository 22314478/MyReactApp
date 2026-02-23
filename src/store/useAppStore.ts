import { create } from 'zustand';
import { User } from 'firebase/auth';

type Role = 'customer' | 'provider' | null;

interface AppState {
    user: User | null;
    userRole: Role;
    isLoading: boolean;
    confirmation: any | null;
    setUserRole: (role: Role) => void;
    setLoading: (loading: boolean) => void;
    setUser: (user: User | null) => void;
    setConfirmation: (confirmation: any | null) => void;
}

export const useAppStore = create<AppState>(set => ({
    user: null,
    userRole: null,
    isLoading: false,
    confirmation: null,
    setUserRole: role => set({ userRole: role }),
    setLoading: loading => set({ isLoading: loading }),
    setUser: user => set({ user }),
    setConfirmation: confirmation => set({ confirmation }),
}));
