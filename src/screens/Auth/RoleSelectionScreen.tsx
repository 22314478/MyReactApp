import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { Button } from '../../components/Button';
import { colors, spacing, typography, metrics } from '../../theme/theme';
import { useAppStore } from '../../store/useAppStore';
import { useNavigation } from '@react-navigation/native';
import { db } from '../../services/firebase';
import { doc, setDoc } from 'firebase/firestore';

export const RoleSelectionScreen = () => {
    const navigation = useNavigation();
    const [selectedRole, setSelectedRole] = useState<'customer' | 'provider' | null>(null);
    const { user, setUserRole } = useAppStore();
    const [loading, setLoading] = useState(false);

    const handleContinue = async () => {
        if (!user) {
            Alert.alert('Hata', 'Oturum bilgisi bulunamadı.');
            return;
        }

        setLoading(true);
        try {
            const userDocRef = doc(db, 'users', user.uid);
            await setDoc(userDocRef, {
                role: selectedRole
            }, { merge: true });

            if (selectedRole === 'customer') {
                setUserRole('customer');
            } else if (selectedRole === 'provider') {
                navigation.navigate('ProviderOnboarding' as never);
            }
        } catch (error: any) {
            console.error('Role update error:', error);
            Alert.alert('Hata', 'Rol seçilirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Nasıl Devam Etmek İstersiniz?</Text>
                    <Text style={styles.subtitle}>
                        Uygulamayı hangi amaçla kullanacağınızı seçin
                    </Text>
                </View>

                <View style={styles.rolesContainer}>
                    <TouchableOpacity
                        style={[
                            styles.roleCard,
                            selectedRole === 'customer' && styles.roleCardActive,
                        ]}
                        onPress={() => setSelectedRole('customer')}
                        activeOpacity={0.8}>
                        <Text
                            style={[
                                styles.roleTitle,
                                selectedRole === 'customer' && styles.roleTextActive,
                            ]}>
                            Hizmet Almak İstiyorum
                        </Text>
                        <Text
                            style={[
                                styles.roleDesc,
                                selectedRole === 'customer' && styles.roleTextActive,
                            ]}>
                            Ev temizliği, tamirat veya özel ders gibi hizmetler bulmak için.
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.roleCard,
                            selectedRole === 'provider' && styles.roleCardActive,
                        ]}
                        onPress={() => setSelectedRole('provider')}
                        activeOpacity={0.8}>
                        <Text
                            style={[
                                styles.roleTitle,
                                selectedRole === 'provider' && styles.roleTextActive,
                            ]}>
                            Hizmet Vermek İstiyorum
                        </Text>
                        <Text
                            style={[
                                styles.roleDesc,
                                selectedRole === 'provider' && styles.roleTextActive,
                            ]}>
                            Mesleğinizle ilgili talepleri görüp, teklif vererek kazanç sağlamak için.
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Button
                        title="Uygulamaya Başla"
                        onPress={handleContinue}
                        disabled={!selectedRole || loading}
                        loading={loading}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    container: { flex: 1 },
    header: {
        padding: spacing.xl,
        paddingTop: spacing.xxl,
    },
    title: {
        ...typography.header,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    subtitle: {
        ...typography.body,
        color: colors.textSecondary,
    },
    rolesContainer: {
        flex: 1,
        paddingHorizontal: spacing.xl,
        gap: spacing.md,
        justifyContent: 'center',
    },
    roleCard: {
        backgroundColor: colors.surface,
        padding: spacing.xl,
        borderRadius: metrics.borderRadius,
        borderWidth: 2,
        borderColor: 'transparent',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    roleCardActive: {
        borderColor: colors.primary,
        backgroundColor: colors.primary,
    },
    roleTitle: {
        ...typography.title,
        color: colors.text,
        marginBottom: spacing.sm,
    },
    roleDesc: {
        ...typography.body,
        color: colors.textSecondary,
        lineHeight: 22,
    },
    roleTextActive: {
        color: colors.surface,
    },
    footer: {
        padding: spacing.xl,
    },
});
