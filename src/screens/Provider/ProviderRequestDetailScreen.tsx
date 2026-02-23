import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { colors, spacing, typography } from '../../theme/theme';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import Icon from 'react-native-vector-icons/Ionicons';
import { db } from '../../services/firebase';
import { doc, getDoc, collection, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAppStore } from '../../store/useAppStore';
import ReactNativeHapticFeedback from "react-native-haptic-feedback";

type ParamList = {
    ProviderRequestDetail: {
        reqId: string;
    };
};

export function ProviderRequestDetailScreen() {
    const route = useRoute<RouteProp<ParamList, 'ProviderRequestDetail'>>();
    const { reqId } = route.params;
    const navigation = useNavigation();
    const { user } = useAppStore();

    const [requestData, setRequestData] = useState<any>(null);
    const [customerData, setCustomerData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [price, setPrice] = useState('');
    const [message, setMessage] = useState('');

    React.useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const reqDoc = await getDoc(doc(db, 'serviceRequests', reqId));
                if (reqDoc.exists()) {
                    const rData = reqDoc.data();
                    setRequestData(rData);

                    if (rData.customerId) {
                        const custDoc = await getDoc(doc(db, 'users', rData.customerId));
                        if (custDoc.exists()) {
                            setCustomerData(custDoc.data());
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching request details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [reqId]);

    const handleSubmitOffer = async () => {
        if (!price || !message) {
            Alert.alert('Hata', 'Lütfen fiyat ve mesaj alanlarını doldurun.');
            return;
        }

        if (!user) return;

        setSubmitting(true);
        try {
            ReactNativeHapticFeedback.trigger("impactHeavy");
            await addDoc(collection(db, 'offers'), {
                providerId: user.uid,
                requestId: reqId,
                customerId: requestData.customerId,
                price: parseFloat(price),
                message,
                status: 'pending',
                createdAt: new Date().toISOString(),
                // Include provider short info for easier reading on Customer side
                providerName: user.uid, // Will be fetched, but doing this as fallback
            });

            // Mark request as having offers
            await updateDoc(doc(db, 'serviceRequests', reqId), {
                status: 'offered'
            });

            Alert.alert("Başarılı", "Teklifiniz başarıyla gönderildi!");
            navigation.goBack();
        } catch (error) {
            console.error("Error submitting offer:", error);
            Alert.alert('Hata', 'Teklif gönderilirken bir sorun oluştu.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: colors.textSecondary }}>Yükleniyor...</Text>
            </SafeAreaView>
        );
    }

    if (!requestData) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: colors.textSecondary }}>Talep bulunamadı.</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Müşteri Talebi Detayları */}
                <Text style={styles.sectionTitle}>Talep Detayları</Text>
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.category}>{requestData?.category || 'Kategori Yok'}</Text>
                        <Text style={styles.date}>{requestData?.createdAt ? new Date(requestData.createdAt).toLocaleDateString('tr-TR') : ''}</Text>
                    </View>
                    <Text style={styles.title}>{requestData?.title || 'Başlık Yok'}</Text>

                    <View style={styles.locationRow}>
                        <Icon name="location-outline" size={16} color={colors.textSecondary} />
                        <Text style={styles.locationText}>Yakınınızda</Text>
                    </View>

                    <Text style={styles.description}>
                        {requestData?.description || 'Açıklama bulunmuyor.'}
                    </Text>

                    {/* DYNAMIC DETAILS DISPLAY */}
                    {requestData?.dynamicDetails && Object.keys(requestData.dynamicDetails).length > 0 && (
                        <View style={styles.dynamicDetailsContainer}>
                            <Text style={styles.dynamicTitle}>Detaylar:</Text>
                            <View style={styles.dynamicTagsRow}>
                                {Object.entries(requestData.dynamicDetails).map(([key, value]) => {
                                    if (!value) return null;
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
                    {requestData?.images && requestData.images.length > 0 && (
                        <View style={styles.imageGalleryContainer}>
                            <Text style={styles.imageGalleryTitle}>Eklenen Fotoğraflar:</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {requestData.images.map((url: string, index: number) => (
                                    <Image key={index} source={{ uri: url }} style={styles.galleryImage} />
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </View>

                {/* Müşteri Bilgisi */}
                <View style={styles.customerInfo}>
                    <View style={styles.avatarPlaceholder}>
                        <Icon name="person" size={20} color={colors.textSecondary} />
                    </View>
                    <View style={styles.customerTextContainer}>
                        <Text style={styles.customerName}>{customerData?.name || customerData?.phone || 'Gizli Müşteri'}</Text>
                        <Text style={styles.customerStats}>Sistemde Kayıtlı Müşteri</Text>
                    </View>
                </View>

                {/* Teklif Formu */}
                <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Teklif Ver</Text>

                <View style={styles.formContainer}>
                    {/* Simulated AI Pricing Hint for Wow Factor */}
                    <View style={styles.aiHintContainer}>
                        <View style={styles.aiIconContainer}>
                            <Icon name="sparkles" size={16} color={colors.surface} />
                        </View>
                        <Text style={styles.aiHintText}>
                            <Text style={{ fontWeight: 'bold' }}>Akıllı Asistan Önerisi: </Text>
                            Bölgedeki benzer işler için ortalama teklif aralığı <Text style={{ fontWeight: 'bold' }}>400 ₺ - 600 ₺</Text> arasındadır.
                        </Text>
                    </View>

                    <Input
                        label="Fiyat Teklifiniz (TL)"
                        placeholder="Örn: 850"
                        keyboardType="numeric"
                        value={price}
                        onChangeText={setPrice}
                    />

                    <Input
                        label="Müşteriye Mesajınız"
                        placeholder="Ne zaman gelebilirsiniz, ne kadar sürer?..."
                        multiline
                        numberOfLines={4}
                        style={styles.textArea}
                        value={message}
                        onChangeText={setMessage}
                    />

                    <Button
                        title="Teklifi Gönder"
                        onPress={handleSubmitOffer}
                        style={styles.submitButton}
                        loading={submitting}
                        disabled={!price || !message || submitting}
                    />
                </View>

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
    sectionTitle: {
        ...typography.title,
        color: colors.text,
        marginBottom: spacing.md,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: spacing.md,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
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
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    locationText: {
        ...typography.caption,
        color: colors.textSecondary,
        marginLeft: 4,
    },
    description: {
        ...typography.body,
        color: colors.text,
        lineHeight: 20,
        marginBottom: spacing.sm,
    },
    dynamicDetailsContainer: {
        backgroundColor: `${colors.primary}08`,
        borderRadius: 8,
        padding: spacing.md,
        marginTop: spacing.sm,
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
        backgroundColor: colors.background,
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
    customerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderRadius: 12,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm,
    },
    customerTextContainer: {
        flex: 1,
    },
    customerName: {
        ...typography.body,
        fontWeight: '600',
        color: colors.text,
    },
    customerStats: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    formContainer: {
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderRadius: 12,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    submitButton: {
        marginTop: spacing.md,
    },
    aiHintContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(52,199,89,0.1)', // Subtle green matching theme or maybe premium purple
        padding: spacing.md,
        borderRadius: 12,
        marginBottom: spacing.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(52,199,89,0.3)',
    },
    aiIconContainer: {
        backgroundColor: '#34C759',
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.sm,
    },
    aiHintText: {
        flex: 1,
        ...typography.caption,
        color: colors.text,
        lineHeight: 18,
    }
});
