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

export function ProviderProfileScreen() {
    const navigation = useNavigation();
    const { user, setUserRole } = useAppStore();

    const [providerData, setProviderData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Edit Modal State
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editCategory, setEditCategory] = useState('');
    const [editWorkingHours, setEditWorkingHours] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setProviderData(data);
                    setEditName(data.name || '');
                    setEditPhone(data.phone || user.phoneNumber || '');
                    setEditCategory(data.category || '');
                    setEditWorkingHours(data.workingHours || '');
                }
            } catch (error) {
                console.error("Error fetching provider data:", error);
            } finally {
                setLoading(false);
            }
        };
        const unsubscribe = navigation.addListener('focus', fetchProfile);
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
                phone: editPhone.trim(),
                category: editCategory.trim(),
                workingHours: editWorkingHours.trim()
            });
            setProviderData((prev: any) => ({
                ...prev,
                name: editName.trim(),
                phone: editPhone.trim(),
                category: editCategory.trim(),
                workingHours: editWorkingHours.trim()
            }));
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
                <ActivityIndicator size="large" color={colors.secondary} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.headerBackground} />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Profile Header Card */}
                <View style={styles.profileHeaderCard}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Icon name="person" size={50} color={colors.secondary} />
                        </View>
                        <TouchableOpacity
                            style={styles.editAvatarBadge}
                            onPress={() => setIsEditModalVisible(true)}
                        >
                            <Icon name="pencil" size={16} color={colors.surface} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.name}>{providerData?.name || 'İsimsiz Usta'}</Text>
                    <Text style={styles.phone}>{providerData?.phone || user?.phoneNumber || 'Telefon Belirtilmemiş'}</Text>
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleBadgeText}>Profesyonel Hizmet Veren</Text>
                    </View>

                    <View style={styles.badgesRow}>
                        <View style={styles.badgeItem}>
                            <Icon name="shield-checkmark" size={14} color={colors.primary} />
                            <Text style={styles.badgeText}>Kimlik Onaylı</Text>
                        </View>
                        <View style={styles.badgeItem}>
                            <Icon name="document-text" size={14} color={colors.secondary} />
                            <Text style={styles.badgeText}>Sabıka Temiz</Text>
                        </View>
                    </View>
                </View>

                {/* Stats Row */}
                <View style={styles.statsContainer}>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{providerData?.rating?.toFixed(1) || '0.0'}</Text>
                        <View style={styles.statLabelRow}>
                            <Icon name="star" size={14} color="#FFD700" />
                            <Text style={styles.statLabel}> Puan</Text>
                        </View>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{providerData?.completedJobs || 0}</Text>
                        <Text style={styles.statLabel}>Tamamlanan İş</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>₺{providerData?.earnings?.toLocaleString('tr-TR') || '0'}</Text>
                        <Text style={styles.statLabel}>Kayıtlı Kazanç</Text>
                    </View>
                </View>

                {/* Detailed Ratings */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Değerlendirme Analizi</Text>
                    <View style={styles.ratingDetailCard}>
                        <View style={styles.ratingBarRow}>
                            <Text style={styles.ratingBarLabel}>İşçilik Kalitesi</Text>
                            <View style={styles.ratingBarBackground}>
                                <View style={[styles.ratingBarFill, { width: '95%' }]} />
                            </View>
                            <Text style={styles.ratingBarValue}>4.9</Text>
                        </View>
                        <View style={styles.ratingBarRow}>
                            <Text style={styles.ratingBarLabel}>İletişim & Nezaket</Text>
                            <View style={styles.ratingBarBackground}>
                                <View style={[styles.ratingBarFill, { width: '90%' }]} />
                            </View>
                            <Text style={styles.ratingBarValue}>4.7</Text>
                        </View>
                        <View style={styles.ratingBarRow}>
                            <Text style={styles.ratingBarLabel}>Zamanlama (Hız)</Text>
                            <View style={styles.ratingBarBackground}>
                                <View style={[styles.ratingBarFill, { width: '85%' }]} />
                            </View>
                            <Text style={styles.ratingBarValue}>4.5</Text>
                        </View>
                    </View>
                </View>

                {/* Service Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Hizmet Bilgileri</Text>

                    <View style={styles.infoRow}>
                        <View style={[styles.infoIconContainer, { backgroundColor: 'rgba(255,149,0,0.1)' }]}>
                            <Icon name="briefcase-outline" size={20} color="#FF9500" />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Kategori</Text>
                            <Text style={styles.infoValue}>{providerData?.category || 'Kategori Belirtilmemiş'}</Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <View style={[styles.infoIconContainer, { backgroundColor: 'rgba(52,199,89,0.1)' }]}>
                            <Icon name="location-outline" size={20} color="#34C759" />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Hizmet Bölgesi</Text>
                            <Text style={styles.infoValue}>{providerData?.serviceAreas?.join(', ') || 'Tüm İstanbul'}</Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <View style={[styles.infoIconContainer, { backgroundColor: 'rgba(88,86,214,0.1)' }]}>
                            <Icon name="time-outline" size={20} color="#5856D6" />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Çalışma Saatleri</Text>
                            <Text style={styles.infoValue}>{providerData?.workingHours || 'Müsaitlik Belirtilmemiş'}</Text>
                        </View>
                    </View>
                </View>

                {/* Menu Items */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Ayarlar</Text>

                    <TouchableOpacity style={styles.menuItem} onPress={() => setIsEditModalVisible(true)}>
                        <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(255,59,48,0.1)' }]}>
                            <Icon name="settings-outline" size={22} color={colors.secondary} />
                        </View>
                        <View style={styles.menuTextContainer}>
                            <Text style={styles.menuText}>Hesap Ayarları</Text>
                            <Text style={styles.menuSubText}>Kişisel bilgileri ve çalışma saatlerini düzenle</Text>
                        </View>
                        <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => (navigation as any).navigate('Wallet')}>
                        <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(52,199,89,0.1)' }]}>
                            <Icon name="wallet-outline" size={22} color="#34C759" />
                        </View>
                        <View style={styles.menuTextContainer}>
                            <Text style={styles.menuText}>Cüzdanım ve Kazançlarım</Text>
                            <Text style={styles.menuSubText}>Kazançlar, komisyonlar ve banka hesabı</Text>
                        </View>
                        <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(142,142,147,0.1)' }]}>
                            <Icon name="help-circle-outline" size={22} color="#8E8E93" />
                        </View>
                        <View style={styles.menuTextContainer}>
                            <Text style={styles.menuText}>Yardım Merkezi</Text>
                            <Text style={styles.menuSubText}>Sıkça sorulan sorular</Text>
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
                    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}>
                        <TouchableOpacity style={{ flex: 1 }} onPress={() => setIsEditModalVisible(false)} />
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Profili Düzenle</Text>
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

                            <Text style={styles.inputLabel}>Uzmanlık Kategorisi</Text>
                            <TextInput
                                style={styles.input}
                                value={editCategory}
                                onChangeText={setEditCategory}
                                placeholder="Örn: Ev Temizliği, Boya Badana"
                                placeholderTextColor={colors.textSecondary}
                            />

                            <Text style={styles.inputLabel}>Çalışma Saatleri</Text>
                            <TextInput
                                style={styles.input}
                                value={editWorkingHours}
                                onChangeText={setEditWorkingHours}
                                placeholder="Örn: Hafta içi 09:00 - 18:00"
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
                    </ScrollView>
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
        backgroundColor: colors.secondary, // Provider specific color relative to customer
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
        backgroundColor: 'rgba(255,59,48,0.1)', // Matches secondary roughly
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: colors.surface,
    },
    editAvatarBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: colors.secondary,
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
        backgroundColor: 'rgba(255,59,48,0.1)',
        paddingHorizontal: spacing.md,
        paddingVertical: 6,
        borderRadius: 12,
    },
    roleBadgeText: {
        ...typography.caption,
        color: colors.secondary,
        fontWeight: 'bold',
    },
    statsContainer: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    statBox: {
        flex: 1,
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 3,
    },
    statValue: {
        ...typography.title,
        color: colors.text,
        marginBottom: 4,
    },
    statLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statLabel: {
        ...typography.caption,
        color: colors.textSecondary,
        textAlign: 'center',
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
    infoRow: {
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
    infoIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        ...typography.caption,
        color: colors.textSecondary,
        marginBottom: 2,
    },
    infoValue: {
        ...typography.body,
        color: colors.text,
        fontWeight: '600',
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
    badgesRow: {
        flexDirection: 'row',
        marginTop: spacing.md,
        gap: spacing.sm,
    },
    badgeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: `${colors.primary}15`,
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: `${colors.primary}30`,
    },
    badgeText: {
        ...typography.caption,
        color: colors.text,
        marginLeft: 4,
        fontWeight: '600',
    },
    ratingDetailCard: {
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderRadius: metrics.borderRadius,
        borderWidth: 1,
        borderColor: colors.border,
    },
    ratingBarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    ratingBarLabel: {
        ...typography.caption,
        color: colors.textSecondary,
        width: 110,
    },
    ratingBarBackground: {
        flex: 1,
        height: 6,
        backgroundColor: colors.border,
        borderRadius: 3,
        marginHorizontal: spacing.sm,
        overflow: 'hidden',
    },
    ratingBarFill: {
        height: '100%',
        backgroundColor: '#FFD700',
        borderRadius: 3,
    },
    ratingBarValue: {
        ...typography.caption,
        fontWeight: 'bold',
        color: colors.text,
        width: 25,
        textAlign: 'right',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: spacing.lg,
        paddingBottom: Platform.OS === 'ios' ? spacing.xxl : spacing.xl,
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
