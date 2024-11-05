import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, TextInput,   ActivityIndicator } from 'react-native';
import { getFirestore, collection, query, where, orderBy, limit, getDocs, getDoc, doc, addDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';

const ChatListScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState(0);
  
  return (
    <View style={{flex: 1}}>
      <View style={{flexDirection: 'row'}}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 0 && styles.activeTab]} 
          onPress={() => setActiveTab(0)}
        >
          <Text style={[styles.tabText, activeTab === 0 && styles.activeTabText]}>
            1:1 대화
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 1 && styles.activeTab]}
          onPress={() => setActiveTab(1)}
        >
          <Text style={[styles.tabText, activeTab === 1 && styles.activeTabText]}>
            페르소나 대화 염탐하기
          </Text>
        </TouchableOpacity>
      </View>
      
      {activeTab === 0 ? (
        <PersonalChats navigation={navigation} />
      ) : (
        <GroupChats navigation={navigation} />
      )}
    </View>
  );
};

const PersonalChats = ({ navigation }) => {
  const [chats, setChats] = useState([]);
  const [search, setSearch] = useState('');
  const [highlights, setHighlights] = useState([]);
  const auth = getAuth();
  const db = getFirestore();
  const user = useSelector(state => state.user.user);

  useEffect(() => {
    if (user?.persona && Array.isArray(user.persona)) {
      const newHighlights = user.persona
        .filter(persona => persona.Name !== 'clone')
        .map((persona, index) => ({
          id: index + 1,
          displayName: persona.DPNAME,
          persona: persona.Name,
          image: persona.IMG
        }));
      setHighlights(newHighlights);
    }
  }, [user]);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser || !user || !user.persona) return;

    const fetchAllChats = async () => {
      try {
        // 1. 페르소나 채팅 가져오기
        const personaChats = await Promise.all(
          highlights.map(async (personaData) => {
            const messagesRef = collection(db, 'chats', currentUser.uid, 'personas', personaData.persona, 'messages');
            const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(1));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
              const lastMessageDoc = querySnapshot.docs[0];
              const lastMessageData = lastMessageDoc.data();

              return {
                id: personaData.persona,
                type: 'persona',
                name: personaData.displayName,
                lastResponse: lastMessageData.message || '',
                sender: lastMessageData.sender,
                lastMessageTime: lastMessageData.timestamp?.toDate() || null,
                profileImage: personaData.image,
              };
            }
            return null;
          })
        );

        // 2. 1대1 채팅 가져오기
        const userChatsRef = collection(db, 'chat');
        const userChatsQuery = query(
          userChatsRef,
          where('info.participants', 'array-contains', currentUser.uid)
        );
        const userChatsSnapshot = await getDocs(userChatsQuery);
        
        const userChats = await Promise.all(
          userChatsSnapshot.docs.map(async (document) => {
            const chatData = document.data();
            // 상대방 ID 찾기
            const otherUserId = chatData.info.participants.find(id => id !== currentUser.uid);
            
            // 상대방 정보 가져오기
            const userDocRef = doc(db, 'users', otherUserId);
            const userDocSnap = await getDoc(userDocRef);
            const userData = userDocSnap.data();

            return {
              id: document.id,
              type: 'user',
              name: userData?.profile?.userName || 'Unknown User',
              lastResponse: chatData.info.lastMessage || '',
              lastMessageTime: chatData.info.lastMessageTime?.toDate() || null,
              profileImage: userData?.profileImg || null,
              recipientId: otherUserId
            };
          })
        );

        // 3. 모든 채팅 합치기 및 정렬
        const allChats = [...personaChats, ...userChats]
          .filter(chat => chat !== null)
          .sort((a, b) => (b.lastMessageTime?.getTime() || 0) - (a.lastMessageTime?.getTime() || 0));

        setChats(allChats);
      } catch (error) {
        console.error('Error fetching chats:', error);
      }
    };

    fetchAllChats();
  }, [user, highlights]);

  const renderChatItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => {
        if (item.type === 'persona') {
          navigation.navigate('Chat', {
            highlightTitle: item.name,
            highlightImage: item.profileImage,
            persona: item.id
          });
        } else {
          navigation.navigate('ChatUser', {
            chatId: item.id,
            recipientId: item.recipientId,
            recipientName: item.name,
            profileImg: item.profileImage
          });
        }
      }}
    >
      <View style={styles.avatarContainer}>
        <Image 
          source={{ uri: item.profileImage }} 
          style={styles.profileImage} 
        />
        {item.type === 'user' && (
          <View style={styles.userBadge}>
            <Icon name="person" size={12} color="#FFFFFF" />
          </View>
        )}
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
        <Text style={styles.lastMessage} numberOfLines={2} ellipsizeMode="tail">
          {item.lastResponse}
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
      {chats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyMessage}>현재 대화가 없습니다.</Text>
          <Text style={styles.emptySubMessage}>새 대화를 시작해보세요!</Text>
        </View>
      ) : (
        <FlatList
          data={chats}
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
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const db = getFirestore();

  // Redux에서 사용자 정보 가져오기
  const user = useSelector(state => state.user.user);
  const personas = ['Joy', 'Anger', 'Sadness', 'custom', 'clone'];
  const highlights = user?.persona?.map((p, index) => ({
    id: index + 1,
    displayName: p.DPNAME,
    persona: p.Name,
    image: p.IMG
  })) || [];
  console.log('Mapped highlights:', highlights);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser || !user || !user.persona) return;

    const fetchAllChats = async () => {
      try {
        // 1. 페르소나 페어 채팅 데이터 가져오기
        const personaPairs = [];
        for (let i = 0; i < personas.length; i++) {
          for (let j = i + 1; j < personas.length; j++) {
            const pairName = `${personas[i]}_${personas[j]}`;
            const messagesRef = collection(db, 'personachat', currentUser.uid, pairName);
            const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(1));
            const querySnapshot = await getDocs(q);

            const persona1 = highlights.find(h => h.persona === personas[i]);
            const persona2 = highlights.find(h => h.persona === personas[j]);

            if (!querySnapshot.empty) {
              const lastMessage = querySnapshot.docs[0].data();
              personaPairs.push({
                id: pairName,
                type: 'persona_pair',
                name: `${persona1.displayName} & ${persona2.displayName}`,
                lastMessage: lastMessage.text || '',
                lastMessageTime: convertToDate(lastMessage.timestamp),
                personas: [
                  { name: persona1.displayName, image: persona1.image },
                  { name: persona2.displayName, image: persona2.image }
                ]
              });
            }
          }
        }

        // 2. 토론 데이터 가져오기
        const debatesRef = collection(db, 'personachat', currentUser.uid, 'debates');
        const debatesQuery = query(debatesRef, orderBy('createdAt', 'desc'));
        const debatesSnapshot = await getDocs(debatesQuery);
        
        const debatesList = [];
        for (const doc of debatesSnapshot.docs) {
          const debateData = doc.data();
          
          const messagesRef = collection(db, 'personachat', currentUser.uid, 'debates', doc.id, 'messages');
          const messagesQuery = query(messagesRef, orderBy('timestamp', 'desc'), limit(1));
          const messagesSnapshot = await getDocs(messagesQuery);
          
          const lastMessage = messagesSnapshot.docs[0]?.data();
          
          const unreadQuery = query(
            messagesRef,
            where('isRead', '==', false)
          );
          const unreadSnapshot = await getDocs(unreadQuery);

          debatesList.push({
            id: doc.id,
            type: 'debate',
            title: debateData.title,
            lastMessage: lastMessage?.text || '',
            lastMessageTime: convertToDate(lastMessage?.timestamp) || convertToDate(debateData.createdAt),
            status: debateData.status,
            unreadCount: unreadSnapshot.size
          });
        }

        // 3. 모든 채팅 데이터 합치기 및 정렬
        const allChats = [...personaPairs, ...debatesList];
        allChats.sort((a, b) => (b.lastMessageTime?.getTime() || 0) - (a.lastMessageTime?.getTime() || 0));
        
        setGroupChats(allChats);
        setLoading(false);
      } catch (error) {
        console.error('채팅 목록 불러오기 실패:', error);
        setLoading(false);
      }
    };

    fetchAllChats();
  }, [user]);

  const filteredChats = search
    ? groupChats.filter(chat => chat.name?.toLowerCase().includes(search.toLowerCase()))
    : groupChats;

  const renderGroupChatItem = ({ item }) => {
    if (item.type === 'debate') {
      // 토론 채팅 렌더링
      return (
        <TouchableOpacity
          style={styles.chatItem}
          onPress={() => navigation.navigate('DebateChat', { debateId: item.id })}
        >
          <View style={styles.profileImageContainer}>
            <Icon name="chatbubbles" size={40} color="#5271ff" />
          </View>
          <View style={styles.chatInfo}>
            <View style={styles.chatHeader}>
              <Text style={styles.chatName}>{item.title}</Text>
              {item.lastMessageTime && (
                <Text style={styles.timestamp}>
                  {formatTimestamp(item.lastMessageTime)}
                </Text>
              )}
            </View>
            <Text style={styles.lastMessage} numberOfLines={2} ellipsizeMode="tail">
              {item.lastMessage}
            </Text>
          </View>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      );
    }
    
    // 페르소나 페어 채팅 렌더링
    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => navigation.navigate('PersonaChat', { 
          pairName: item.id,  // 예: "Fear_Joy"
          personas: [
            {
              name: item.personas[0].name,
              image: item.personas[0].image,
              persona: item.id.split('_')[0]  // 첫 번째 페르소나 타입 (예: "Fear")
            },
            {
              name: item.personas[1].name,
              image: item.personas[1].image,
              persona: item.id.split('_')[1]  // 두 번째 페르소나 타입 (예: "Joy")
            }
          ]
        })}
      >
        <View style={styles.profileImageContainer}>
          {item.personas.map((persona, index) => (
            <Image 
              key={index} 
              source={{ uri: persona.image }} 
              style={[
                styles.groupProfileImage,
                index > 0 && { marginLeft: -15 }
              ]} 
            />
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
          <Text style={styles.lastMessage} numberOfLines={2} ellipsizeMode="tail">
            {item.lastMessage}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

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

// timestamp를 Date 객체로 변환하는 헬퍼 함수 추가
const convertToDate = (timestamp) => {
  if (!timestamp) return null;
  
  // Firestore Timestamp인 경우
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  
  // 문자열인 경우
  if (typeof timestamp === 'string') {
    return new Date(timestamp);
  }
  
  // 이미 Date 객체인 경우
  if (timestamp instanceof Date) {
    return timestamp;
  }
  
  return null;
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
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#FFFFFF',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  profileImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f0f0',
  },
  userBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#5271FF',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  chatInfo: {
    flex: 1,
    marginRight: 8,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#141619',
  },
  lastMessage: {
    fontSize: 15,
    color: '#687684',
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 13,
    color: '#687684',
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
  debateIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginRight: 16,
  },
  tab: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#e0e0e0'
  },
  activeTab: {
    borderBottomColor: '#5271ff'
  },
  tabText: {
    fontSize: 16,
    color: '#8e8e8e'
  },
  activeTabText: {
    color: '#5271ff',
    fontWeight: 'bold'
  }
});

export default ChatListScreen;
