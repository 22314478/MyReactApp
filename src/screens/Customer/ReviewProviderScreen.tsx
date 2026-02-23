import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { colors, spacing, typography, metrics } from '../../theme/theme';
import Icon from 'react-native-vector-icons/Ionicons';
import { Button } from '../../components/Button';
import { db } from '../../services/firebase';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, addDoc } from 'firebase/firestore';
import { useAppStore } from '../../store/useAppStore';

type ParamList = {
    ReviewProvider: {
        reqId: string;
    };
};

export function ReviewProviderScreen() {
    const route = useRoute<RouteProp<ParamList, 'ReviewProvider'>>();
    const { reqId } = route.params;
    const navigation = useNavigation();
    const { user } = useAppStore();

    const [providerData, setProviderData] = useState<any>(null);
    const [requestData, setRequestData] = useState<any>(null);
    const [offerData, setOfferData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (!reqId) return;
            setLoading(true);
            try {
                // Fetch request
                const rDoc = await getDoc(doc(db, 'serviceRequests', reqId));
                if (rDoc.exists()) setRequestData(rDoc.data());

                // Fetch the completed offer
                const oQ = query(collection(db, 'offers'), where('requestId', '==', reqId), where('status', 'in', ['accepted', 'completed']));
                const oSnap = await getDocs(oQ);
                if (!oSnap.empty) {
                    const oData = oSnap.docs[0].data();
                    setOfferData(oData);

                    // Fetch provider
                    if (oData.providerId) {
                        const pDoc = await getDoc(doc(db, 'users', oData.providerId));
                        if (pDoc.exists()) {
                            setProviderData({ id: pDoc.id, ...pDoc.data() });
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching review data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [reqId]);

    const handleSubmit = async () => {
        if (rating === 0) {
            Alert.alert('Hata', 'Lütfen 1 ile 5 arasında bir puan verin.');
            return;
        }
        if (!user || !providerData) return;

        setSubmitting(true);
        try {
            // 1. Create a review document
            await addDoc(collection(db, 'reviews'), {
                requestId: reqId,
                customerId: user.uid,
                providerId: providerData.id,
                rating,
                reviewText,
                createdAt: new Date().toISOString()
            });

            // 2. Update Provider's stats
            const currentJobs = providerData.completedJobs || 0;
            const currentRating = providerData.rating || 0;
            const newJobsCount = currentJobs + 1;
            const newRating = ((currentRating * currentJobs) + rating) / newJobsCount;

            await updateDoc(doc(db, 'users', providerData.id), {
                completedJobs: newJobsCount,
                rating: newRating
            });

            Alert.alert(
                "Değerlendirme Gönderildi",
                "Geri bildiriminiz için teşekkür ederiz!",
                [{ text: "Tamam", onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            console.error("Error submitting review:", error);
            Alert.alert("Hata", "Değerlendirme gönderilirken bir hata oluştu.");
        } finally {
            setSubmitting(false);
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
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                <View style={styles.header}>
                    <Text style={styles.title}>Hizmeti Değerlendir</Text>
                    <Text style={styles.subtitle}>{providerData?.name || providerData?.phone || 'İsimsiz Usta'} - {requestData?.title || requestData?.category || 'İş'}</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Puanınız</Text>
                    <View style={styles.starsContainer}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity
                                key={star}
                                onPress={() => setRating(star)}
                                style={styles.starButton}
                            >
                                <Icon
                                    name={star <= rating ? "star" : "star-outline"}
                                    size={40}
                                    color={star <= rating ? "#FFD700" : colors.border}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                    <Text style={styles.ratingText}>
                        {rating === 0 ? 'Puan verin' : `${rating} Yıldız`}
                    </Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Yorumunuz</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Hizmetten memnun kaldınız mı? Neler iyiydi, neler geliştirilmeli?"
                        placeholderTextColor={colors.textSecondary}
                        multiline
                        numberOfLines={5}
                        textAlignVertical="top"
                        value={reviewText}
                        onChangeText={setReviewText}
                    />
                </View>

                <Button
                    title="Değerlendirmeyi Gönder"
                    onPress={handleSubmit}
                    style={styles.submitButton}
                    loading={submitting}
                    disabled={submitting || rating === 0}
                />
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
        padding: spacing.lg,
    },
    header: {
        marginBottom: spacing.xl,
        alignItems: 'center',
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
    card: {
        backgroundColor: colors.surface,
        padding: spacing.lg,
        borderRadius: metrics.borderRadius,
        marginBottom: spacing.xl,
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    cardTitle: {
        ...typography.title,
        color: colors.text,
        marginBottom: spacing.lg,
        textAlign: 'center',
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    starButton: {
        paddingHorizontal: spacing.xs,
    },
    ratingText: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
        fontWeight: '500',
    },
    textInput: {
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: metrics.borderRadius,
        padding: spacing.md,
        ...typography.body,
        color: colors.text,
        minHeight: 120,
    },
    submitButton: {
        marginTop: spacing.md,
    }
});
