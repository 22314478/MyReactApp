// This is a placeholder for Firebase connection
// In a real environment, you need google-services.json and GoogleService-Info.plist
import { useAppStore } from '../store/useAppStore';

// Mock Authentication Service
export const authService = {
    verifyOTP: async (phone: string, code: string) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Return a mock user token
                resolve({ uid: 'mock-user-123', phone });
            }, 1000);
        });
    },

    logout: async () => {
        useAppStore.getState().setUserRole(null);
    }
};

// Mock Firestore Service
export const dbService = {
    getNearbyProviders: async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    { id: '1', name: 'Ahmet Usta', category: 'Kombi Tamiri', rating: 4.8 },
                    { id: '2', name: 'Ayşe Hanım', category: 'Ev Temizliği', rating: 4.9 }
                ]);
            }, 500);
        });
    }
};
