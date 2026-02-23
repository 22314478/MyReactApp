import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { colors, spacing, typography, metrics } from '../../theme/theme';
import { db } from '../../services/firebase';
import { doc, setDoc } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/Ionicons';

type ParamList = {
    Registration: {
        uid: string;
        phone: string;
    };
};

export const RegistrationScreen = () => {
    const route = useRoute<RouteProp<ParamList, 'Registration'>>();
    const { uid, phone } = route.params || {}; // Fallbacks just in case
    const navigation = useNavigation<any>();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleContinue = async () => {
        if (!firstName.trim() || !lastName.trim()) {
            Alert.alert("Eksik Bilgi", "Lütfen adınızı ve soyadınızı eksiksiz giriniz.");
            return;
        }

        setLoading(true);
        try {
            // Create the initial user document
            const userRef = doc(db, 'users', uid);
            await setDoc(userRef, {
                name: `${firstName.trim()} ${lastName.trim()}`,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim(),
                phone: phone || '', // Phone should ideally come from route params if passed
                createdAt: new Date().toISOString(),
                // role is deliberately left empty, it will be set in RoleSelection
            });

            // Proceed to role selection
            navigation.navigate('RoleSelection');
        } catch (error: any) {
            console.error("Error creating user profile:", error);
            Alert.alert("Hata", "Profil oluşturulurken bir hata meydana geldi.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    <View style={styles.header}>
                        <View style={styles.iconContainer}>
                            <Icon name="person-add" size={40} color={colors.primary} />
                        </View>
                        <Text style={styles.title}>Aramıza Hoş Geldin!</Text>
                        <Text style={styles.subtitle}>
                            Seni daha yakından tanıyabilmemiz için lütfen aşağıdaki bilgileri doldur.
                        </Text>
                    </View>

                    <View style={styles.formContainer}>
                        <Input
                            label="Adınız *"
                            placeholder="Örn: Ahmet"
                            value={firstName}
                            onChangeText={setFirstName}
                            autoCapitalize="words"
                            style={styles.inputSpacing}
                        />

                        <Input
                            label="Soyadınız *"
                            placeholder="Örn: Yılmaz"
                            value={lastName}
                            onChangeText={setLastName}
                            autoCapitalize="words"
                            style={styles.inputSpacing}
                        />

                        <Input
                            label="E-posta Adresi (İsteğe bağlı)"
                            placeholder="Örn: ahmet@email.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            style={styles.inputSpacing}
                        />
                    </View>

                </ScrollView>

                <View style={styles.footer}>
                    <Text style={styles.termsText}>
                        Devam ederek, platformun <Text style={styles.linkText}>Kullanım Koşulları</Text> ve <Text style={styles.linkText}>Gizlilik Politikası</Text>'nı kabul etmiş olursunuz.
                    </Text>
                    <Button
                        title="Profili Oluştur ve Devam Et"
                        onPress={handleContinue}
                        loading={loading}
                        disabled={!firstName.trim() || !lastName.trim() || loading}
                    />
                </View>

            </KeyboardAvoidingView>
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
    scrollContent: {
        flexGrow: 1,
        padding: spacing.xl,
        paddingTop: spacing.xxl,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xxl,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(0,122,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    title: {
        ...typography.header,
        color: colors.text,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    subtitle: {
        ...typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: spacing.md,
    },
    formContainer: {
        flex: 1,
    },
    inputSpacing: {
        marginBottom: spacing.lg,
    },
    footer: {
        padding: spacing.xl,
        paddingBottom: Platform.OS === 'ios' ? spacing.sm : spacing.xl,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.surface,
    },
    termsText: {
        ...typography.caption,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.lg,
        lineHeight: 18,
    },
    linkText: {
        color: colors.primary,
        fontWeight: '600',
    }
});
