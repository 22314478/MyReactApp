import { initializeApp } from 'firebase/app';
import { initializeAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyANp1nBaCkxOIsusvqaic-U3jjWez9nfAY",
    authDomain: "mobiapp-18b5e.firebaseapp.com",
    projectId: "mobiapp-18b5e",
    storageBucket: "mobiapp-18b5e.firebasestorage.app",
    messagingSenderId: "84961398102",
    appId: "1:84961398102:ios:8c5fd9870491d2b0c7daf7",
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = initializeAuth(app);
export const db = getFirestore(app);

// Helper to convert phone to a dummy email for Firebase Auth
const getDummyEmail = (phone: string) => {
    const formattedPhone = phone.replace('+', '').trim();
    return `${formattedPhone}@mahalle.app`;
};

/**
 * LOG IN API (No OTP)
 */
export const loginWithPhoneAndPassword = async (phone: string, pass: string) => {
    const dummyEmail = getDummyEmail(phone);
    try {
        const credential = await signInWithEmailAndPassword(auth, dummyEmail, pass);
        return credential;
    } catch (error: any) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            throw new Error('Telefon numarası veya şifre hatalı.');
        }
        throw new Error(error.message);
    }
};

/**
 * SIGN UP MOCK OTP SENDER
 */
export const sendRegistrationOTP = async (phone: string) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(() => resolve(true), 1500));
    // Returns a confirmation object with a confirm method
    return {
        confirm: async (code: string) => {
            if (code !== '123456') { // Mock verification code
                throw new Error("Geçersiz doğrulama kodu. (123456 giriniz)");
            }
            return true;
        }
    };
};

/**
 * CREATE USER ACCOUNT AFTER OTP
 */
export const createUserProfile = async (phone: string, pass: string, name: string) => {
    const dummyEmail = getDummyEmail(phone);
    try {
        const credential = await createUserWithEmailAndPassword(auth, dummyEmail, pass);
        const uid = credential.user.uid;

        // Create initial user doc in Firestore
        await setDoc(doc(db, 'users', uid), {
            name: name,
            phone: phone,
            createdAt: new Date().toISOString(),
            // role is empty, to be selected in RoleSelection
        });

        return credential;
    } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
            throw new Error('Bu telefon numarası ile zaten kayıt olunmuş.');
        }
        throw new Error(error.message);
    }
};
