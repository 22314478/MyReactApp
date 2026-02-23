import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, metrics } from '../../theme/theme';
import Icon from 'react-native-vector-icons/Ionicons';
import { Button } from '../../components/Button';

// Mock data
const MOCK_PROVIDER = {
    id: 'p1',
    name: 'Ahmet Usta',
    category: 'Tamirat & Kombi Bakımı',
    rating: 4.8,
    reviewsCount: 142,
    about: '15 yıllık tecrübemle İstanbul genelinde kombi bakımı, su tesisatı ve kaba tamirat işlerini özenle yapıyorum. Müşteri memnuniyeti her zaman önceliğimdir.',
    completedJobs: 320,
    reviews: [
        { id: '1', customer: 'Ayşe Y.', rating: 5, date: '12 Eki 2023', text: 'Çok hızlı geldi ve sorunu hemen çözdü. Teşekkürler.' },
        { id: '2', customer: 'Burak T.', rating: 4, date: '05 Eki 2023', text: 'İşçiliği güzel ama randevuya 15 dk geç kaldı.' },
        { id: '3', customer: 'Kadir S.', rating: 5, date: '28 Eyl 2023', text: 'Kombi anakart arızasını uygun fiyata halletti, tavsiye ederim.' },
    ]
};

export function ProviderProfileViewScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    // In a real app we would use route.params.providerId to fetch data from Firestore

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Profile Header */}
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <Icon name="person" size={50} color={colors.textSecondary} />
                    </View>
                    <Text style={styles.name}>{MOCK_PROVIDER.name}</Text>
                    <Text style={styles.category}>{MOCK_PROVIDER.category}</Text>

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

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Icon name="star" size={16} color="#FFD700" />
                            <Text style={styles.statValue}>{MOCK_PROVIDER.rating}</Text>
                            <Text style={styles.statLabel}>({MOCK_PROVIDER.reviewsCount} Yorum)</Text>
                        </View>
                        <View style={[styles.statItem, styles.statDivider]}>
                            <Icon name="checkmark-circle-outline" size={16} color={colors.primary} />
                            <Text style={styles.statValue}>{MOCK_PROVIDER.completedJobs}</Text>
                            <Text style={styles.statLabel}>Tamamlanan İş</Text>
                        </View>
                    </View>
                </View>

                {/* About Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Hakkında</Text>
                    <Text style={styles.aboutText}>{MOCK_PROVIDER.about}</Text>
                </View>

                {/* Detailed Ratings */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Değerlendirme Detayları</Text>
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

                {/* Reviews Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Müşteri Yorumları</Text>

                    {MOCK_PROVIDER.reviews.map(review => (
                        <View key={review.id} style={styles.reviewCard}>
                            <View style={styles.reviewHeader}>
                                <Text style={styles.reviewCustomer}>{review.customer}</Text>
                                <Text style={styles.reviewDate}>{review.date}</Text>
                            </View>
                            <View style={styles.ratingStars}>
                                {[1, 2, 3, 4, 5].map(star => (
                                    <Icon
                                        key={star.toString()}
                                        name="star"
                                        size={14}
                                        color={star <= review.rating ? "#FFD700" : colors.border}
                                    />
                                ))}
                            </View>
                            <Text style={styles.reviewText}>{review.text}</Text>
                        </View>
                    ))}
                </View>

                <Button
                    title="Geri Dön"
                    variant="outline"
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
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
        padding: spacing.md,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xl,
        backgroundColor: colors.surface,
        padding: spacing.lg,
        borderRadius: metrics.borderRadius,
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    avatarContainer: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    name: {
        ...typography.header,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    category: {
        ...typography.body,
        color: colors.primary,
        fontWeight: '500',
        marginBottom: spacing.lg,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: spacing.md,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        borderLeftWidth: 1,
        borderLeftColor: colors.border,
    },
    statValue: {
        ...typography.title,
        color: colors.text,
        marginTop: 4,
    },
    statLabel: {
        ...typography.caption,
        color: colors.textSecondary,
        marginTop: 2,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        ...typography.title,
        color: colors.text,
        marginBottom: spacing.md,
    },
    aboutText: {
        ...typography.body,
        color: colors.textSecondary,
        lineHeight: 22,
    },
    reviewCard: {
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderRadius: metrics.borderRadius,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    reviewCustomer: {
        ...typography.body,
        fontWeight: '600',
        color: colors.text,
    },
    reviewDate: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    ratingStars: {
        flexDirection: 'row',
        marginBottom: spacing.sm,
    },
    reviewText: {
        ...typography.body,
        color: colors.text,
        lineHeight: 20,
    },
    backButton: {
        marginBottom: spacing.xl,
        marginTop: spacing.md,
    },
    badgesRow: {
        flexDirection: 'row',
        marginBottom: spacing.md,
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
    }
});
