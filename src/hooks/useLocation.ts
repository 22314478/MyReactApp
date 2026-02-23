import { useState, useEffect } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

interface LocationState {
    latitude: number | null;
    longitude: number | null;
    error: string | null;
    loading: boolean;
}

export const useLocation = () => {
    const [location, setLocation] = useState<LocationState>({
        latitude: null,
        longitude: null,
        error: null,
        loading: true,
    });

    const requestLocationPermission = async () => {
        try {
            if (Platform.OS === 'ios') {
                // Request iOS permission
                Geolocation.requestAuthorization();
                getLocation();
            } else if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: 'Konum İzni',
                        message: 'Size en yakın hizmet verenleri bulabilmemiz için konum bilginize ihtiyacımız var.',
                        buttonNeutral: 'Daha Sonra',
                        buttonNegative: 'İptal',
                        buttonPositive: 'Tamam',
                    },
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    getLocation();
                } else {
                    setLocation(prev => ({ ...prev, error: 'Konum izni reddedildi.', loading: false }));
                }
            }
        } catch (err) {
            console.warn(err);
            setLocation(prev => ({ ...prev, error: 'İzin istenirken hata oluştu.', loading: false }));
        }
    };

    const getLocation = () => {
        Geolocation.getCurrentPosition(
            position => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    error: null,
                    loading: false,
                });
            },
            error => {
                setLocation(prev => ({ ...prev, error: error.message, loading: false }));
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
        );
    };

    useEffect(() => {
        requestLocationPermission();
    }, []);

    return { ...location, requestLocationPermission };
};
