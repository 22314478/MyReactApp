import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { OTPVerificationScreen } from '../screens/Auth/OTPVerificationScreen';
import { RoleSelectionScreen } from '../screens/Auth/RoleSelectionScreen';
import { ProviderOnboardingScreen } from '../screens/Auth/ProviderOnboardingScreen';
import { useAppStore } from '../store/useAppStore';

const Stack = createNativeStackNavigator();

export const AuthNavigator = () => {
    const { user } = useAppStore();

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!user ? (
                <>
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
                </>
            ) : null}
            <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
            <Stack.Screen name="ProviderOnboarding" component={ProviderOnboardingScreen} />
        </Stack.Navigator>
    );
};
