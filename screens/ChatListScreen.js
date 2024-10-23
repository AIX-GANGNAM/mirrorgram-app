import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, TextInput } from 'react-native';
import { getFirestore, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useSelector } from 'react-redux'; // Redux에서 상태를 가져오기 위해 추가
import Icon from 'react-native-vector-icons/Ionicons';

const ChatListScreen = ({ navigation }) => {
  const [chats, setChats] = useState([]);
  const [search, setSearch] = useState('');
  const auth = getAuth();
  const db = getFirestore();

  // Redux에서 사용자 정보 가져오기
  const user = useSelector(state => state.user.user);
  const highlights = [
    { id: 1, displayName: '기쁨이', persona: 'Joy',  image: user.persona.joy },
    { id: 2, displayName: '화남이', persona: 'Anger', image: user.persona.anger },
    { id: 3, displayName: '까칠이', persona: 'Disgust', image: user.persona.disgust },
    { id: 4, displayName: '슬픔이', persona: 'Sadness', image: user.persona.sadness },
    { id: 5, displayName: '선비',   persona: 'Fear', image: user.persona.serious },
  ];

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser || !user || !user.persona) return;

    const fetchChats = async () => {
      const personas = ['Anger', 'Disgust', 'Joy', 'Sadness', 'Fear']; // 페르소나 목록

      const chatList = await Promise.all(
        personas.map(async (personaName) => {
          const messagesRef = collection(db, 'chat', currentUser.uid, personaName);
          const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(1));
          const querySnapshot = await getDocs(q);

          // 해당 페르소나의 이미지와 표시 이름 가져오기
          const personaData = highlights.find(item => item.persona === personaName);
          const personaImage = personaData?.image;
          const displayName = personaData?.displayName || personaName;

          if (!querySnapshot.empty) {
            const lastMessageDoc = querySnapshot.docs[0];
            const lastMessageData = lastMessageDoc.data();

            return {
              id: personaName,
              name: displayName, // 표시 이름 사용
              lastResponse: lastMessageData.response || '',
              lastUserInput: lastMessageData.user_input || '',
              lastMessageTime: lastMessageData.timestamp ? lastMessageData.timestamp.toDate() : null,
              profileImage: personaImage,
            };
          } else {
            // 메시지가 없을 경우에도 페르소나를 표시하려면 아래 코드 사용
            return {
              id: personaName,
              name: displayName, // 표시 이름 사용
              lastResponse: '',
              lastUserInput: '',
              lastMessageTime: null,
              profileImage: personaImage,
            };
          }
        })
      );

      // 마지막 메시지 시간으로 정렬
      chatList.sort((a, b) => (b.lastMessageTime?.getTime() || 0) - (a.lastMessageTime?.getTime() || 0));

      setChats(chatList);
    };

    fetchChats();
  }, [user]);

  const filteredChats = search
    ? chats.filter(chat => chat.name?.toLowerCase().includes(search.toLowerCase()))
    : chats;

  const renderChatItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => navigation.navigate('Chat', { highlightTitle : item.name , highlightImage : item.profileImage, persona : item.id })}
    >
      <Image source={{ uri: item.profileImage }} style={styles.profileImage} />
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName}>{item.name}</Text>
          {item.lastMessageTime && (
            <Text style={styles.timestamp}>
              {formatTimestamp(item.lastMessageTime)}
            </Text>
          )}
        </View>
        <Text style={styles.lastMessage}>{item.lastResponse}</Text>
      </View>
      <Icon name="chevron-forward" size={20} color="#8e8e8e" />
    </TouchableOpacity>
  );

  // 타임스탬프 포맷팅 함수
  const formatTimestamp = (date) => {
    const now = new Date();
    const isToday = now.toDateString() === date.toDateString();
    if (isToday) {
      // 오늘이면 시간만 표시
      return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    } else {
      // 오늘이 아니면 날짜만 표시
      return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
    }
  };

  return (
    <View style={styles.container}>
      {/* 헤더 및 검색 바 */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>채팅</Text>
        <TouchableOpacity onPress={() => navigation.navigate('NewChat')}>
          <Icon name="add-circle-outline" size={28} color="#262626" />
        </TouchableOpacity>
      </View>
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#8e8e8e" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="검색"
          placeholderTextColor="#8e8e8e"
          value={search}
          onChangeText={setSearch}
        />
      </View>
      {/* 채팅 목록 */}
      {filteredChats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyMessage}>현재 대화가 없습니다.</Text>
          <Text style={styles.emptySubMessage}>새 대화를 시작해보세요!</Text>
        </View>
      ) : (
        <FlatList
          data={filteredChats}
          keyExtractor={(item) => item.id}
          renderItem={renderChatItem}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // 스타일 정의는 기존 코드와 동일합니다.
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#efefef',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#262626',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#f1f1f1',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#262626',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyMessage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#262626',
  },
  emptySubMessage: {
    fontSize: 14,
    color: '#8e8e8e',
    marginTop: 8,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#efefef',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  chatInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chatName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#262626',
  },
  lastMessage: {
    fontSize: 14,
    color: '#8e8e8e',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#8e8e8e',
  },
});

export default ChatListScreen;
