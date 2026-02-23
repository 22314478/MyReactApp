import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text } from 'react-native';
import { colors } from '../theme/theme';
import { DashboardScreen } from '../screens/Provider/DashboardScreen';
import { ProviderRequestDetailScreen } from '../screens/Provider/ProviderRequestDetailScreen';
import { ProviderActiveJobsScreen } from '../screens/Provider/ProviderActiveJobsScreen';
import { ProviderProfileScreen } from '../screens/Provider/ProviderProfileScreen';
import { WalletScreen } from '../screens/Provider/WalletScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { MessagesListScreen } from '../screens/MessagesListScreen';
import Icon from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const DummyScreen = ({ name }: { name: string }) => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>{name}</Text>
    </View>
);

const ProviderTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: true,
                tabBarActiveTintColor: colors.secondary,
                tabBarInactiveTintColor: colors.textSecondary,
            }}>
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{
                    title: 'İşler',
                    tabBarIcon: ({ color, size }) => <Icon name="briefcase-outline" size={size} color={color} />,
                }}
            />
            <Tab.Screen
                name="ActiveJobs"
                component={ProviderActiveJobsScreen}
                options={{
                    title: 'Görevlerim',
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
                component={ProviderProfileScreen}
                options={{
                    title: 'Profil',
                    tabBarIcon: ({ color, size }) => <Icon name="person-outline" size={size} color={color} />,
                }}
            />
        </Tab.Navigator>
    );
};

export const ProviderNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="ProviderTabs" component={ProviderTabs} />
            <Stack.Screen
                name="ProviderRequestDetail"
                component={ProviderRequestDetailScreen}
                options={{
                    headerShown: true,
                    title: 'Talep Detayı',
                    headerBackTitle: 'Geri',
                    headerTintColor: colors.secondary,
                }}
            />
            <Stack.Screen
                name="Wallet"
                component={WalletScreen}
                options={{
                    headerShown: true,
                    title: 'Cüzdanım',
                    headerBackTitle: 'Geri',
                    headerTintColor: colors.secondary,
                }}
            />
            <Stack.Screen
                name="Chat"
                component={ChatScreen}
                options={{
                    headerShown: true,
                    title: 'Mesajlar',
                    headerBackTitle: 'Geri',
                    headerTintColor: colors.secondary,
                }}
            />
        </Stack.Navigator>
    );
};
