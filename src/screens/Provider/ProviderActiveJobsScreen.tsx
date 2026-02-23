import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography } from '../../theme/theme';
import Icon from 'react-native-vector-icons/Ionicons';
import { db } from '../../services/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useAppStore } from '../../store/useAppStore';

export function ProviderActiveJobsScreen() {
    const navigation = useNavigation();
    const { user } = useAppStore();

    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            if (!user) return;
            setLoading(true);
            try {
                // Fetch offers that have been accepted for this provider
                const q = query(
                    collection(db, 'offers'),
                    where('providerId', '==', user.uid),
                    where('status', 'in', ['accepted', 'completed']) // Also show completed ones
                );

                const querySnapshot = await getDocs(q);
                const fetchedJobs: any[] = [];

                for (const offerDoc of querySnapshot.docs) {
                    const offerData = offerDoc.data();
                    let requestDetails: any = { title: 'Bilinmeyen İş', location: 'Bilinmeyen', category: '', status: offerData.status };

                    if (offerData.requestId) {
                        const reqDoc = await getDoc(doc(db, 'serviceRequests', offerData.requestId));
                        if (reqDoc.exists()) {
                            const rData = reqDoc.data();
                            requestDetails = {
                                title: rData.title || rData.category,
                                location: 'Yakınınızda', // Will be real GPS data later
                                category: rData.category,
                                status: rData.status === 'completed' ? 'Tamamlandı' : 'Onaylandı',
                                imageUrl: rData.images && rData.images.length > 0 ? rData.images[0] : undefined
                            };
                        }
                    }

                    // Look for the chat ID for easy navigation
                    let chatId = null;
                    const cQ = query(
                        collection(db, 'chats'),
                        where('offerId', '==', offerDoc.id)
                    );
                    const cSnapshot = await getDocs(cQ);
                    if (!cSnapshot.empty) {
                        chatId = cSnapshot.docs[0].id;
                    }

                    fetchedJobs.push({
                        id: offerDoc.id,
                        price: offerData.price + ' TL',
                        date: new Date(offerData.createdAt).toLocaleDateString('tr-TR'),
                        chatId,
                        ...requestDetails
                    });
                }

                setJobs(fetchedJobs);
            } catch (error) {
                console.error("Error fetching active jobs:", error);
            } finally {
                setLoading(false);
            }
        };

        const unsubscribe = navigation.addListener('focus', fetchJobs);
        return unsubscribe;
    }, [navigation, user]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Onaylandı': return colors.primary;
            case 'Tamamlandı': return colors.secondary;
            default: return colors.textSecondary;
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.card, { borderLeftColor: getStatusColor(item.status) }]}
            activeOpacity={0.7}
            onPress={() => item.chatId ? (navigation as any).navigate('Chat', { chatId: item.chatId, reqId: item.id }) : null}
        >
            <View style={styles.cardContentRow}>
                {item.imageUrl && (
                    <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} />
                )}
                <View style={styles.cardMainContent}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.date}>{item.date}</Text>
                        <Text style={styles.price}>{item.price}</Text>
                    </View>
                    <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                    <View style={styles.locationRow}>
                        <Icon name="location-outline" size={14} color={colors.textSecondary} />
                        <Text style={styles.locationText}>{item.location}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.statusBadge}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
                <Text style={styles.statusText}>{item.status}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <Text style={styles.screenTitle}>Görevlerim</Text>
            <FlatList
                data={jobs}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        {loading ? (
                            <ActivityIndicator size="large" color={colors.primary} />
                        ) : (
                            <Text style={styles.emptyText}>Aktif veya geçmiş işiniz bulunmuyor.</Text>
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
    date: {
        ...typography.caption,
        color: colors.secondary,
        fontWeight: '600',
    },
    price: {
        ...typography.title,
        color: colors.primary,
    },
    title: {
        ...typography.title,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    locationText: {
        ...typography.caption,
        color: colors.textSecondary,
        marginLeft: 4,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.border,
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
        fontWeight: '500',
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
