import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography } from '../theme/theme';
import Icon from 'react-native-vector-icons/Ionicons';
import { EmptyState } from '../components/EmptyState';
import { db } from '../services/firebase';
import { collection, query, where, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { useAppStore } from '../store/useAppStore';

export function MessagesListScreen() {
    const navigation = useNavigation();
    const { user, userRole } = useAppStore();
    const [chats, setChats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const chatField = userRole === 'provider' ? 'providerId' : 'customerId';

        const q = query(
            collection(db, 'chats'),
            where(chatField, '==', user.uid)
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const fetchedChats: any[] = [];
            for (const docSnap of snapshot.docs) {
                const data = docSnap.data();

                // Fetch the other user's name
                let otherUserName = 'Kullanıcı';
                const otherUserId = userRole === 'provider' ? data.customerId : data.providerId;

                if (otherUserId) {
                    try {
                        const userDoc = await getDoc(doc(db, 'users', otherUserId));
                        if (userDoc.exists()) {
                            const uData = userDoc.data();
                            otherUserName = uData.name || uData.phone || 'İsimsiz Kullanıcı';
                        }
                    } catch (e) {
                        console.error("Error fetching other user", e);
                    }
                }

                // Fetch request title
                let requestTitle = 'Talep';
                if (data.requestId) {
                    try {
                        const reqDoc = await getDoc(doc(db, 'serviceRequests', data.requestId));
                        if (reqDoc.exists()) {
                            requestTitle = reqDoc.data().title || reqDoc.data().category || 'Talep';
                        }
                    } catch (e) {
                        console.error("Error fetching request", e);
                    }
                }

                fetchedChats.push({
                    id: docSnap.id,
                    ...data,
                    otherUserName,
                    requestTitle
                });
            }

            // Sort locally by lastMessageTime descending explicitly
            fetchedChats.sort((a, b) => new Date(b.lastMessageTime || 0).getTime() - new Date(a.lastMessageTime || 0).getTime());

            setChats(fetchedChats);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, userRole]);

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.chatCard}
            onPress={() => (navigation as any).navigate('Chat', { chatId: item.id, reqId: item.requestId })}
        >
            <View style={styles.avatarPlaceholder}>
                <Icon name="person" size={24} color={colors.surface} />
            </View>
            <View style={styles.chatInfo}>
                <View style={styles.chatHeader}>
                    <Text style={styles.userName}>{item.otherUserName}</Text>
                    <Text style={styles.timeText}>
                        {item.lastMessageTime ? new Date(item.lastMessageTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </Text>
                </View>
                <Text style={styles.requestTitle}>{item.requestTitle}</Text>
                <Text style={styles.lastMessage} numberOfLines={1}>
                    {item.lastMessage || 'Henüz mesaj yok'}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <Text style={styles.screenTitle}>Mesajlar</Text>
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={chats}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <EmptyState
                            icon="chatbubbles-outline"
                            title="Mesaj Kutunuz Boş"
                            message="Taleplerinize gelen teklifleri onayladığınızda veya hizmet verdiğiniz müşterilerle görüşmeye başladığınızda mesajlarınız burada görünecek."
                            color={colors.primary}
                        />
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    screenTitle: {
        ...typography.header,
        color: colors.text,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
        paddingBottom: spacing.sm,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: spacing.md,
    },
    chatCard: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderRadius: 12,
        marginBottom: spacing.sm,
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        alignItems: 'center',
    },
    avatarPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    chatInfo: {
        flex: 1,
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    userName: {
        ...typography.body,
        fontWeight: 'bold',
        color: colors.text,
    },
    timeText: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    requestTitle: {
        ...typography.caption,
        color: colors.secondary,
        marginBottom: 2,
    },
    lastMessage: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    emptyContainer: {
        padding: spacing.xl,
        alignItems: 'center',
        marginTop: spacing.xl,
    },
    emptyText: {
        ...typography.body,
        color: colors.textSecondary,
        marginTop: spacing.md,
        textAlign: 'center',
    }
});
