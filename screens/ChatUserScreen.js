import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, TextInput, TouchableOpacity, Text, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { collection, addDoc, onSnapshot, query, orderBy, updateDoc, doc, getDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { db, auth } from '../firebaseConfig';

const ChatScreen = ({ route, navigation }) => {
  const { chatId, recipientId, recipientName: initialRecipientName } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recipientName, setRecipientName] = useState(initialRecipientName || 'Unknown User');
  const flatListRef = useRef(null);

  useEffect(() => {
    const fetchRecipientName = async () => {
      if (!recipientId) {
        console.error("RecipientId is undefined or null");
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', recipientId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData?.username) {
            setRecipientName(userData.username);
          }
        }
      } catch (err) {
        console.error("Error fetching recipient data: ", err);
      }
    };

    if (!initialRecipientName) {
      fetchRecipientName();
    }
  }, [recipientId, initialRecipientName]);

  useEffect(() => {
    navigation.setOptions({ title: recipientName });
  }, [navigation, recipientName]);

  useEffect(() => {
    const q = query(collection(db, `chats/${chatId}/messages`), orderBy('timestamp'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
      setLoading(false);
      flatListRef.current?.scrollToEnd({ animated: true });
    }, (err) => {
      console.error("Error fetching messages: ", err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [chatId]);

  const sendMessage = async () => {
    if (inputMessage.trim() === '') return;

    try {
      const newMessageRef = await addDoc(collection(db, `chats/${chatId}/messages`), {
        text: inputMessage,
        senderId: auth.currentUser.uid,
        timestamp: new Date(),
      });

      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        lastMessage: inputMessage,
        lastMessageTime: new Date(),
      });

      setInputMessage('');
      flatListRef.current?.scrollToEnd({ animated: true });
    } catch (err) {
      console.error("Error sending message: ", err);
      alert("메시지 전송에 실패했습니다.");
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.messageBubble, item.senderId === auth.currentUser.uid ? styles.myMessage : styles.theirMessage]}>
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <Text style={styles.errorText}>Error: {error}</Text>;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messageList}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputMessage}
          onChangeText={(text) => setInputMessage(text)}
          placeholder="메시지를 입력하세요..."
          placeholderTextColor="#888"
          multiline={true}
          blurOnSubmit={false}
          keyboardType="default"
          autoCorrect={false}
          autoCapitalize="none"
          maxLength={1000}
          returnKeyType="done"
          textAlignVertical="top" // 한글 입력 시 충돌 방지
          editable={true} // 한글 입력을 가능하도록 설정
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Ionicons name="send" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  messageList: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    minHeight: 40, // 높이를 최소한으로 설정 (기존 height 대신 minHeight 사용)
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
    backgroundColor: '#f9f9f9',
    textAlignVertical: 'top', // 한글 입력 시 충돌 방지
  },
  sendButton: {
    backgroundColor: '#3897f0',
    borderRadius: 20,
    padding: 10,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 10,
    borderRadius: 15,
    marginVertical: 5,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#dcf8c6',
    borderBottomRightRadius: 0,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e5e5e5',
    borderBottomLeftRadius: 0,
  },
  messageText: {
    fontSize: 16,
  },
  errorText: {
    textAlign: 'center',
    color: 'red',
    marginTop: 20,
  },
});

export default ChatScreen;