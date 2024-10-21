import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, collection, addDoc, query, where, getDocs, doc as firestoreDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';

const FriendProfileScreen = ({ route }) => {
  const { name, accountName, profileImage, post, followers, following } = route.params;
  const [follow, setFollow] = useState(route.params.follow);
  const [resolvedProfileImage, setResolvedProfileImage] = useState(profileImage);
  const navigation = useNavigation();
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const userDoc = await getDoc(firestoreDoc(db, 'users', accountName));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setResolvedProfileImage(userData.profileimg || profileImage);
        }
      } catch (error) {
        console.error("Error fetching user profile image: ", error);
      }
    };
    fetchProfileImage();
  }, [accountName, profileImage, db]);

  const startChat = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('participants', 'array-contains', currentUser.uid)
    );
    const querySnapshot = await getDocs(q);

    let existingChat = null;
    querySnapshot.forEach((doc) => {
      const chatData = doc.data();
      if (chatData.participants.includes(accountName)) {
        existingChat = { id: doc.id, ...chatData };
      }
    });

    if (existingChat) {
      navigation.navigate('ChatUser', { chatId: existingChat.id, recipientId: accountName, recipientName: name });
    } else {
      const newChat = await addDoc(chatsRef, {
        participants: [currentUser.uid, accountName],
        lastMessage: '',
        lastMessageTime: new Date(),
        profileImages: {
          [currentUser.uid]: currentUser.photoURL || '',
          [accountName]: resolvedProfileImage, // 상대방의 프로필 이미지 URL을 저장
        },
      });
      navigation.navigate('ChatUser', { chatId: newChat.id, recipientId: accountName, recipientName: name });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.profileInfo}>
          <Image source={{ uri: resolvedProfileImage }} style={styles.profileImage} />
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{post}</Text>
              <Text style={styles.statLabel}>게시물</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{followers}</Text>
              <Text style={styles.statLabel}>팔로워</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{following}</Text>
              <Text style={styles.statLabel}>팔로잉</Text>
            </View>
          </View>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.button, follow ? styles.followingButton : styles.followButton]}
            onPress={() => setFollow(!follow)}
          >
            <Text style={follow ? styles.followingButtonText : styles.followButtonText}>
              {follow ? '팔로잉' : '팔로우'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.messageButton} onPress={startChat}>
            <Text style={styles.messageButtonText}>메시지</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginTop: 30,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileInfo: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    marginLeft: 20,
  },
  stat: {
    alignItems: 'center',
    marginHorizontal: 15,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 15,
  },
  button: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  followButton: {
    backgroundColor: '#3897f0',
  },
  followingButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dbdbdb',
  },
  followButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  followingButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  messageButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
    backgroundColor: '#efefef',
  },
  messageButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
});

export default FriendProfileScreen;