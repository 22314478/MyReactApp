import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, metrics } from '../../theme/theme';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { addDoc, collection } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { db } from '../../services/firebase';
import { useAppStore } from '../../store/useAppStore';
import { uploadImageToSupabase } from '../../services/supabase';

const CATEGORIES = ['Temizlik', 'Tamirat', 'Özel Ders', 'Nakliye', 'Diğer'];

export function CreateRequestScreen() {
    const navigation = useNavigation();
    const { user } = useAppStore();

    // Standard Fields
    const [selectedCategory, setSelectedCategory] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [images, setImages] = useState<{ uri: string, base64: string }[]>([]);

    // Dynamic Fields (Stored as a key-value object to scale easily)
    const [dynamicData, setDynamicData] = useState<Record<string, string>>({});

    const [loading, setLoading] = useState(false);

    const handlePickImage = async () => {
        const result = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 3, includeBase64: true });
        if (result.assets) {
            const newImages = result.assets
                .filter(asset => asset.uri && asset.base64)
                .map(asset => ({ uri: asset.uri!, base64: asset.base64! }));
            setImages(prev => [...prev, ...newImages]);
        }
    };

    const updateDynamicField = (key: string, value: string) => {
        setDynamicData(prev => ({ ...prev, [key]: value }));
    };

    const renderDynamicForm = () => {
        if (!selectedCategory) return null;

        return (
            <View style={styles.dynamicFormContainer}>
                <Text style={styles.sectionTitle}>{selectedCategory} Detayları</Text>

                {selectedCategory === 'Temizlik' && (
                    <>
                        <Input
                            label="Eviniz Kaç m²?"
                            placeholder="Örn: 90m²"
                            value={dynamicData['MüşteriEviMetrekare'] || ''}
                            onChangeText={(val) => updateDynamicField('MüşteriEviMetrekare', val)}
                            keyboardType="numeric"
                        />
                        <Input
                            label="Oda Sayısı"
                            placeholder="Örn: 3+1"
                            value={dynamicData['OdaSayısı'] || ''}
                            onChangeText={(val) => updateDynamicField('OdaSayısı', val)}
                        />
                        <Input
                            label="Evcil Hayvan Var Mı?"
                            placeholder="Örn: Evet (1 Kedi)"
                            value={dynamicData['EvcilHayvan'] || ''}
                            onChangeText={(val) => updateDynamicField('EvcilHayvan', val)}
                        />
                    </>
                )}

                {selectedCategory === 'Tamirat' && (
                    <>
                        <Input
                            label="Sorun Hangi Eşyada/Alanda?"
                            placeholder="Örn: Mutfak Lavabosu, Arçelik Çamaşır Makinesi"
                            value={dynamicData['ArizaAlani'] || ''}
                            onChangeText={(val) => updateDynamicField('ArizaAlani', val)}
                        />
                        <Input
                            label="Sorun Ne Zaman Başladı?"
                            placeholder="Örn: Dün akşamdan beri"
                            value={dynamicData['BaslamaZamani'] || ''}
                            onChangeText={(val) => updateDynamicField('BaslamaZamani', val)}
                        />
                    </>
                )}

                {selectedCategory === 'Özel Ders' && (
                    <>
                        <Input
                            label="Öğrencinin Yılı/Sınıfı"
                            placeholder="Örn: 8. Sınıf (LGS Hazırlık)"
                            value={dynamicData['OgrenciSeviyesi'] || ''}
                            onChangeText={(val) => updateDynamicField('OgrenciSeviyesi', val)}
                        />
                        <Input
                            label="Ders Formatı"
                            placeholder="Örn: Yüz Yüze Pazar Günleri"
                            value={dynamicData['DersFormati'] || ''}
                            onChangeText={(val) => updateDynamicField('DersFormati', val)}
                        />
                    </>
                )}

                {selectedCategory === 'Nakliye' && (
                    <>
                        <Input
                            label="Nereden Nereye?"
                            placeholder="Örn: Kadıköy'den Üsküdar'a"
                            value={dynamicData['Guzergah'] || ''}
                            onChangeText={(val) => updateDynamicField('Guzergah', val)}
                        />
                        <Input
                            label="Eşya Hacmi (Kaç Oda)"
                            placeholder="Örn: 2+1 Ev Eşyası"
                            value={dynamicData['Hacim'] || ''}
                            onChangeText={(val) => updateDynamicField('Hacim', val)}
                        />
                        <Input
                            label="Asansör Gerekli Mi?"
                            placeholder="Örn: Her iki bina için de evet"
                            value={dynamicData['AsansorTalebi'] || ''}
                            onChangeText={(val) => updateDynamicField('AsansorTalebi', val)}
                        />
                    </>
                )}
            </View>
        );
    };

    const handleSubmit = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // 1. Upload all local images to Supabase Storage
            const uploadedUrls: string[] = [];
            if (images.length > 0) {
                for (const img of images) {
                    const publicUrl = await uploadImageToSupabase(img.uri, img.base64, 'images');
                    if (publicUrl) {
                        uploadedUrls.push(publicUrl);
                    }
                }
            }

            // 2. Save the request with the Public URLs to Firestore
            await addDoc(collection(db, 'serviceRequests'), {
                customerId: user.uid,
                category: selectedCategory,
                title,
                description,
                images: uploadedUrls, // Remote URLs instead of local URIs
                dynamicDetails: dynamicData,
                status: 'open',
                createdAt: new Date().toISOString(),
            });

            navigation.goBack();
        } catch (error) {
            console.error('Error adding request: ', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Yeni Hizmet Talebi</Text>
                        <Text style={styles.headerSubtitle}>İhtiyacınız olan hizmeti detaylandırın, ustalardan nokta atışı teklif alın.</Text>
                    </View>

                    <Text style={styles.sectionTitle}>Kategori Seçin</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                        {CATEGORIES.map(cat => (
                            <TouchableOpacity
                                key={cat}
                                style={[styles.categoryPill, selectedCategory === cat && styles.categoryPillSelected]}
                                onPress={() => {
                                    setSelectedCategory(cat);
                                    setDynamicData({}); // Reset dynamic form on scope change
                                }}
                            >
                                <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextSelected]}>
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {renderDynamicForm()}

                    {selectedCategory !== '' && (
                        <View style={styles.standardForms}>
                            <Text style={styles.sectionTitle}>Genel Bilgiler</Text>
                            <Input
                                label="Talep Başlığı"
                                placeholder="Özet bir başlık girin..."
                                value={title}
                                onChangeText={setTitle}
                            />

                            <Input
                                label="Ek Açıklama"
                                placeholder="Belirtmek istediğiniz diğer detaylar..."
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={4}
                                style={styles.textArea}
                            />

                            <View style={styles.imageSection}>
                                <Text style={styles.sectionTitle}>Fotoğraflar (İsteğe bağlı)</Text>
                                <TouchableOpacity style={styles.imagePlaceholder} onPress={handlePickImage}>
                                    <Text style={styles.imagePlaceholderText}>+ Fotoğraf Ekle</Text>
                                </TouchableOpacity>

                                <View style={styles.imageGallery}>
                                    {images.map((img, idx) => (
                                        <Image key={idx} source={{ uri: img.uri }} style={styles.uploadedImage} />
                                    ))}
                                </View>
                            </View>
                        </View>
                    )}

                </ScrollView>

                <View style={styles.footer}>
                    <Button
                        title="Talebi Yayınla"
                        onPress={handleSubmit}
                        loading={loading}
                        disabled={!selectedCategory || !title || loading} // Description is optional since dynamic fields capture context
                    />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        padding: spacing.xl,
        paddingBottom: spacing.xxl,
    },
    header: {
        marginBottom: spacing.xl,
    },
    headerTitle: {
        ...typography.header,
        color: colors.text,
        marginBottom: spacing.xs,
        fontSize: 26,
    },
    headerSubtitle: {
        ...typography.body,
        color: colors.textSecondary,
        lineHeight: 22,
    },
    sectionTitle: {
        ...typography.title,
        color: colors.text,
        marginBottom: spacing.md,
        marginTop: spacing.sm,
    },
    categoryScroll: {
        marginBottom: spacing.lg,
        flexDirection: 'row',
    },
    categoryPill: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: metrics.borderRadius,
        marginRight: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    categoryPillSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    categoryText: {
        ...typography.body,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    categoryTextSelected: {
        color: colors.surface,
    },
    dynamicFormContainer: {
        backgroundColor: colors.surface,
        padding: spacing.lg,
        borderRadius: metrics.borderRadius,
        marginBottom: spacing.xl,
        borderWidth: 1,
        borderColor: `${colors.primary}30`,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    standardForms: {
        marginTop: spacing.sm,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
        paddingTop: spacing.md,
    },
    footer: {
        padding: spacing.xl,
        paddingBottom: Platform.OS === 'ios' ? spacing.md : spacing.xl,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.surface,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 10,
    },
    imageSection: {
        marginTop: spacing.md,
    },
    imagePlaceholder: {
        height: 120,
        borderWidth: 2,
        borderColor: colors.border,
        borderStyle: 'dashed',
        borderRadius: metrics.borderRadius,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
        backgroundColor: `${colors.primary}05`,
    },
    imagePlaceholderText: {
        color: colors.primary,
        ...typography.body,
        fontWeight: '700', // Keep this, but put it after typography.body so it overrides correctly
    },
    imageGallery: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    uploadedImage: {
        width: 100,
        height: 100,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
    }
});
