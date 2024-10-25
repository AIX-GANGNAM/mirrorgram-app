import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getFirestore, collection, query, orderBy, limit, onSnapshot, addDoc } from "firebase/firestore";
import { useSelector } from 'react-redux';
import axios from 'axios';

const db = getFirestore();

const generateUniqueId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

const ChatScreen = ({ route, navigation }) => {
  console.log("ChatScreen 실행");
  const { highlightTitle, highlightImage, persona } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef();

  const user = useSelector(state => state.user.user);

  useEffect(() => {
    loadChatHistory(user.uid, persona);
  }, [user.uid, persona]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const scrollToBottom = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  const loadChatHistory = (uid, personaName, limitCount = 50) => {
    // Firestore 경로: "chats/{uid}/personas/{personaName}/messages"
    const chatRef = collection(db, "chats", uid, "personas", personaName, "messages");
    const q = query(chatRef, orderBy("timestamp", "asc"), limit(limitCount));

    onSnapshot(q, (snapshot) => {
      const loadedMessages = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log("Loaded data:", data); // 디버깅을 위한 로그

        let timestamp = new Date();
        if (data.timestamp) {
          if (typeof data.timestamp.toDate === 'function') {
            timestamp = data.timestamp.toDate();
          } else {
            // 문자열 타임스탬프 처리
            timestamp = new Date(data.timestamp);
          }
        }

        loadedMessages.push({
          id: doc.id, // Firestore 문서 ID 사용
          text: data.text || data.message, // 'text' 또는 'message' 처리
          sender: data.sender === 'user' ? 'user' : 'other',
          timestamp: timestamp
        });
      });
      setMessages(loadedMessages);
    });
  };

  const sendMessage = async () => {
    console.log("sendMessage 실행");
    if (inputText.trim().length > 0) {
      const userMessage = {
        text: inputText,
        sender: 'user',
        timestamp: new Date()
      };

      try {
        // Firestore 경로 수정: "chats/{uid}/personas/{persona}/messages"
        const chatRef = collection(db, "chats", user.uid, "personas", persona, "messages");
        await addDoc(chatRef, userMessage);

        setInputText('');
        setIsTyping(true);

        // 백엔드에 메시지 전송
        const response = await axios.post('http://localhost:8000/v2/chat', {
          persona_name: persona,
          user_input: inputText, // 백엔드가 'input' 필드를 기대함
          uid: user.uid // 백엔드가 'uid'를 기대함
        });

        if (response.data && response.data.response) {
          const botResponse = {
            text: response.data.response,
            sender: 'other', // persona_name이 아닌 'other'로 설정
            timestamp: new Date()
          };
          // Firestore에 봇 응답 메시지 저장
          await addDoc(chatRef, botResponse);
        }
      } catch (error) {
        console.error('Error sending message:', error);
      } finally {
        setIsTyping(false);
      }
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item, index }) => (
    <View key={item.id}>
      {index === 0 || formatTime(item.timestamp) !== formatTime(messages[index - 1].timestamp) ? (
        <Text style={styles.timeStamp}>{formatTime(item.timestamp)}</Text>
      ) : null}
      <View style={[styles.messageBubble, item.sender === 'user' ? styles.userMessage : styles.otherMessage]}>
        <Text style={[styles.messageText, item.sender === 'user' ? styles.userMessageText : styles.otherMessageText]}>{item.text}</Text>
      </View>
    </View>
  );

  const renderTypingIndicator = () => (
    <View style={[styles.messageBubble, styles.otherMessage]}>
      <Text style={styles.typingIndicator}>...</Text>
    </View>
  );

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
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('PersonaProfile', {
                persona: {
                  title: highlightTitle,
                  image: highlightImage,
                  interests: [],
                },
                userId: user.uid
              })
            }
            style={styles.profileContainer}
          >
            <Image source={{ uri: highlightImage }} style={styles.profileImage} />
            <Text style={styles.headerTitle}>{highlightTitle}</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={scrollToBottom}
          onLayout={scrollToBottom}
        />
        {isTyping && renderTypingIndicator()}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.cameraButton}>
            <Ionicons name="camera-outline" size={24} color="#000" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="메시지 보내기..."
            placeholderTextColor="#999"
          />
          {inputText.length > 0 ? (
            <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
              <Text style={styles.sendButtonText}>보내기</Text>
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
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    alignItems: 'center',
  },
  cameraButton: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 10,
  },
  sendButtonText: {
    color: '#0095f6',
    fontWeight: 'bold',
    fontSize: 16,
  },
  micButton: {
    marginLeft: 10,
  },
  typingIndicator: {
    fontSize: 20,
    color: '#999',
  },
});

export default ChatScreen;
