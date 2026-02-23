import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { colors, metrics, spacing, typography } from '../../theme/theme';
import { useLocation } from '../../hooks/useLocation';
import { EmptyState } from '../../components/EmptyState';
import { db } from '../../services/firebase';
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { useAppStore } from '../../store/useAppStore';

export const DashboardScreen = () => {
    const navigation = useNavigation();
    const { user } = useAppStore();

    // Yükleme sırasında konum izni de tetiklenecek
    useLocation();

    const [requests, setRequests] = React.useState<any[]>([]);
    const [providerData, setProviderData] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user) return;
            setLoading(true);
            try {
                // 1. Fetch Provider Profile Data
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    setProviderData(userDoc.data());
                }
                // Fetch up to 20 recent requests that are generally open
                const q = query(
                    collection(db, 'serviceRequests'),
                    where('status', '==', 'open'),
                    orderBy('createdAt', 'desc'),
                    limit(20)
                );

                const querySnapshot = await getDocs(q);
                const fetched: any[] = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    fetched.push({
                        id: doc.id,
                        category: data.category || 'Belirtilmemiş',
                        title: data.title || 'Yeni Talep',
                        distance: 'Yakınınızda', // Needs geo-logic later
                        customer: 'Müşteri',
                        time: new Date(data.createdAt).toLocaleDateString('tr-TR'),
                        imageUrl: data.images && data.images.length > 0 ? data.images[0] : undefined,
                        ...data
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
            fetchDashboardData();
        });

        return unsubscribe;
    }, [navigation]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <View style={styles.statsContainer}>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>₺{providerData?.earnings?.toLocaleString('tr-TR') || '0'}</Text>
                        <Text style={styles.statLabel}>Aylık Kazanç</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{providerData?.rating?.toFixed(1) || '0.0'}</Text>
                        <Text style={styles.statLabel}>Ort. Puan</Text>
                    </View>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Bölgemdeki Yeni Talepler</Text>
                </View>

                {loading ? (
                    <Text style={{ textAlign: 'center', padding: spacing.md, color: colors.textSecondary }}>Talepler yükleniyor...</Text>
                ) : requests.length === 0 ? (
                    <EmptyState
                        icon="search-outline"
                        title="Yeni Talep Yok"
                        message="Şu an bölgenizde açık bir hizmet talebi bulunmuyor. Yeni talepler geldiğinde burada görünecek."
                        color={colors.primary}
                    />
                ) : requests.map(req => (
                    <TouchableOpacity
                        key={req.id}
                        style={styles.requestCard}
                        activeOpacity={0.7}
                        onPress={() => (navigation as any).navigate('ProviderRequestDetail', { reqId: req.id })}
                    >
                        <View style={styles.cardContentRow}>
                            {req.imageUrl && (
                                <Image source={{ uri: req.imageUrl }} style={styles.thumbnail} />
                            )}
                            <View style={styles.cardMainContent}>
                                <View style={styles.requestHeader}>
                                    <View style={styles.categoryContainer}>
                                        <Icon name="pricetag-outline" size={14} color={colors.primary} style={{ marginRight: 4 }} />
                                        <Text style={styles.categoryText}>{req.category}</Text>
                                    </View>
                                    <Text style={styles.requestTime}>{req.time}</Text>
                                </View>
                                <Text style={styles.requestTitle} numberOfLines={2}>{req.title}</Text>
                            </View>
                        </View>

                        <View style={styles.requestFooter}>
                            <View style={styles.userRow}>
                                <Icon name="person-circle-outline" size={16} color={colors.textSecondary} style={{ marginRight: 4 }} />
                                <Text style={styles.requestUser}>{req.customer}</Text>
                                <Text style={styles.dotSeparator}>•</Text>
                                <Text style={styles.requestDistance}>{req.distance}</Text>
                            </View>
                            <Icon name="chevron-forward" size={18} color={colors.textSecondary} />
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: {
        flex: 1,
    },
    content: {
        padding: spacing.md,
    },
    statsContainer: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    statBox: {
        flex: 1,
        backgroundColor: colors.surface,
        padding: spacing.lg,
        borderRadius: metrics.borderRadius,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    statValue: {
        ...typography.header,
        color: colors.secondary,
        marginBottom: spacing.xs,
    },
    statLabel: {
        ...typography.caption,
    },
    sectionHeader: {
        marginBottom: spacing.md,
    },
    sectionTitle: {
        ...typography.title,
        color: colors.text,
    },
    requestCard: {
        backgroundColor: colors.surface,
        padding: spacing.lg,
        borderRadius: 16,
        marginBottom: spacing.md,
        borderLeftWidth: 5,
        borderLeftColor: colors.secondary,
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
    requestHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    categoryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: `${colors.primary}10`,
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: 12,
    },
    categoryText: {
        ...typography.caption,
        color: colors.primary,
        fontWeight: 'bold',
    },
    requestTitle: {
        ...typography.title,
        color: colors.text,
        fontSize: 18,
        marginBottom: spacing.md,
    },
    requestTime: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    requestFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: spacing.sm,
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dotSeparator: {
        color: colors.textSecondary,
        marginHorizontal: 6,
    },
    requestUser: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    requestDistance: {
        ...typography.caption,
        color: colors.primary,
        fontWeight: '600',
    },
});
