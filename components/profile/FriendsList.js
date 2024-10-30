import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { getFirestore, collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const FriendsList = () => {
  const [friends, setFriends] = useState([]);
  const [displayedFriends, setDisplayedFriends] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const auth = getAuth();
  const db = getFirestore();
  const navigation = useNavigation();
  
  useEffect(() => {
    fetchFriends();
  }, []);

  const handleProfilePress = (userData) => {
    navigation.navigate('FriendProfile', {
      userId: userData.userId,
      userName: userData.userName,
      userProfile: {
        userName: userData.userName,
        birthdate: userData.birthdate
      },
      profileImg: userData.profileImg,
      mbti: userData.mbti,
      friendId: userData.friendId
    });
  };

  useEffect(() => {
    if (showAll) {
      setDisplayedFriends(friends);
    } else {
      setDisplayedFriends(friends.slice(0, 10));
    }
  }, [friends, showAll]);

  const fetchFriends = async () => {
    if (!auth.currentUser) return;

    try {
      const q = query(
        collection(db, 'friends'),
        where('userId', '==', auth.currentUser.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const friendPromises = querySnapshot.docs.map(async (docSnapshot) => {
        const friendData = docSnapshot.data();
        
        try {
          const userDoc = await getDoc(doc(db, 'users', friendData.friendId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            return {
              id: docSnapshot.id,
              userId: friendData.friendId,
              friendId: userData.userId,
              userName: userData.profile?.userName || '이름 없음',
              profileImg: userData.profileImg || null,
              mbti: userData.profile?.mbti,
              userProfile: {
                userName: userData.profile?.userName,
                birthdate: userData.profile?.birthdate
              }
            };
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
        return null;
      });

      const friendsData = (await Promise.all(friendPromises)).filter(friend => friend !== null);
      setFriends(friendsData);
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  const renderFriendItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.friendItem}
      onPress={() => handleProfilePress(item)}
    >
      {item.profileImg ? (
        <Image 
          source={{ uri: item.profileImg }} 
          style={styles.profileImage} 
        />
      ) : (
        <View style={styles.profileImagePlaceholder}>
          <Ionicons name="person" size={24} color="#A0A0A0" />
        </View>
      )}
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.userName}</Text>
        <Text style={styles.userId}>@{item.userId}</Text>
        {item.mbti && <Text style={styles.mbti}>{item.mbti}</Text>}
      </View>
    </TouchableOpacity>
  );

  const renderShowMoreButton = () => {
    if (friends.length > 10 && !showAll) {
      return (
        <TouchableOpacity 
          style={styles.showMoreButton}
          onPress={() => setShowAll(true)}
        >
          <Text style={styles.showMoreText}>
            +더보기 ({friends.length - 10}명)
          </Text>
        </TouchableOpacity>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      {friends.length > 0 ? (
        <>
          <FlatList
            data={displayedFriends}
            renderItem={renderFriendItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            ListFooterComponent={renderShowMoreButton}
          />
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={48} color="#A0A0A0" />
          <Text style={styles.emptyText}>아직 친구가 없습니다.</Text>
          <Text style={styles.emptySubText}>친구찾기 탭에서 새로운 친구를 찾아보세요!</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  listContainer: {
    padding: 0,
  },
  friendItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  profileImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  profileImagePlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 2,
  },
  userId: {
    fontSize: 14,
    color: '#536471',
    marginBottom: 2,
  },
  mbti: {
    fontSize: 14,
    color: '#536471',
  },
  showMoreButton: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
  },
  showMoreText: {
    fontSize: 15,
    color: '#000',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#536471',
    textAlign: 'center',
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'center',
  },
});

export default FriendsList;