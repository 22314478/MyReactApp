import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { colors, spacing, typography, metrics } from '../theme/theme';
import Icon from 'react-native-vector-icons/Ionicons';
import { useLocation } from '../hooks/useLocation';

const CATEGORIES = ['Tümü', 'Temizlik', 'Tamirat', 'Tesisat', 'Nakliye'];

import { db } from '../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface ProviderMarker {
    id: string;
    title: string;
    desc: string;
    latitude: number;
    longitude: number;
    cat: string;
}

export const CustomerMapView = () => {
    const { latitude, longitude, loading } = useLocation();
    const [activeCategory, setActiveCategory] = useState('Tümü');

    const baseLat = latitude || 41.0082;
    const baseLng = longitude || 28.9784;

    const region = {
        latitude: baseLat,
        longitude: baseLng,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    };

    const [providers, setProviders] = useState<ProviderMarker[]>([]);
    const [fetching, setFetching] = useState(false);

    React.useEffect(() => {
        const fetchProviders = async () => {
            setFetching(true);
            try {
                const q = query(collection(db, 'users'), where('role', '==', 'provider'));
                const querySnapshot = await getDocs(q);

                const loadedProviders: ProviderMarker[] = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    // Fallback to random nearby location if provider hasn't set exact coordinates yet
                    const pLat = data.latitude || (baseLat + (Math.random() - 0.5) * 0.05);
                    const pLng = data.longitude || (baseLng + (Math.random() - 0.5) * 0.05);

                    loadedProviders.push({
                        id: doc.id,
                        title: data.name || data.phone || 'Hizmet Veren',
                        desc: `${data.category || 'Genel'} - ${data.about?.substring(0, 20) || ''}...`,
                        latitude: pLat,
                        longitude: pLng,
                        cat: data.category || 'Diğer'
                    });
                });

                setProviders(loadedProviders);
            } catch (error) {
                console.error("Error fetching providers for map", error);
            } finally {
                setFetching(false);
            }
        };

        fetchProviders();
    }, [baseLat, baseLng]);

    const filteredProviders = activeCategory === 'Tümü'
        ? providers
        : providers.filter(p => p.cat === activeCategory);

    return (
        <View style={styles.container}>
            {/* Map Area */}
            <MapView
                provider={PROVIDER_DEFAULT}
                style={styles.map}
                region={region}
                showsUserLocation={true}
                showsMyLocationButton={true}
            >
                {filteredProviders.map(provider => (
                    <Marker
                        key={provider.id}
                        coordinate={{ latitude: provider.latitude, longitude: provider.longitude }}
                        title={provider.title}
                        description={provider.desc}
                    />
                ))}
            </MapView>

            {/* Filter Overlay */}
            <View style={styles.filterContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterScroll}
                >
                    {CATEGORIES.map(cat => {
                        const isActive = activeCategory === cat;
                        return (
                            <TouchableOpacity
                                key={cat}
                                style={[styles.filterPill, isActive && styles.filterPillActive]}
                                onPress={() => setActiveCategory(cat)}
                            >
                                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    filterContainer: {
        position: 'absolute',
        top: spacing.md, // Below SafeArea top
        left: 0,
        right: 0,
    },
    filterScroll: {
        paddingHorizontal: spacing.md,
        gap: spacing.sm,
    },
    filterPill: {
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 20,
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: colors.border,
    },
    filterPillActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    filterText: {
        ...typography.caption,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    filterTextActive: {
        color: colors.surface,
        fontWeight: 'bold',
    },
});
