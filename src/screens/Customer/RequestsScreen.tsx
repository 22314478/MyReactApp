import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography } from '../../theme/theme';
import { db } from '../../services/firebase';
import { EmptyState } from '../../components/EmptyState';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useAppStore } from '../../store/useAppStore';
import { RequestSkeleton } from '../../components/Skeletons';

interface RequestItem {
    id: string;
    title: string;
    status: string;
    date: string;
    category: string;
    imageUrl?: string;
}

export function RequestsScreen() {
    const navigation = useNavigation();
    const { user } = useAppStore();
    const [requests, setRequests] = React.useState<RequestItem[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchRequests = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const q = query(
                    collection(db, 'serviceRequests'),
                    where('customerId', '==', user.uid),
                    orderBy('createdAt', 'desc')
                );
                const querySnapshot = await getDocs(q);
                const fetched: RequestItem[] = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    let displayStatus = 'Bilinmiyor';
                    if (data.status === 'open') displayStatus = 'Teklif Bekleniyor';
                    if (data.status === 'offered') displayStatus = 'Teklif Geldi';
                    if (data.status === 'accepted') displayStatus = 'Onaylandı';
                    if (data.status === 'completed') displayStatus = 'Tamamlandı';

                    fetched.push({
                        id: doc.id,
                        title: data.description ? data.description.substring(0, 30) + '...' : data.category || 'Talep',
                        status: displayStatus,
                        date: data.createdAt ? new Date(data.createdAt).toLocaleDateString('tr-TR') : '',
                        category: data.category || 'Genel',
                        imageUrl: data.images && data.images.length > 0 ? data.images[0] : undefined
                    });
                });
                setRequests(fetched);
            } catch (error) {
                console.error("Error fetching requests:", error);
            } finally {
                setLoading(false);
            }
        };

        const unsubscribe = navigation.addListener('focus', () => {
            fetchRequests();
        });

        return unsubscribe;
    }, [navigation, user]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Teklif Bekleniyor': return colors.secondary;
            case 'Onaylandı': return colors.primary;
            case 'Tamamlandı': return colors.textSecondary;
            default: return colors.textSecondary;
        }
    };

    const renderItem = ({ item }: { item: RequestItem }) => (
        <TouchableOpacity
            style={[styles.card, { borderLeftColor: getStatusColor(item.status) }]}
            activeOpacity={0.7}
            onPress={() => item.status === 'Tamamlandı'
                ? (navigation as any).navigate('ReviewProvider', { reqId: item.id })
                : (navigation as any).navigate('RequestDetail', { reqId: item.id })}
        >
            <View style={styles.cardContentRow}>
                {item.imageUrl && (
                    <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} />
                )}
                <View style={styles.cardMainContent}>
                    <View style={styles.cardHeader}>
                        <View style={styles.categoryContainer}>
                            <Icon name="pricetag-outline" size={14} color={colors.primary} style={{ marginRight: 4 }} />
                            <Text style={styles.category}>{item.category}</Text>
                        </View>
                        <Text style={styles.date}>{item.date}</Text>
                    </View>
                    <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                </View>
            </View>

            <View style={styles.cardFooter}>
                <View style={styles.statusBadge}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>

                {item.status === 'Tamamlandı' ? (
                    <View style={styles.actionRow}>
                        <Text style={styles.actionText}>Değerlendir</Text>
                        <Icon name="arrow-forward" size={16} color={colors.primary} />
                    </View>
                ) : (
                    <Icon name="chevron-forward" size={18} color={colors.textSecondary} />
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <Text style={styles.screenTitle}>Taleplerim</Text>
            <FlatList
                data={requests}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={{ flex: 1 }}>
                        {loading ? (
                            <RequestSkeleton />
                        ) : (
                            <EmptyState
                                icon="document-text-outline"
                                title="Talep Bulunamadı"
                                message="Henüz bir hizmet talebiniz bulunmuyor. Yeni bir kayıt oluşturarak hizmet almaya başlayabilirsiniz."
                                color={colors.primary}
                            />
                        )}
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    screenTitle: {
        ...typography.header,
        color: colors.text,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
        paddingBottom: spacing.sm,
    },
    listContent: {
        padding: spacing.md,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderLeftWidth: 5,
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 4,
    },
    cardContentRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    thumbnail: {
        width: 64,
        height: 64,
        borderRadius: 12,
        marginRight: spacing.md,
        backgroundColor: colors.border,
    },
    cardMainContent: {
        flex: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xs,
    },
    categoryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: `${colors.primary}10`,
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: 12,
    },
    category: {
        ...typography.caption,
        color: colors.primary,
        fontWeight: 'bold',
    },
    date: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    title: {
        ...typography.title,
        color: colors.text,
        fontSize: 18,
        marginBottom: spacing.md,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: spacing.sm,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: spacing.xs,
    },
    statusText: {
        ...typography.caption,
        color: colors.text,
        fontWeight: '600',
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionText: {
        color: colors.primary,
        fontWeight: 'bold',
        marginRight: 4,
    },
    emptyContainer: {
        padding: spacing.xl,
        alignItems: 'center',
    },
    emptyText: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
    }
});
