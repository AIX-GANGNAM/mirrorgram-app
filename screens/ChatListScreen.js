import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, TextInput,   ActivityIndicator } from 'react-native';
import { getFirestore, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';


const Tab = createMaterialTopTabNavigator();

const ChatListScreen = ({ navigation }) => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarIndicatorStyle: { backgroundColor: '#5271ff' },
        tabBarLabelStyle: { fontSize: 16, fontWeight: 'bold' },
        tabBarActiveTintColor: '#5271ff',
        tabBarInactiveTintColor: '#8e8e8e',
      }}
    >
      <Tab.Screen name="1:1 대화">
        {() => <PersonalChats navigation={navigation} />}
      </Tab.Screen>
      <Tab.Screen name="페르소나 대화 염탐하기">
        {() => <GroupChats navigation={navigation} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};
const PersonalChats = ({ navigation }) => {
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
          // 경로 수정: /chats/{uid}/personas/{persona}/messages
          const messagesRef = collection(db, 'chats', currentUser.uid, 'personas', personaName, 'messages');
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
              name: displayName,
              lastResponse: lastMessageData.message || '', // 'text' 필드로 변경
              sender: lastMessageData.sender, // sender 필드 추가
              lastMessageTime: lastMessageData.timestamp ? lastMessageData.timestamp.toDate() : null,
              profileImage: personaImage,
            };
          } else {
            return {
              id: personaName,
              name: displayName,
              lastResponse: '',
              sender: '',
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
      onPress={() => navigation.navigate('Chat', { highlightTitle: item.name, highlightImage: item.profileImage, persona: item.id })}
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
        <Text
          style={styles.lastMessage}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {item.lastResponse && item.lastResponse.length > 50
            ? item.lastResponse.substring(0, 50) + '...'
            : item.lastResponse}
        </Text>
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

const GroupChats = ({ navigation }) => {
  const [groupChats, setGroupChats] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true); // 로딩 상태 추가
  const auth = getAuth();
  const db = getFirestore();

  // Redux에서 사용자 정보 가져오기
  const user = useSelector(state => state.user.user);
  const personas = ['Anger', 'Disgust', 'Joy', 'Sadness', 'Fear'];
  const highlights = [
    { id: 1, displayName: '기쁨이', persona: 'Joy', image: user.persona.joy },
    { id: 2, displayName: '화남이', persona: 'Anger', image: user.persona.anger },
    { id: 3, displayName: '까칠이', persona: 'Disgust', image: user.persona.disgust },
    { id: 4, displayName: '슬픔이', persona: 'Sadness', image: user.persona.sadness },
    { id: 5, displayName: '선비', persona: 'Fear', image: user.persona.serious },
  ];

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser || !user || !user.persona) return;

    const fetchGroupChats = async () => {
      // 모든 페르소나 조합 생성 (모든 순서 포함)
      const personaPairs = [];
      for (let i = 0; i < personas.length; i++) {
        for (let j = 0; j < personas.length; j++) {
          if (i !== j) {
            personaPairs.push({ pairName: `${personas[i]}_${personas[j]}`, personas: [personas[i], personas[j]] });
          }
        }
      }

      const groupChatList = [];

      await Promise.all(
        personaPairs.map(async (pair) => {
          const messagesRef = collection(db, 'personachat', currentUser.uid, pair.pairName);
          const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(1));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const lastMessageDoc = querySnapshot.docs[0];
            const lastMessageData = lastMessageDoc.data();

            // 스피커 정보 가져오기
            const speakerData = highlights.find(item => item.persona === lastMessageData.speaker);
            const speakerName = speakerData ? speakerData.displayName : lastMessageData.speaker;
            const speakerImage = speakerData ? speakerData.image : null;

            // 다른 페르소나 정보 가져오기
            const otherPersona = pair.personas.find(p => p !== lastMessageData.speaker);
            const otherPersonaData = highlights.find(item => item.persona === otherPersona);
            const otherPersonaName = otherPersonaData ? otherPersonaData.displayName : otherPersona;
            const otherPersonaImage = otherPersonaData ? otherPersonaData.image : null;

            // 안 읽은 메시지 개수 가져오기
            const unreadQuery = query(
              collection(db, 'personachat', currentUser.uid, pair.pairName),
              where('isRead', '==', false)
            );
            const unreadSnapshot = await getDocs(unreadQuery);
            const unreadCount = unreadSnapshot.size;

            groupChatList.push({
              id: pair.pairName,
              name: `${speakerName} & ${otherPersonaName}`,
              lastMessage: lastMessageData.text || '',
              lastMessageTime: lastMessageData.timestamp ? new Date(lastMessageData.timestamp) : null, // 수정된 부분
              personas: [
                { name: speakerName, image: speakerImage, persona: lastMessageData.speaker },
                { name: otherPersonaName, image: otherPersonaImage, persona: otherPersona },
              ],
              unreadCount: unreadCount,
            });
          }
        })
      );

      // 마지막 메시지 시간으로 정렬
      groupChatList.sort((a, b) => (b.lastMessageTime?.getTime() || 0) - (a.lastMessageTime?.getTime() || 0));

      setGroupChats(groupChatList);
      setLoading(false); // 로딩 완료
    };

    fetchGroupChats();
  }, [user]);

  const filteredChats = search
    ? groupChats.filter(chat => chat.name?.toLowerCase().includes(search.toLowerCase()))
    : groupChats;

  const renderGroupChatItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => navigation.navigate('PersonaChat', { pairName: item.id, personas: item.personas })}
    >
      <View style={styles.profileImageContainer}>
        {item.personas.map((persona, index) => (
          <Image key={index} source={{ uri: persona.image }} style={styles.groupProfileImage} />
        ))}
      </View>
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName}>{item.name}</Text>
          {item.lastMessageTime && (
            <Text style={styles.timestamp}>
              {formatTimestamp(item.lastMessageTime)}
            </Text>
          )}
        </View>
        <Text
          style={styles.lastMessage}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {item.lastMessage && item.lastMessage.length > 50
            ? item.lastMessage.substring(0, 50) + '...'
            : item.lastMessage}
        </Text>
      </View>
      {item.unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
        </View>
      )}
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5271ff" />
        <Text style={styles.loadingText}>대화 목록을 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 헤더 및 검색 바 */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>페르소나 대화 염탐하기</Text>
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
      {/* 단체 채팅 목록 */}
      {filteredChats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyMessage}>현재 대화 중인 페르소나 채팅이 없습니다.</Text>
          <Text style={styles.emptySubMessage}>기다리면 대화를 할거예요!</Text>
        </View>
      ) : (
        <FlatList
          data={filteredChats}
          keyExtractor={(item) => item.id}
          renderItem={renderGroupChatItem}
        />
      )}
    </View>
  );
};

// 스타일 정의
const styles = StyleSheet.create({
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
  profileImageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  groupProfileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: -10, // 이미지 겹치기
    borderWidth: 1,
    borderColor: '#fff',
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
  unreadBadge: {
    backgroundColor: '#ff3b30',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  unreadBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingContainer: { // 로딩 상태 스타일
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#5271ff',
  },
});

export default ChatListScreen;
