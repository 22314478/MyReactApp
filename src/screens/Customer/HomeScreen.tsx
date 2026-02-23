import { StyleSheet, View } from 'react-native';
import { colors, spacing } from '../../theme/theme';
import { Button } from '../../components/Button';
import { useNavigation } from '@react-navigation/native';
import { CustomerMapView } from '../../components/CustomerMapView';

export const HomeScreen = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <CustomerMapView />

            <View style={styles.floatingButtonContainer}>
                <Button
                    title="Hizmet Talebi Oluştur"
                    onPress={() => navigation.navigate('CreateRequest' as never)}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    floatingButtonContainer: {
        position: 'absolute',
        bottom: spacing.xl,
        left: spacing.lg,
        right: spacing.lg,
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
});
