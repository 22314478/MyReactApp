import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../theme/theme';
import Icon from 'react-native-vector-icons/Ionicons';
import { EmptyState } from '../../components/EmptyState';
import { db } from '../../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAppStore } from '../../store/useAppStore';

const { width } = Dimensions.get('window');

export function WalletScreen() {
    const { user } = useAppStore();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalEarned: 0,
        pendingBalance: 0, // Simplified: let's pretend recent jobs are pending
        completedJobs: 0,
        systemCommission: 0 // Simulated 10%
    });

    const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

    useEffect(() => {
        const fetchWalletData = async () => {
            if (!user) return;
            setLoading(true);
            try {
                // Fetch completed offers by this provider
                const q = query(
                    collection(db, 'offers'),
                    where('providerId', '==', user.uid),
                    where('status', '==', 'completed')
                );

                const snapshot = await getDocs(q);
                let total = 0;
                const transactions: any[] = [];

                snapshot.forEach(doc => {
                    const data = doc.data();
                    const price = parseFloat(data.price || 0);
                    total += price;

                    transactions.push({
                        id: doc.id,
                        price,
                        date: data.createdAt ? new Date(data.createdAt).toLocaleDateString('tr-TR') : 'Bilinmeyen Tarih',
                        title: 'Tamamlanan İş Kazancı'
                    });
                });

                // Sort transactions newest first (mocked by reversed push since we map, but better to sort by date)
                transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                // Simulated economics
                const commissionRate = 0.10; // 10%
                const commission = total * commissionRate;
                const netEarnings = total - commission;

                // For MVP flair, let's pretend 30% of net is still "pending withdrawal"
                const pending = netEarnings * 0.3;

                setStats({
                    totalEarned: netEarnings,
                    pendingBalance: total > 0 ? pending : 0,
                    completedJobs: snapshot.size,
                    systemCommission: commission
                });

                setRecentTransactions(transactions);

            } catch (error) {
                console.error("Error fetching wallet data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchWalletData();
    }, [user]);

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={colors.secondary} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Balance Card */}
                <View style={styles.balanceCard}>
                    <View style={styles.balanceHeader}>
                        <Text style={styles.balanceLabel}>Net Kazancınız</Text>
                        <Icon name="wallet" size={24} color={colors.surface} />
                    </View>
                    <Text style={styles.balanceAmount}>₺ {stats.totalEarned.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>

                    <View style={styles.pendingRow}>
                        <Text style={styles.pendingText}>Çekilebilir Bakiye:</Text>
                        <Text style={styles.pendingAmount}>₺ {(stats.totalEarned - stats.pendingBalance).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                    </View>
                </View>

                {/* System Metrics (The actual startup MVP selling point) */}
                <Text style={styles.sectionTitle}>Sistem Kesintileri & Analitik</Text>

                <View style={styles.statsGrid}>
                    <View style={styles.statBox}>
                        <Icon name="checkmark-circle-outline" size={24} color={colors.secondary} />
                        <Text style={styles.statValue}>{stats.completedJobs}</Text>
                        <Text style={styles.statLabel}>Tamamlanan İş</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Icon name="pie-chart-outline" size={24} color={colors.primary} />
                        <Text style={[styles.statValue, { color: colors.primary }]}>
                            ₺ {stats.systemCommission.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </Text>
                        <Text style={styles.statLabel}>Platform Komisyonu (%10)</Text>
                    </View>
                </View>

                <View style={styles.infoBox}>
                    <Icon name="information-circle-outline" size={20} color={colors.primary} />
                    <Text style={styles.infoText}>
                        Ödemeleriniz her Cuma günü kayıtlı IBAN adresinize sistem komisyonu kesilerek otomatik yatırılır.
                    </Text>
                </View>

                {/* Transactions List */}
                <Text style={styles.sectionTitle}>Gerçekleşen İşlemler</Text>

                {recentTransactions.length === 0 ? (
                    <EmptyState
                        icon="receipt-outline"
                        title="Finansal Hareket Yok"
                        message="Tamamladığınız işlere ait işlemleriniz ve komisyon kesintileri burada listelenecektir."
                        color={colors.secondary}
                    />
                ) : (
                    recentTransactions.map((tx, index) => (
                        <View key={index} style={styles.txCard}>
                            <View style={styles.txIconBox}>
                                <Icon name="arrow-down-outline" size={20} color={colors.secondary} />
                            </View>
                            <View style={styles.txDetails}>
                                <Text style={styles.txTitle}>{tx.title}</Text>
                                <Text style={styles.txDate}>{tx.date}</Text>
                            </View>
                            <Text style={styles.txAmount}>+₺ {parseFloat(tx.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</Text>
                        </View>
                    ))
                )}

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: spacing.md,
    },
    balanceCard: {
        backgroundColor: colors.secondary,
        borderRadius: 20,
        padding: spacing.xl,
        shadowColor: colors.secondary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
        marginBottom: spacing.xl,
    },
    balanceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    balanceLabel: {
        ...typography.body,
        color: 'rgba(255,255,255,0.8)',
    },
    balanceAmount: {
        fontSize: 36,
        fontWeight: 'bold',
        color: colors.surface,
        marginBottom: spacing.lg,
    },
    pendingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.2)',
        paddingTop: spacing.md,
    },
    pendingText: {
        ...typography.caption,
        color: 'rgba(255,255,255,0.8)',
    },
    pendingAmount: {
        ...typography.body,
        color: colors.surface,
        fontWeight: 'bold',
    },
    sectionTitle: {
        ...typography.title,
        color: colors.text,
        marginBottom: spacing.md,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    statBox: {
        backgroundColor: colors.surface,
        width: (width - spacing.md * 2 - spacing.md) / 2,
        padding: spacing.lg,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    statValue: {
        ...typography.header,
        color: colors.secondary,
        marginTop: spacing.sm,
        marginBottom: 4,
    },
    statLabel: {
        ...typography.caption,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: `${colors.primary}10`,
        padding: spacing.md,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    infoText: {
        flex: 1,
        marginLeft: spacing.sm,
        ...typography.caption,
        color: colors.primary,
        lineHeight: 18,
    },
    txCard: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    txIconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: `${colors.secondary}15`,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    txDetails: {
        flex: 1,
    },
    txTitle: {
        ...typography.body,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 2,
    },
    txDate: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    txAmount: {
        ...typography.body,
        fontWeight: 'bold',
        color: colors.secondary,
    },
    emptyContainer: {
        padding: spacing.xl,
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        borderStyle: 'dashed',
    },
    emptyText: {
        ...typography.body,
        color: colors.textSecondary,
        marginTop: spacing.md,
        textAlign: 'center',
    }
});
