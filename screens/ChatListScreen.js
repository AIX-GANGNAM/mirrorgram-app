import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, TextInput } from 'react-native';
import { getFirestore, collection, query, where, onSnapshot, doc as firestoreDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';

const ChatListScreen = ({ navigation }) => {
  const [chats, setChats] = useState([]);
  const [search, setSearch] = useState('');
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', currentUser.uid));

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const chatList = await Promise.all(
        querySnapshot.docs.map(async (chatDocument) => {
          const chatData = chatDocument.data();

          if (!chatData || !chatData.participants) {
            return null;
          }

          // 상대방의 UID를 participants 배열에서 찾음
          const otherParticipantUid = chatData.participants[1] === currentUser.uid ? chatData.participants[0] : chatData.participants[1];

          let profileImage = 'https://via.placeholder.com/50';
          let chatName = 'Unknown User';
          let userId = otherParticipantUid;

          if (otherParticipantUid) {
            try {
              const userDoc = await getDoc(firestoreDoc(db, 'users', otherParticipantUid));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                chatName = userData?.username || chatName;
                profileImage = userData?.profileimg || profileImage;
              } else {
                chatName = chatData.participants.find(participant => participant !== currentUser.uid) || chatName;
                profileImage = chatData?.profileImages?.[otherParticipantUid] || profileImage;
              }
            } catch (error) {
              console.error("Error fetching user data: ", error);
            }
          }

          return {
            id: chatDocument.id,
            userId: userId, // 상대방 UID 추가
            name: chatName,
            lastMessage: chatData.lastMessage ? chatData.lastMessage : '',
            lastMessageTime: chatData.lastMessageTime ? chatData.lastMessageTime : 0, // 메시지 시간 정보 추가
            profileImage: profileImage,
          };
        })
      );

      // 최신 메시지 순으로 정렬
      chatList.sort((a, b) => b.lastMessageTime - a.lastMessageTime);

      setChats(chatList.filter(chat => chat !== null));
    });

    return () => unsubscribe();
  }, []);

  const filteredChats = search
    ? chats.filter(chat => chat.name?.toLowerCase().includes(search.toLowerCase()))
    : chats;

  const renderChatItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => navigation.navigate('ChatUser', { chatId: item.id, recipientId: item.userId, recipientName: item.name })}
    >
      <Image source={{ uri: item.profileImage }} style={styles.profileImage} />
      <View style={styles.chatInfo}>
        <Text style={styles.chatName}>{item.name}</Text>
        <Text style={styles.lastMessage}>{item.lastMessage}</Text>
      </View>
      <Icon name="chevron-forward" size={20} color="#8e8e8e" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
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
});

export default ChatListScreen;