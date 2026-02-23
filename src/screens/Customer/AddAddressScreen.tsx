import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Region } from 'react-native-maps';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, metrics } from '../../theme/theme';
import { Button } from '../../components/Button';
import { db } from '../../services/firebase';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useAppStore } from '../../store/useAppStore';
import Geolocation from '@react-native-community/geolocation';

export function AddAddressScreen() {
    const navigation = useNavigation<any>();
    const { user } = useAppStore();

    const [region, setRegion] = useState<Region>({
        latitude: 41.0082, // Default Istanbul
        longitude: 28.9784,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    });

    const [selectedLocation, setSelectedLocation] = useState<{ latitude: number, longitude: number } | null>(null);
    const [title, setTitle] = useState('');
    const [addressDetails, setAddressDetails] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        Geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const newRegion = {
                    latitude,
                    longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                };
                setRegion(newRegion);
                setSelectedLocation({ latitude, longitude });
            },
            (error) => {
                console.log("Location error", error);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    }, []);

    const handleSaveAddress = async () => {
        if (!user) return;
        if (!title.trim() || !addressDetails.trim() || !selectedLocation) {
            Alert.alert("Eksik Bilgi", "Lütfen başlık, adres detayı ve haritadan konum seçtiğinizden emin olun.");
            return;
        }

        setSaving(true);
        try {
            const newAddress = {
                id: Date.now().toString(),
                title: title.trim(),
                address: addressDetails.trim(),
                latitude: selectedLocation.latitude,
                longitude: selectedLocation.longitude
            };

            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                addresses: arrayUnion(newAddress)
            });

            navigation.goBack();
        } catch (error) {
            console.error("Error saving address:", error);
            Alert.alert("Hata", "Adres kaydedilirken bir sorun oluştu.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <View style={styles.mapContainer}>
                <MapView
                    style={styles.map}
                    region={region}
                    onRegionChangeComplete={(r) => {
                        setRegion(r);
                        setSelectedLocation({ latitude: r.latitude, longitude: r.longitude });
                    }}
                    showsUserLocation={true}
                    showsMyLocationButton={true}
                />
                <View style={styles.markerFixed}>
                    <Icon name="location" size={40} color={colors.primary} />
                </View>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.formContainer}
            >
                <View style={styles.formHeader}>
                    <Text style={styles.formTitle}>Adres Bilgileri</Text>
                </View>

                <Text style={styles.label}>Adres Başlığı</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Örn: Ev, İş, Annem"
                    placeholderTextColor={colors.textSecondary}
                    value={title}
                    onChangeText={setTitle}
                />

                <Text style={styles.label}>Açık Adres</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Mahalle, sokak, bina ve daire numarası"
                    placeholderTextColor={colors.textSecondary}
                    value={addressDetails}
                    onChangeText={setAddressDetails}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                />

                <Button
                    title="Adresi Kaydet"
                    onPress={handleSaveAddress}
                    loading={saving}
                    disabled={saving || !title.trim() || !addressDetails.trim()}
                    style={styles.saveBtn}
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    mapContainer: {
        flex: 1,
        position: 'relative',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    markerFixed: {
        left: '50%',
        marginLeft: -20,
        marginTop: -40,
        position: 'absolute',
        top: '50%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    formContainer: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: spacing.xl,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 8,
    },
    formHeader: {
        marginBottom: spacing.lg,
    },
    formTitle: {
        ...typography.title,
        color: colors.text,
    },
    label: {
        ...typography.caption,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
        marginLeft: spacing.xs,
    },
    input: {
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: metrics.borderRadius,
        padding: spacing.md,
        ...typography.body,
        color: colors.text,
        marginBottom: spacing.lg,
    },
    textArea: {
        minHeight: 80,
    },
    saveBtn: {
        marginTop: spacing.sm,
    }
});
