import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppStore } from '../store/useAppStore';
import { auth, db } from '../services/firebase';
import { ActivityIndicator, View } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { colors } from '../theme/theme';
import BootSplash from "react-native-bootsplash";

import { AuthNavigator } from './AuthNavigator';
import { CustomerNavigator } from './CustomerNavigator';
import { ProviderNavigator } from './ProviderNavigator';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  const { user, userRole, setUser, setUserRole, isLoading, setLoading } = useAppStore();

  React.useEffect(() => {
    setLoading(true);
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Fetch user profile from Firestore
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserRole(data?.role || null);
          } else {
            setUserRole(null); // No profile yet
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUserRole(null);
        }
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    // Return nothing while checking auth state. The BootSplash will cover the screen.
    return null;
  }

  return (
    <NavigationContainer onReady={() => BootSplash.hide({ fade: true })}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="AuthStack" component={AuthNavigator} />
        ) : !userRole ? (
          // If logged in but no role (e.g. during onboarding)
          <Stack.Screen name="AuthStack" component={AuthNavigator} />
        ) : userRole === 'customer' ? (
          <Stack.Screen name="CustomerStack" component={CustomerNavigator} />
        ) : (
          <Stack.Screen name="ProviderStack" component={ProviderNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
