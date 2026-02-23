import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { colors, spacing, typography, metrics } from '../../theme/theme';
import { Button } from '../../components/Button';
import { db } from '../../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAppStore } from '../../store/useAppStore';

export interface SavedAddress {
    id: string;
    title: string;
    address: string;
    latitude: number;
    longitude: number;
}

export function SavedAddressesScreen() {
    const navigation = useNavigation<any>();
    const { user } = useAppStore();
    const isFocused = useIsFocused();

    const [addresses, setAddresses] = useState<SavedAddress[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAddresses = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const docRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.addresses && Array.isArray(data.addresses)) {
                        setAddresses(data.addresses);
                    } else {
                        setAddresses([]);
                    }
                }
            } catch (error) {
                console.error("Error fetching addresses", error);
            } finally {
                setLoading(false);
            }
        };

        if (isFocused) {
            fetchAddresses();
        }
    }, [isFocused, user]);

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Icon name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Kayıtlı Adreslerim</Text>
            <View style={{ width: 40 }} />
        </View>
    );

    const renderAddressItem = ({ item }: { item: SavedAddress }) => (
        <View style={styles.addressCard}>
            <View style={styles.addressIconContainer}>
                <Icon name={item.title.toLowerCase() === 'ev' ? 'home-outline' : item.title.toLowerCase() === 'iş' ? 'briefcase-outline' : 'location-outline'} size={24} color={colors.primary} />
            </View>
            <View style={styles.addressInfo}>
                <Text style={styles.addressTitle}>{item.title}</Text>
                <Text style={styles.addressText} numberOfLines={2}>{item.address}</Text>
            </View>
            <TouchableOpacity style={styles.editButton}>
                <Icon name="ellipsis-vertical" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            {renderHeader()}

            <View style={styles.container}>
                {loading ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                ) : addresses.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconCircle}>
                            <Icon name="map-outline" size={48} color={colors.primary} />
                        </View>
                        <Text style={styles.emptyTitle}>Henüz adres eklemediniz</Text>
                        <Text style={styles.emptySubtitle}>Hizmet alacağınız adresleri kaydederek daha hızlı talep oluşturabilirsiniz.</Text>
                    </View>
                ) : (
                    <FlatList
                        data={addresses}
                        keyExtractor={item => item.id}
                        renderItem={renderAddressItem}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>

            <View style={styles.footer}>
                <Button
                    title="Yeni Adres Ekle"
                    onPress={() => navigation.navigate('AddAddress')}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backButton: {
        padding: spacing.xs,
    },
    headerTitle: {
        ...typography.title,
        color: colors.text,
    },
    container: {
        flex: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
    },
    emptyIconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: `${colors.primary}15`,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    emptyTitle: {
        ...typography.title,
        color: colors.text,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    emptySubtitle: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
    listContent: {
        padding: spacing.md,
    },
    addressCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: colors.surface,
        padding: spacing.lg,
        borderRadius: metrics.borderRadius,
        marginBottom: spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    addressIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: `${colors.primary}15`,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    addressInfo: {
        flex: 1,
    },
    addressTitle: {
        ...typography.body,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 4,
    },
    addressText: {
        ...typography.caption,
        color: colors.textSecondary,
        lineHeight: 20,
    },
    editButton: {
        padding: spacing.xs,
        marginLeft: spacing.xs,
    },
    footer: {
        padding: spacing.lg,
        paddingBottom: spacing.xl,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    }
});
