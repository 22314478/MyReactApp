import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView, Alert } from 'react-native';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { colors, spacing, typography } from '../../theme/theme';
import { useAppStore } from '../../store/useAppStore';
import { createUserProfile } from '../../services/firebase';

export const OTPVerificationScreen = ({ route, navigation }: any) => {
    // These come from the Signup tab in LoginScreen
    const { phone, password, firstName, lastName } = route.params;

    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const { confirmation } = useAppStore();

    const handleVerify = async () => {
        if (code.length !== 6 || !confirmation) return;
        setLoading(true);
        try {
            // 1. Verify the Mock OTP Code
            await confirmation.confirm(code);

            // 2. Create the Auth Account and initial Firestore Profile
            const fullName = `${firstName} ${lastName}`;
            await createUserProfile(phone, password, fullName);

            // 3. User is now logged in via Email/Pass under the hood. 
            // The RootNavigator will automatically transition to the authenticated RoleSelection screen!

        } catch (error: any) {
            console.error(error);
            Alert.alert("Kayıt Başarısız", error.message || "Doğrulama işlemi gerçekleştirilemedi.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <View style={styles.content}>
                    <Text style={styles.title}>Doğrulama Kodu</Text>
                    <Text style={styles.subtitle}>
                        +90 {phone} numarasına gönderilen 6 haneli kodu giriniz. {'\n'}
                        <Text style={{ fontSize: 12, color: colors.primary }}>(Test kodu: 123456)</Text>
                    </Text>

                    <Input
                        label="Kodu Girin"
                        placeholder="• • • • • •"
                        keyboardType="number-pad"
                        value={code}
                        onChangeText={setCode}
                        maxLength={6}
                        style={styles.codeInput}
                    />
                </View>

                <View style={styles.footer}>
                    <Button
                        title="Doğrula ve Hesabı Aç"
                        onPress={handleVerify}
                        loading={loading}
                        disabled={code.length !== 6 || loading}
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
    content: {
        flex: 1,
        padding: spacing.xl,
        justifyContent: 'center',
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
    codeInput: {
        textAlign: 'center',
        fontSize: 24,
        letterSpacing: 8,
    },
    footer: {
        padding: spacing.xl,
        paddingBottom: Platform.OS === 'ios' ? spacing.sm : spacing.xl,
    },
});
