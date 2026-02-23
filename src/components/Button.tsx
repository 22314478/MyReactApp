import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacityProps,
} from 'react-native';
import { colors, metrics, spacing, typography } from '../theme/theme';

interface ButtonProps extends TouchableOpacityProps {
    title: string;
    variant?: 'primary' | 'secondary' | 'outline';
    loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    variant = 'primary',
    loading = false,
    style,
    disabled,
    ...props
}) => {
    const getBackgroundColor = () => {
        if (disabled) return colors.border;
        if (variant === 'primary') return colors.primary;
        if (variant === 'secondary') return colors.secondary;
        return 'transparent';
    };

    const getTextColor = () => {
        if (variant === 'outline') return disabled ? colors.textSecondary : colors.primary;
        return colors.surface;
    };

    return (
        <TouchableOpacity
            style={[
                styles.container,
                { backgroundColor: getBackgroundColor() },
                variant === 'outline' && styles.outline,
                style,
            ]}
            disabled={disabled || loading}
            activeOpacity={0.8}
            {...props}>
            {loading ? (
                <ActivityIndicator color={getTextColor()} />
            ) : (
                <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 52,
        borderRadius: metrics.borderRadius,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        marginVertical: spacing.sm,
    },
    outline: {
        borderWidth: 1.5,
        borderColor: colors.primary,
    },
    text: {
        ...typography.title,
    },
});
