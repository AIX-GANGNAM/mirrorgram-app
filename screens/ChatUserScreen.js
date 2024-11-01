import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  Image, 
  SafeAreaView, 
  ActivityIndicator 
} from 'react-native';
import { collection, addDoc, onSnapshot, query, orderBy, updateDoc, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { db, auth } from '../firebaseConfig';
import { useSelector } from 'react-redux';
import axios from 'axios';

const ChatUserScreen = ({ route, navigation }) => {
  const { 
    chatId, 
    recipientId, 
    recipientName = 'Unknown User',
    profileImg 
  } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const currentUser = useSelector(state => state.user.user);
  const flatListRef = useRef(null);
  const ACTIVITY_THRESHOLD = 5 * 60 * 1000; // 5분

  useEffect(() => {
    const initializeChat = async () => {
      try {
        const chatRef = doc(db, 'chat', chatId);
        const chatDoc = await getDoc(chatRef);
        
        if (!chatDoc.exists()) {
          // 채팅방 생성
          await setDoc(chatRef, {
            info: {
              participants: [currentUser.uid, recipientId],
              createdAt: new Date(),
              lastMessage: '',
              lastMessageTime: new Date(),
              lastSenderId: ''
            }
          });
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
      }
    };

    initializeChat();
  }, [chatId, currentUser.uid, recipientId]);

  useEffect(() => {
    // 메시지 실시간 리스닝
    const q = query(
      collection(db, `chat/${chatId}/messages`), 
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(newMessages);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [chatId]);

  const checkUserActivity = async () => {
    try {
      const userRef = doc(db, 'users', recipientId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const lastActivity = userData.lastActivity?.toDate();
        
        if (!lastActivity) return false;
        
        const now = new Date();
        const timeDiff = now - lastActivity;
        console.log('마지막 활동으로부터 경과 시간(분):', timeDiff / 1000 / 60);
        return timeDiff < ACTIVITY_THRESHOLD;
      }
      return false;
    } catch (error) {
      console.error('활동 상태 확인 실패:', error);
      return false;
    }
  };

  const sendMessage = async () => {
    if (inputMessage.trim() === '') return;
    
    // 전송할 메시지 임시 저장
    const messageToSend = inputMessage;

    try {
        // 메시지 데이터 준비
        const messageData = {
            senderId: currentUser.uid,
            recipientId: recipientId,
            chatId: chatId,
            message: messageToSend,
            timestamp: new Date().toISOString()
        };

        // 전송 버튼 비활성화 또는 로딩 상태 표시 가능
        // setIsSending(true); 

        // 백엔드로 메시지 전송
        const response = await axios.post('http://localhost:8000/clone-chat', messageData);

        // 전송 성공 시에만 입력창 초기화
        if (response.status === 200) {
            setInputMessage('');
        } else {
            throw new Error('메시지 전송 실패');
        }

    } catch (error) {
        console.error('메시지 전송 실패:', error);
        alert('메시지 전송에 실패했습니다. 다시 시도해주세요.');
    } finally {
        // 전송 버튼 활성화 또는 로딩 상태 해제
        // setIsSending(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    // Firestore Timestamp 객체인 경우
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    // Date 객체인 경우
    if (timestamp instanceof Date) {
      return timestamp.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }

    // timestamp가 숫자(밀리초)인 경우
    if (typeof timestamp === 'number') {
      return new Date(timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }

    return '';
  };

  const renderMessage = ({ item, index }) => {
    const isAIMessage = item.isAI;
    
    const currentTime = item.timestamp ? formatTime(item.timestamp) : '';
    const previousTime = index > 0 && messages[index - 1].timestamp ? 
      formatTime(messages[index - 1].timestamp) : '';

    return (
      <View key={item.id}>
        {(index === 0 || currentTime !== previousTime) && currentTime ? (
          <Text style={styles.timeStamp}>{currentTime}</Text>
        ) : null}
        <View style={[
          styles.messageBubble,
          item.senderId === currentUser.uid ? styles.userMessage : styles.otherMessage,
          isAIMessage && styles.aiMessage
        ]}>
          {isAIMessage && (
            <Text style={styles.aiLabel}>AI 응답</Text>
          )}
          <Text style={[
            styles.messageText,
            item.senderId === currentUser.uid ? styles.userMessageText : styles.otherMessageText
          ]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0095f6" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileContainer}>
            <Image 
              source={{ uri: profileImg || 'default_image_url' }} 
              style={styles.profileImage} 
            />
            <Text style={styles.headerTitle}>{recipientName}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.chatContainer}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.messageList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            onLayout={() => flatListRef.current?.scrollToEnd()}
          />
        </View>

        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.cameraButton}>
            <Ionicons name="camera-outline" size={24} color="#000" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={inputMessage}
            onChangeText={setInputMessage}
            placeholder="메시지 보내기..."
            placeholderTextColor="#999"
            multiline
            maxLength={1000}
          />
          {inputMessage.length > 0 ? (
            <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
              <Ionicons name="send" size={24} color="#0095f6" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.micButton}>
              <Ionicons name="mic-outline" size={24} color="#000" />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 40 : 25,
    backgroundColor: '#fff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    marginRight: 10,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  chatContainer: {
    flex: 1,
  },
  messageList: {
    paddingVertical: 10,
  },
  messageBubble: {
    maxWidth: '70%',
    padding: 10,
    borderRadius: 20,
    marginVertical: 2,
    marginHorizontal: 10,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#0095f6',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
  },
  messageText: {
    fontSize: 16,
  },
  userMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#000',
  },
  timeStamp: {
    alignSelf: 'center',
    color: '#999',
    fontSize: 12,
    marginVertical: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  cameraButton: {
    marginRight: 10,
    padding: 5,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#f0f2f5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    marginHorizontal: 8,
  },
  sendButton: {
    padding: 5,
    marginLeft: 5,
  },
  micButton: {
    padding: 5,
    marginLeft: 5,
  },
  errorText: {
    textAlign: 'center',
    color: 'red',
    marginTop: 20,
  },
  aiMessage: {
    backgroundColor: '#E8F5E9',
  },
  aiLabel: {
    fontSize: 10,
    color: '#4CAF50',
    marginBottom: 4,
  }
});

export default ChatUserScreen;