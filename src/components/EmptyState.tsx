import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography } from '../theme/theme';

interface EmptyStateProps {
    icon: string;
    title: string;
    message: string;
    color?: string;
}

export function EmptyState({ icon, title, message, color = colors.primary }: EmptyStateProps) {
    return (
        <View style={styles.container}>
            <View style={[styles.iconWrapper, { backgroundColor: `${color}15` }]}>
                <View style={[styles.iconInner, { backgroundColor: `${color}25` }]}>
                    <Icon name={icon} size={48} color={color} />
                </View>
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xxl,
        marginTop: spacing.xxl,
    },
    iconWrapper: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    iconInner: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        ...typography.title,
        color: colors.text,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    message: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    }
});
