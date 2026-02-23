import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { colors, spacing, typography, metrics } from '../theme/theme';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppStore } from '../store/useAppStore';
import { db } from '../services/firebase';
import { doc, getDoc, collection, query, where, orderBy, onSnapshot, addDoc, updateDoc } from 'firebase/firestore';
import { Button } from '../components/Button';

type ParamList = {
    Chat: {
        chatId: string;
        reqId: string;
    };
};

export function ChatScreen() {
    const route = useRoute<RouteProp<ParamList, 'Chat'>>();
    const { chatId, reqId } = route.params;
    const navigation = useNavigation();
    const { user, userRole } = useAppStore();

    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [chatData, setChatData] = useState<any>(null);
    const [requestData, setRequestData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!chatId || !reqId) return;

        const fetchMeta = async () => {
            try {
                const cDoc = await getDoc(doc(db, 'chats', chatId));
                if (cDoc.exists()) setChatData(cDoc.data());

                const rDoc = await getDoc(doc(db, 'serviceRequests', reqId));
                if (rDoc.exists()) setRequestData(rDoc.data());
            } catch (error) {
                console.error("Error fetching chat meta:", error);
            }
        };
        fetchMeta();

        // Realtime listener for messages
        const q = query(
            collection(db, 'chats', chatId, 'messages'),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMessages(msgs);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [chatId, reqId]);

    const handleSend = async () => {
        if (!newMessage.trim() || !user) return;

        const text = newMessage.trim();
        setNewMessage('');

        try {
            await addDoc(collection(db, 'chats', chatId, 'messages'), {
                text,
                senderId: user.uid,
                createdAt: new Date().toISOString()
            });

            await updateDoc(doc(db, 'chats', chatId), {
                lastMessage: text,
                lastMessageTime: new Date().toISOString()
            });
        } catch (error) {
            console.error("Error sending message:", error);
            Alert.alert("Hata", "Mesaj gönderilemedi.");
        }
    };

    const handleCompleteJob = () => {
        Alert.alert(
            "İşi Tamamla",
            "Bu işi başarıyla tamamladığınızı onaylıyor musunuz? Müşteriye değerlendirme bildirimi gidecektir.",
            [
                { text: "İptal", style: "cancel" },
                {
                    text: "Evet, Teslim Ettim",
                    onPress: async () => {
                        try {
                            if (!chatData) return;
                            // Update request status
                            await updateDoc(doc(db, 'serviceRequests', reqId), {
                                status: 'completed'
                            });
                            // Update offer status
                            if (chatData.offerId) {
                                await updateDoc(doc(db, 'offers', chatData.offerId), {
                                    status: 'completed'
                                });
                            }
                            Alert.alert("Başarılı", "İş tamamlandı olarak işaretlendi!");
                            navigation.goBack();
                        } catch (error) {
                            console.error("Error completing job:", error);
                            Alert.alert("Hata", "Bir sorun oluştu.");
                        }
                    }
                }
            ]
        );
    };

    const renderMessage = ({ item }: { item: any }) => {
        const isMe = item.senderId === user?.uid;
        return (
            <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.theirMessage]}>
                <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>
                    {item.text}
                </Text>
                <Text style={[styles.timeText, isMe ? styles.myTimeText : styles.theirTimeText]}>
                    {new Date(item.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            {/* Header info about the job */}
            {requestData && (
                <View style={styles.header}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.headerTitle}>{requestData.title || requestData.category}</Text>
                        <Text style={styles.headerSubtitle}>
                            {requestData.status === 'completed' ? 'Tamamlandı' : 'Süreç Devam Ediyor'}
                        </Text>
                    </View>
                    {userRole === 'provider' && requestData.status !== 'completed' && (
                        <TouchableOpacity style={styles.completeBtn} onPress={handleCompleteJob}>
                            <Icon name="checkmark-circle-outline" size={20} color={colors.surface} />
                            <Text style={styles.completeBtnText}>Teslim Et</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <KeyboardAvoidingView
                    style={styles.chatArea}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
                >
                    <FlatList
                        data={messages}
                        keyExtractor={item => item.id}
                        renderItem={renderMessage}
                        inverted // Messages flow from bottom to top
                        contentContainerStyle={styles.listContent}
                    />

                    {requestData?.status !== 'completed' ? (
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Mesaj yazın..."
                                placeholderTextColor={colors.textSecondary}
                                value={newMessage}
                                onChangeText={setNewMessage}
                                multiline
                            />
                            <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={!newMessage.trim()}>
                                <Icon name="send" size={20} color={colors.surface} />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.inputContainer}>
                            <Text style={{ color: colors.textSecondary, textAlign: 'center', flex: 1 }}>Bu iş tamamlandığı için mesajlaşma kapatılmıştır.</Text>
                        </View>
                    )}
                </KeyboardAvoidingView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    header: {
        flexDirection: 'row',
        padding: spacing.md,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        alignItems: 'center',
    },
    headerTitle: {
        ...typography.title,
        color: colors.text,
    },
    headerSubtitle: {
        ...typography.caption,
        color: colors.primary,
    },
    completeBtn: {
        flexDirection: 'row',
        backgroundColor: colors.secondary,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: metrics.borderRadius,
        alignItems: 'center',
        gap: 4,
    },
    completeBtnText: {
        ...typography.caption,
        color: colors.surface,
        fontWeight: 'bold',
    },
    chatArea: {
        flex: 1,
    },
    listContent: {
        padding: spacing.md,
        gap: spacing.sm,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: spacing.md,
        borderRadius: 16,
        marginBottom: spacing.xs,
    },
    myMessage: {
        alignSelf: 'flex-end',
        backgroundColor: colors.primary,
        borderBottomRightRadius: 4,
    },
    theirMessage: {
        alignSelf: 'flex-start',
        backgroundColor: colors.surface,
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: colors.border,
    },
    messageText: {
        ...typography.body,
    },
    myMessageText: {
        color: colors.surface,
    },
    theirMessageText: {
        color: colors.text,
    },
    timeText: {
        fontSize: 10,
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    myTimeText: {
        color: 'rgba(255,255,255,0.7)',
    },
    theirTimeText: {
        color: colors.textSecondary,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: spacing.md,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        alignItems: 'center',
        gap: spacing.sm,
    },
    input: {
        flex: 1,
        backgroundColor: colors.background,
        borderRadius: 20,
        paddingHorizontal: spacing.md,
        paddingTop: 12, // For multiline centering
        paddingBottom: 12,
        maxHeight: 100,
        ...typography.body,
        color: colors.text,
        borderWidth: 1,
        borderColor: colors.border,
    },
    sendButton: {
        backgroundColor: colors.primary,
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
