import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { colors, spacing, typography } from '../../theme/theme';
import { Button } from '../../components/Button';
import Icon from 'react-native-vector-icons/Ionicons';
import { db } from '../../services/firebase';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, addDoc } from 'firebase/firestore';
import { useAppStore } from '../../store/useAppStore';

type ParamList = {
    RequestDetail: {
        reqId: string;
    };
};

export function RequestDetailScreen() {
    const route = useRoute<RouteProp<ParamList, 'RequestDetail'>>();
    const { reqId } = route.params;
    const navigation = useNavigation();
    const { user } = useAppStore();

    const [requestData, setRequestData] = useState<any>(null);
    const [offers, setOffers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState(false);

    useEffect(() => {
        const fetchRequestAndOffers = async () => {
            if (!reqId) return;
            setLoading(true);
            try {
                // 1. Fetch request details
                const reqDoc = await getDoc(doc(db, 'serviceRequests', reqId));
                if (reqDoc.exists()) {
                    setRequestData(reqDoc.data());
                }

                // 2. Fetch all offers for this request
                const offersQuery = query(
                    collection(db, 'offers'),
                    where('requestId', '==', reqId)
                );

                const offersSnapshot = await getDocs(offersQuery);
                const fetchedOffers: any[] = [];

                for (const offerDoc of offersSnapshot.docs) {
                    const offerData = offerDoc.data();

                    // Only show pending, accepted, or completed
                    if (!['pending', 'accepted', 'completed'].includes(offerData.status)) continue;

                    // Fetch provider details to show name, rating etc.
                    let providerDetails = { name: 'İsimsiz Usta', rating: 0, completedJobs: 0 };
                    if (offerData.providerId) {
                        const provDoc = await getDoc(doc(db, 'users', offerData.providerId));
                        if (provDoc.exists()) {
                            const pData = provDoc.data();
                            providerDetails = {
                                name: pData.name || pData.phone || 'İsimsiz Usta',
                                rating: pData.rating || 0,
                                completedJobs: pData.completedJobs || 0
                            };
                        }
                    }

                    // Look for chat id if accepted or completed
                    let chatId = null;
                    if (offerData.status === 'accepted' || offerData.status === 'completed') {
                        const cQ = query(collection(db, 'chats'), where('offerId', '==', offerDoc.id));
                        const cSnap = await getDocs(cQ);
                        if (!cSnap.empty) {
                            chatId = cSnap.docs[0].id;
                        }
                    }

                    fetchedOffers.push({
                        id: offerDoc.id,
                        ...offerData,
                        providerInfo: providerDetails,
                        chatId
                    });
                }

                setOffers(fetchedOffers);

            } catch (error) {
                console.error("Error fetching request/offers:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRequestAndOffers();
    }, [reqId]);

    const handleAcceptOffer = (offer: any) => {
        Alert.alert(
            "Teklifi Onayla",
            `${offer.providerInfo.name} usta ile çalışmak istediğinize emin misiniz?`,
            [
                { text: "Vazgeç", style: "cancel" },
                { text: "Evet, Onayla", onPress: () => confirmAcceptOffer(offer) }
            ]
        );
    };

    const confirmAcceptOffer = async (offer: any) => {
        if (!user) return;
        setAccepting(true);
        try {
            // 1. Update the offer status
            await updateDoc(doc(db, 'offers', offer.id), { status: 'accepted' });

            // 2. Update the request status
            await updateDoc(doc(db, 'serviceRequests', reqId), { status: 'accepted' });

            // 3. Create a chat document
            await addDoc(collection(db, 'chats'), {
                requestId: reqId,
                customerId: user.uid,
                providerId: offer.providerId,
                offerId: offer.id,
                createdAt: new Date().toISOString(),
                lastMessage: '',
                lastMessageTime: new Date().toISOString(),
            });

            Alert.alert("Başarılı", "Teklif onaylandı! Hizmet veren sizinle iletişime geçecek.");
            navigation.goBack();
        } catch (error) {
            console.error("Error accepting offer:", error);
            Alert.alert("Hata", "Teklif onaylanırken bir sorun oluştu.");
        } finally {
            setAccepting(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </SafeAreaView>
        );
    }

    if (!requestData) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: colors.textSecondary }}>Talep detayları bulunamadı.</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.category}>{requestData.category || 'Belirtilmemiş'}</Text>
                        <Text style={styles.date}>{requestData.createdAt ? new Date(requestData.createdAt).toLocaleDateString('tr-TR') : ''}</Text>
                    </View>
                    <Text style={styles.title}>{requestData.title || requestData.category}</Text>
                    <Text style={styles.description}>
                        {requestData.description || 'Açıklama bulunmuyor.'}
                    </Text>

                    {/* DYNAMIC DETAILS DISPLAY */}
                    {requestData.dynamicDetails && Object.keys(requestData.dynamicDetails).length > 0 && (
                        <View style={styles.dynamicDetailsContainer}>
                            <Text style={styles.dynamicTitle}>Detaylar:</Text>
                            <View style={styles.dynamicTagsRow}>
                                {Object.entries(requestData.dynamicDetails).map(([key, value]) => {
                                    if (!value) return null;
                                    // Make key user friendly if needed, or simply display it directly
                                    const formattedKey = key.replace(/([A-Z])/g, ' $1').trim();
                                    return (
                                        <View key={key} style={styles.dynamicTag}>
                                            <Icon name="checkmark-circle-outline" size={14} color={colors.primary} />
                                            <Text style={styles.dynamicTagText}>
                                                <Text style={{ fontWeight: '700' }}>{formattedKey}:</Text> {String(value)}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    )}

                    {/* IMAGES DISPLAY */}
                    {requestData.images && requestData.images.length > 0 && (
                        <View style={styles.imageGalleryContainer}>
                            <Text style={styles.imageGalleryTitle}>Eklenen Fotoğraflar:</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {requestData.images.map((url: string, index: number) => (
                                    <Image key={index} source={{ uri: url }} style={styles.galleryImage} />
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    <View style={styles.statusBadge}>
                        <View style={[styles.statusDot, { backgroundColor: requestData.status === 'open' ? colors.secondary : colors.primary }]} />
                        <Text style={styles.statusText}>
                            {requestData.status === 'open' ? 'Teklif Bekleniyor' :
                                requestData.status === 'offered' ? 'Teklif Geldi' :
                                    requestData.status === 'accepted' ? 'Onaylandı' : 'Bilinmiyor'}
                        </Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Gelen Teklifler ({offers.length})</Text>

                {offers.length === 0 && (
                    <Text style={{ color: colors.textSecondary }}>Henüz teklif bulunmuyor.</Text>
                )}

                {offers.map(offer => (
                    <View key={offer.id} style={styles.offerCard}>
                        <View style={styles.offerHeader}>
                            <View>
                                {/* We can navigate to public provider profile later */}
                                <Text style={[styles.providerName, { color: colors.primary }]}>
                                    {offer.providerInfo.name}
                                </Text>
                                <View style={styles.ratingRow}>
                                    <Icon name="star" size={14} color="#FFD700" />
                                    <Text style={styles.rating}>{offer.providerInfo.rating.toFixed(1)} ({offer.providerInfo.completedJobs} iş)</Text>
                                </View>
                            </View>
                            <Text style={styles.price}>{offer.price} TL</Text>
                        </View>
                        <Text style={styles.offerMessage}>"{offer.message}"</Text>

                        {(requestData.status === 'open' || requestData.status === 'offered') && offer.status === 'pending' && (
                            <Button
                                title="Teklifi Kabul Et"
                                onPress={() => handleAcceptOffer(offer)}
                                style={styles.acceptButton}
                                loading={accepting}
                                disabled={accepting}
                            />
                        )}

                        {(offer.status === 'accepted' || offer.status === 'completed') && offer.chatId && (
                            <Button
                                title="Mesajlara Git"
                                onPress={() => (navigation as any).navigate('Chat', { chatId: offer.chatId, reqId })}
                                style={styles.acceptButton}
                            />
                        )}
                    </View>
                ))}

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        padding: spacing.md,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: spacing.md,
        marginBottom: spacing.lg,
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xs,
    },
    category: {
        ...typography.caption,
        color: colors.primary,
        fontWeight: '600',
    },
    date: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    title: {
        ...typography.title,
        color: colors.text,
        marginBottom: spacing.sm,
    },
    description: {
        ...typography.body,
        color: colors.text,
        marginBottom: spacing.sm,
        lineHeight: 20,
    },
    dynamicDetailsContainer: {
        backgroundColor: `${colors.primary}08`,
        borderRadius: 8,
        padding: spacing.md,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: `${colors.primary}20`,
    },
    dynamicTitle: {
        ...typography.caption,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: spacing.xs,
    },
    dynamicTagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    dynamicTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    dynamicTagText: {
        ...typography.caption,
        color: colors.textSecondary,
        marginLeft: 4,
    },
    imageGalleryContainer: {
        marginTop: spacing.md,
        marginBottom: spacing.md,
    },
    imageGalleryTitle: {
        ...typography.caption,
        fontWeight: 'bold',
        color: colors.textSecondary,
        marginBottom: spacing.sm,
    },
    galleryImage: {
        width: 120,
        height: 120,
        borderRadius: 8,
        marginRight: spacing.sm,
        backgroundColor: colors.border,
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
    sectionTitle: {
        ...typography.title,
        color: colors.text,
        marginBottom: spacing.md,
    },
    offerCard: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: spacing.md,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    offerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.sm,
    },
    providerName: {
        ...typography.body,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 2,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rating: {
        ...typography.caption,
        color: colors.textSecondary,
        marginLeft: 4,
    },
    price: {
        ...typography.title,
        color: colors.primary,
    },
    offerMessage: {
        ...typography.body,
        color: colors.textSecondary,
        fontStyle: 'italic',
        marginBottom: spacing.md,
    },
    acceptButton: {
        marginTop: spacing.sm,
    },
});
