import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const colors = {
    primary: '#007AFF', // Clean blue for marketplace action
    secondary: '#5856D6', // Purple for providers
    background: '#F2F2F7', // iOS default light gray
    surface: '#FFFFFF', // Cards and inputs
    text: '#1C1C1E',
    textSecondary: '#8E8E93',
    error: '#FF3B30',
    success: '#34C759',
    warning: '#FFCC00',
    border: '#D1D1D6',
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
};

export const typography = {
    header: {
        fontSize: 24,
        fontWeight: 'bold' as const,
    },
    title: {
        fontSize: 18,
        fontWeight: '600' as const,
    },
    body: {
        fontSize: 16,
        fontWeight: 'normal' as const,
    },
    caption: {
        fontSize: 12,
        fontWeight: 'normal' as const,
        color: colors.textSecondary,
    },
};

export const metrics = {
    width,
    height,
    borderRadius: 12,
};
