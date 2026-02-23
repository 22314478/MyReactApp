import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text } from 'react-native';
import { colors } from '../theme/theme';
import { HomeScreen } from '../screens/Customer/HomeScreen';
import { CreateRequestScreen } from '../screens/Customer/CreateRequestScreen';
import { RequestsScreen } from '../screens/Customer/RequestsScreen';
import { RequestDetailScreen } from '../screens/Customer/RequestDetailScreen';
import { CustomerProfileScreen } from '../screens/Customer/CustomerProfileScreen';
import { ProviderProfileViewScreen } from '../screens/Customer/ProviderProfileViewScreen';
import { ReviewProviderScreen } from '../screens/Customer/ReviewProviderScreen';
import { SavedAddressesScreen } from '../screens/Customer/SavedAddressesScreen';
import { AddAddressScreen } from '../screens/Customer/AddAddressScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { MessagesListScreen } from '../screens/MessagesListScreen';
import Icon from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Temporary dummy component for pending screens
const DummyScreen = ({ name }: { name: string }) => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>{name} Ekranı (Yapım Aşamasında)</Text>
    </View>
);

const CustomerTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: true,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
            }}>
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    title: 'Keşfet',
                    tabBarIcon: ({ color, size }) => <Icon name="compass-outline" size={size} color={color} />,
                }}
            />
            <Tab.Screen
                name="Requests"
                component={RequestsScreen}
                options={{
                    title: 'Taleplerim',
                    tabBarIcon: ({ color, size }) => <Icon name="list-outline" size={size} color={color} />,
                }}
            />
            <Tab.Screen
                name="MessagesList"
                component={MessagesListScreen}
                options={{
                    title: 'Mesajlar',
                    tabBarIcon: ({ color, size }) => <Icon name="chatbubbles-outline" size={size} color={color} />,
                }}
            />
            <Tab.Screen
                name="Profile"
                component={CustomerProfileScreen}
                options={{
                    title: 'Profil',
                    tabBarIcon: ({ color, size }) => <Icon name="person-outline" size={size} color={color} />,
                }}
            />
        </Tab.Navigator>
    );
}

export function CustomerNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="CustomerTabs" component={CustomerTabs} />
            <Stack.Screen
                name="CreateRequest"
                component={CreateRequestScreen}
                options={{
                    headerShown: true,
                    title: 'Yeni Talep',
                    headerBackTitle: 'Geri',
                    headerTintColor: colors.primary,
                }}
            />
            <Stack.Screen
                name="RequestDetail"
                component={RequestDetailScreen}
                options={{
                    headerShown: true,
                    title: 'Talep Detayı',
                    headerBackTitle: 'Geri',
                    headerTintColor: colors.primary,
                }}
            />
            <Stack.Screen
                name="ProviderProfileView"
                component={ProviderProfileViewScreen}
                options={{
                    headerShown: true,
                    title: 'Hizmet Veren Profili',
                    headerBackTitle: 'Geri',
                    headerTintColor: colors.primary,
                }}
            />
            <Stack.Screen
                name="ReviewProvider"
                component={ReviewProviderScreen}
                options={{
                    headerShown: true,
                    title: 'Değerlendir',
                    headerBackTitle: 'Geri',
                    headerTintColor: colors.primary,
                }}
            />
            <Stack.Screen
                name="Chat"
                component={ChatScreen}
                options={{
                    headerShown: true,
                    title: 'Mesajlar',
                    headerBackTitle: 'Geri',
                    headerTintColor: colors.primary,
                }}
            />
            <Stack.Screen
                name="SavedAddresses"
                component={SavedAddressesScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="AddAddress"
                component={AddAddressScreen}
                options={{
                    headerShown: true,
                    title: 'Yeni Adres Ekle',
                    headerBackTitle: 'Geri',
                    headerTintColor: colors.primary,
                }}
            />
        </Stack.Navigator>
    );
};
