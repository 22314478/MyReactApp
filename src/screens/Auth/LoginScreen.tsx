import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert, Dimensions, StatusBar, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { colors, spacing, typography, metrics } from '../../theme/theme';
import { loginWithPhoneAndPassword, sendRegistrationOTP } from '../../services/firebase';
import { useAppStore } from '../../store/useAppStore';
import Icon from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

export const LoginScreen = ({ navigation }: any) => {
    const [isLoginTab, setIsLoginTab] = useState(true);

    // Shared State
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');

    // Signup Only State
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    const [loading, setLoading] = useState(false);
    const { setConfirmation } = useAppStore();

    const handleLogin = async () => {
        if (!phone || phone.length < 10 || !password) {
            Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
            return;
        }
        setLoading(true);
        try {
            await loginWithPhoneAndPassword(phone, password);
            // RootNavigator will automatically detect the auth state change and redirect
        } catch (error: any) {
            console.error(error);
            Alert.alert('Giriş Başarısız', error.message || 'Lütfen bilgilerinizi kontrol edin.');
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async () => {
        if (!phone || phone.length < 10 || !password || !firstName.trim() || !lastName.trim()) {
            Alert.alert("Eksik Bilgi", "Lütfen tüm alanları doldurun.");
            return;
        }
        if (password.length < 6) {
            Alert.alert("Hata", "Şifre en az 6 karakter olmalıdır.");
            return;
        }

        setLoading(true);
        try {
            const confirmation = await sendRegistrationOTP(phone);
            setConfirmation(confirmation);

            // Navigate to OTP screen with all the registration data
            navigation.navigate('OTPVerification', {
                phone,
                password,
                firstName: firstName.trim(),
                lastName: lastName.trim()
            });
        } catch (error: any) {
            console.error(error);
            Alert.alert('Hata', 'Kayıt işlemi başlatılamadı: ' + (error.message || ''));
        } finally {
            setLoading(false);
        }
    };

    const renderTabs = () => (
        <View style={styles.tabContainer}>
            <TouchableOpacity
                style={[styles.tab, isLoginTab && styles.activeTab]}
                onPress={() => setIsLoginTab(true)}
            >
                <Text style={[styles.tabText, isLoginTab && styles.activeTabText]}>Giriş Yap</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.tab, !isLoginTab && styles.activeTab]}
                onPress={() => setIsLoginTab(false)}
            >
                <Text style={[styles.tabText, !isLoginTab && styles.activeTabText]}>Kayıt Ol</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            <StatusBar barStyle="light-content" />

            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={styles.scrollGrow} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                    <View style={styles.topDecoration}>
                        <View style={styles.circleLarge} />
                        <View style={styles.circleSmall} />
                        <View style={styles.headerContent}>
                            <Icon name="home" size={50} color={colors.surface} style={styles.logoIcon} />
                            <Text style={styles.brandTitle}>Mahalle</Text>
                        </View>
                    </View>

                    <View style={styles.cardContainer}>
                        {renderTabs()}

                        <View style={styles.formContent}>
                            <Text style={styles.title}>Hoş Geldiniz 👋</Text>
                            <Text style={styles.subtitle}>
                                {isLoginTab ? 'Hesabınıza giriş yaparak hizmetlere ulaşın.' : 'Yeni hesabınızı oluşturmak için bilgileri doldurun.'}
                            </Text>

                            {!isLoginTab && (
                                <View style={styles.rowInputs}>
                                    <View style={[styles.inputWrapper, { flex: 1, marginRight: spacing.sm }]}>
                                        <Icon name="person-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                                        <TextInput
                                            placeholder="Adınız"
                                            placeholderTextColor={colors.textSecondary}
                                            value={firstName}
                                            onChangeText={setFirstName}
                                            style={styles.textInput}
                                        />
                                    </View>
                                    <View style={[styles.inputWrapper, { flex: 1 }]}>
                                        <TextInput
                                            placeholder="Soyadınız"
                                            placeholderTextColor={colors.textSecondary}
                                            value={lastName}
                                            onChangeText={setLastName}
                                            style={styles.textInput}
                                        />
                                    </View>
                                </View>
                            )}

                            <View style={styles.inputWrapper}>
                                <Icon name="call-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                                <Text style={styles.countryCode}>+90</Text>
                                <TextInput
                                    placeholder="5XX XXX XX XX"
                                    keyboardType="phone-pad"
                                    placeholderTextColor={colors.textSecondary}
                                    value={phone}
                                    onChangeText={setPhone}
                                    maxLength={10}
                                    style={styles.textInput}
                                />
                            </View>

                            <View style={[styles.inputWrapper, { marginTop: spacing.lg }]}>
                                <Icon name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                                <TextInput
                                    placeholder="Şifreniz"
                                    keyboardType="default"
                                    secureTextEntry
                                    placeholderTextColor={colors.textSecondary}
                                    value={password}
                                    onChangeText={setPassword}
                                    style={styles.textInput}
                                />
                            </View>

                            {!isLoginTab && (
                                <Text style={styles.infoText}>
                                    Kayıt ol butonuna basarak size SMS ile onay kodu göndereceğiz.
                                </Text>
                            )}
                        </View>

                        <View style={styles.footer}>
                            <Button
                                title={isLoginTab ? "Giriş Yap" : "Kayıt Ol"}
                                onPress={isLoginTab ? handleLogin : handleSignup}
                                loading={loading}
                                disabled={loading}
                                style={styles.continueButton}
                            />
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.surface,
    },
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollGrow: {
        flexGrow: 1,
    },
    topDecoration: {
        height: height * 0.30, // Slightly smaller header to fit more form fields
        backgroundColor: colors.primary,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        position: 'relative',
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    circleLarge: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: 'rgba(255,255,255,0.1)',
        top: -100,
        right: -50,
    },
    circleSmall: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255,255,255,0.15)',
        bottom: -50,
        left: -50,
    },
    headerContent: {
        alignItems: 'center',
        marginTop: spacing.xl,
    },
    logoIcon: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    brandTitle: {
        ...typography.header,
        color: colors.surface,
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: 1,
    },
    cardContainer: {
        flex: 1,
        backgroundColor: colors.surface,
        marginTop: -40,
        marginHorizontal: spacing.lg,
        borderRadius: 24,
        padding: spacing.xl,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 8,
        marginBottom: spacing.xl,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: colors.background,
        borderRadius: metrics.borderRadius,
        padding: 4,
        marginBottom: spacing.xl,
    },
    tab: {
        flex: 1,
        paddingVertical: spacing.md,
        alignItems: 'center',
        borderRadius: metrics.borderRadius - 4,
    },
    activeTab: {
        backgroundColor: colors.surface,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    tabText: {
        ...typography.body,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    activeTabText: {
        color: colors.primary,
        fontWeight: 'bold',
    },
    formContent: {
        flex: 1,
    },
    title: {
        ...typography.header,
        color: colors.text,
        marginBottom: spacing.xs,
        fontSize: 24,
    },
    subtitle: {
        ...typography.body,
        color: colors.textSecondary,
        marginBottom: spacing.lg,
        lineHeight: 22,
    },
    rowInputs: {
        flexDirection: 'row',
        marginBottom: spacing.lg,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: metrics.borderRadius,
        paddingHorizontal: spacing.md,
        height: 56,
    },
    inputIcon: {
        marginRight: spacing.sm,
    },
    countryCode: {
        ...typography.body,
        color: colors.text,
        fontWeight: '600',
        marginRight: spacing.sm,
        borderRightWidth: 1,
        borderRightColor: colors.border,
        paddingRight: spacing.sm,
    },
    textInput: {
        flex: 1,
        borderWidth: 0,
        backgroundColor: 'transparent',
    },
    infoText: {
        ...typography.caption,
        color: colors.textSecondary,
        marginTop: spacing.md,
        textAlign: 'center',
    },
    footer: {
        justifyContent: 'flex-end',
        marginTop: spacing.xl,
    },
    continueButton: {
        height: 56,
        borderRadius: metrics.borderRadius,
    }
});
