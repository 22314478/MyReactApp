import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, metrics } from '../../theme/theme';
import { Button } from '../../components/Button';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppStore } from '../../store/useAppStore';
import { auth, db } from '../../services/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export function CustomerProfileScreen() {
    const navigation = useNavigation();
    const { user, setUserRole } = useAppStore();

    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Edit Modal State
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setUserData(data);
                    setEditName(data.name || '');
                    setEditPhone(data.phone || user.phoneNumber || '');
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setLoading(false);
            }
        };

        const unsubscribe = navigation.addListener('focus', fetchUserData);
        return unsubscribe;
    }, [navigation, user]);

    const handleLogout = async () => {
        try {
            await auth.signOut();
            setUserRole(null);
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    const handleSaveProfile = async () => {
        if (!user) return;
        if (!editName.trim()) {
            Alert.alert("Hata", "Lütfen adınızı girin.");
            return;
        }

        setSaving(true);
        try {
            await updateDoc(doc(db, 'users', user.uid), {
                name: editName.trim(),
                phone: editPhone.trim()
            });
            setUserData((prev: any) => ({ ...prev, name: editName.trim(), phone: editPhone.trim() }));
            setIsEditModalVisible(false);
        } catch (error) {
            console.error("Error updating profile:", error);
            Alert.alert("Hata", "Bilgiler güncellenirken bir sorun oluştu.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.headerBackground} />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <View style={styles.profileHeaderCard}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Icon name="person" size={50} color={colors.primary} />
                        </View>
                        <TouchableOpacity
                            style={styles.editAvatarBadge}
                            onPress={() => setIsEditModalVisible(true)}
                        >
                            <Icon name="pencil" size={16} color={colors.surface} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.name}>{userData?.name || 'İsimsiz Kullanıcı'}</Text>
                    <Text style={styles.phone}>{userData?.phone || user?.phoneNumber || 'Telefon Belirtilmemiş'}</Text>
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleBadgeText}>Müşteri Hesabı</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Hesap Ayarları</Text>

                    <TouchableOpacity style={styles.menuItem} onPress={() => setIsEditModalVisible(true)}>
                        <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(0,122,255,0.1)' }]}>
                            <Icon name="person-outline" size={22} color={colors.primary} />
                        </View>
                        <View style={styles.menuTextContainer}>
                            <Text style={styles.menuText}>Kişisel Bilgiler</Text>
                            <Text style={styles.menuSubText}>Ad, telefon numarası bilgilerinizi güncelleyin</Text>
                        </View>
                        <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('SavedAddresses' as never)}>
                        <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(52,199,89,0.1)' }]}>
                            <Icon name="location-outline" size={22} color="#34C759" />
                        </View>
                        <View style={styles.menuTextContainer}>
                            <Text style={styles.menuText}>Kayıtlı Adreslerim</Text>
                            <Text style={styles.menuSubText}>Ev, iş ve diğer adresleriniz</Text>
                        </View>
                        <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(255,149,0,0.1)' }]}>
                            <Icon name="card-outline" size={22} color="#FF9500" />
                        </View>
                        <View style={styles.menuTextContainer}>
                            <Text style={styles.menuText}>Ödeme Yöntemleri</Text>
                            <Text style={styles.menuSubText}>Kredi kartı ve bakiye yönetimi</Text>
                        </View>
                        <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(88,86,214,0.1)' }]}>
                            <Icon name="notifications-outline" size={22} color="#5856D6" />
                        </View>
                        <View style={styles.menuTextContainer}>
                            <Text style={styles.menuText}>Bildirim Tercihleri</Text>
                            <Text style={styles.menuSubText}>SMS ve Push bildirim izinleri</Text>
                        </View>
                        <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Diğer</Text>
                    <TouchableOpacity style={styles.menuItem}>
                        <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(142,142,147,0.1)' }]}>
                            <Icon name="help-circle-outline" size={22} color="#8E8E93" />
                        </View>
                        <View style={styles.menuTextContainer}>
                            <Text style={styles.menuText}>Yardım Merkezi</Text>
                            <Text style={styles.menuSubText}>Sık sorulan sorular ve destek hattı</Text>
                        </View>
                        <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.logoutButtonContainer} onPress={handleLogout}>
                    <Icon name="log-out-outline" size={22} color={colors.error} />
                    <Text style={styles.logoutText}>Çıkış Yap</Text>
                </TouchableOpacity>

            </ScrollView>

            {/* Edit Profile Modal */}
            <Modal
                visible={isEditModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsEditModalVisible(false)}
            >
                <KeyboardAvoidingView
                    style={styles.modalOverlay}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Kişisel Bilgileri Düzenle</Text>
                            <TouchableOpacity onPress={() => setIsEditModalVisible(false)} style={styles.closeButton}>
                                <Icon name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.inputLabel}>Ad Soyad</Text>
                        <TextInput
                            style={styles.input}
                            value={editName}
                            onChangeText={setEditName}
                            placeholder="Adınızı girin"
                            placeholderTextColor={colors.textSecondary}
                        />

                        <Text style={styles.inputLabel}>Telefon Numarası</Text>
                        <TextInput
                            style={styles.input}
                            value={editPhone}
                            onChangeText={setEditPhone}
                            placeholder="Telefon numaranızı girin"
                            keyboardType="phone-pad"
                            placeholderTextColor={colors.textSecondary}
                        />

                        <Button
                            title="Değişiklikleri Kaydet"
                            onPress={handleSaveProfile}
                            loading={saving}
                            disabled={saving}
                            style={styles.saveModalButton}
                        />
                    </View>
                </KeyboardAvoidingView>
            </Modal>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    headerBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 200,
        backgroundColor: colors.primary,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    scrollContent: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.xl,
        paddingBottom: spacing.xxl,
    },
    profileHeaderCard: {
        backgroundColor: colors.surface,
        borderRadius: 20,
        padding: spacing.xl,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        marginBottom: spacing.xl,
        marginTop: spacing.md,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: spacing.md,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(0,122,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: colors.surface,
    },
    editAvatarBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: colors.primary,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: colors.surface,
    },
    name: {
        ...typography.header,
        color: colors.text,
        marginBottom: 4,
        textAlign: 'center',
    },
    phone: {
        ...typography.body,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
    },
    roleBadge: {
        backgroundColor: 'rgba(0,122,255,0.1)',
        paddingHorizontal: spacing.md,
        paddingVertical: 6,
        borderRadius: 12,
    },
    roleBadgeText: {
        ...typography.caption,
        color: colors.primary,
        fontWeight: 'bold',
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        ...typography.title,
        color: colors.text,
        marginBottom: spacing.md,
        marginLeft: spacing.xs,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderRadius: 16,
        marginBottom: spacing.sm,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    menuIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    menuTextContainer: {
        flex: 1,
    },
    menuText: {
        ...typography.body,
        color: colors.text,
        fontWeight: '600',
        marginBottom: 2,
    },
    menuSubText: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    logoutButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        backgroundColor: 'rgba(255,59,48,0.1)',
        borderRadius: 16,
        marginTop: spacing.md,
    },
    logoutText: {
        ...typography.body,
        color: colors.error,
        fontWeight: 'bold',
        marginLeft: spacing.xs,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    modalTitle: {
        ...typography.header,
        color: colors.text,
    },
    closeButton: {
        padding: spacing.xs,
        backgroundColor: colors.background,
        borderRadius: 20,
    },
    inputLabel: {
        ...typography.caption,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
        marginLeft: 4,
    },
    input: {
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: metrics.borderRadius,
        padding: spacing.md,
        ...typography.body,
        color: colors.text,
        marginBottom: spacing.lg,
    },
    saveModalButton: {
        marginTop: spacing.sm,
    }
});
