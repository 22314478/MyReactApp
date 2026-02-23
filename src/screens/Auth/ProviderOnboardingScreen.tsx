import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, metrics } from '../../theme/theme';
import { Button } from '../../components/Button';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppStore } from '../../store/useAppStore';
import { db } from '../../services/firebase';
import { doc, setDoc } from 'firebase/firestore';

const CATEGORIES = ['Temizlik', 'Tamirat', 'Tesisat', 'Nakliye', 'Boya & Badana'];

export function ProviderOnboardingScreen() {
    const { user, setUserRole } = useAppStore();
    const [loading, setLoading] = useState(false);

    const [step, setStep] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [about, setAbout] = useState('');

    const handleNext = async () => {
        if (step === 1 && selectedCategory) {
            setStep(2);
        } else if (step === 2) {
            if (!user) {
                Alert.alert('Hata', 'Kullanıcı bulunamadı.');
                return;
            }

            setLoading(true);
            try {
                const userDocRef = doc(db, 'users', user.uid);
                await setDoc(userDocRef, {
                    category: selectedCategory,
                    about: about.trim(),
                    role: 'provider',
                    rating: 0,
                    completedJobs: 0,
                    earnings: 0,
                    workingHours: '09:00 - 18:00', // Default
                    serviceAreas: ['Tüm İstanbul'] // Default
                }, { merge: true });
                setUserRole('provider');
            } catch (error: any) {
                console.error('Onboarding Error: ', error);
                Alert.alert('Hata', 'Bilgiler güncellenirken bir sorun oluştu.');
            } finally {
                setLoading(false);
            }
        }
    };

    const renderStepIndicators = () => (
        <View style={styles.indicatorContainer}>
            <View style={[styles.indicator, { backgroundColor: colors.primary }]} />
            <View style={[styles.indicator, { backgroundColor: step >= 2 ? colors.primary : colors.border }]} />
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => step === 2 ? setStep(1) : undefined} disabled={step === 1}>
                    <Icon name="arrow-back" size={24} color={step === 2 ? colors.text : 'transparent'} />
                </TouchableOpacity>
                {renderStepIndicators()}
                <View style={{ width: 24 }} /> {/* Spacer */}
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {step === 1 ? (
                    <>
                        <Text style={styles.title}>Uzmanlık Alanınız Nedir?</Text>
                        <Text style={styles.subtitle}>Müşterilerin sizi doğru kategoride bulabilmesi için hizmet verdiğiniz ana alanı seçin.</Text>

                        <View style={styles.optionsContainer}>
                            {CATEGORIES.map(cat => (
                                <TouchableOpacity
                                    key={cat}
                                    style={[
                                        styles.categoryCard,
                                        selectedCategory === cat && styles.categoryCardActive
                                    ]}
                                    onPress={() => setSelectedCategory(cat)}
                                >
                                    <View style={styles.categoryRadio}>
                                        {selectedCategory === cat && <View style={styles.categoryRadioActive} />}
                                    </View>
                                    <Text style={[
                                        styles.categoryText,
                                        selectedCategory === cat && styles.categoryTextActive
                                    ]}>{cat}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </>
                ) : (
                    <>
                        <Text style={styles.title}>Kendinizi Tanıtın</Text>
                        <Text style={styles.subtitle}>Müşterilerin sizi tanıyabilmesi için kısa bir açıklama ve özgeçmiş yazın.</Text>

                        <Text style={[styles.subtitle, { marginBottom: 8, color: colors.text, fontWeight: 'bold' }]}>Deneyim ve Hizmet Özeti</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Örn: 10 yıllık tecrübemle tüm tesisat sorunlarına profesyonel çözümler..."
                            placeholderTextColor={colors.textSecondary}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            value={about}
                            onChangeText={setAbout}
                        />
                    </>
                )}
            </ScrollView>

            <View style={styles.footer}>
                <Button
                    title={step === 1 ? "Devam Et" : "Profili Tamamla"}
                    onPress={handleNext}
                    disabled={step === 1 ? !selectedCategory : (about.length < 10 || loading)}
                    loading={loading}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingTop: spacing.sm,
        paddingBottom: spacing.md,
    },
    indicatorContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    indicator: {
        height: 6,
        width: 32,
        borderRadius: 3,
    },
    content: {
        padding: spacing.xl,
    },
    title: {
        ...typography.header,
        color: colors.text,
        marginBottom: spacing.sm,
    },
    subtitle: {
        ...typography.body,
        color: colors.textSecondary,
        marginBottom: spacing.xl,
        lineHeight: 22,
    },
    optionsContainer: {
        gap: spacing.md,
    },
    categoryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        backgroundColor: colors.surface,
        borderRadius: metrics.borderRadius,
        borderWidth: 1,
        borderColor: colors.border,
    },
    categoryCardActive: {
        borderColor: colors.primary,
        backgroundColor: `${colors.primary}10`, // Very light primary tint
    },
    categoryRadio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: colors.border,
        marginRight: spacing.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryRadioActive: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.primary,
    },
    categoryText: {
        ...typography.body,
        color: colors.text,
        fontWeight: '500',
    },
    categoryTextActive: {
        color: colors.primary,
        fontWeight: '700',
    },
    textInput: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: metrics.borderRadius,
        padding: spacing.md,
        ...typography.body,
        color: colors.text,
        minHeight: 150,
    },
    footer: {
        padding: spacing.lg,
        paddingBottom: spacing.xl,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.surface,
    }
});
