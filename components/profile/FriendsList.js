import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  StyleSheet,
  Alert
} from 'react-native';
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc, 
  doc,
  deleteDoc 
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';

const FriendsList = () => {
  const [friends, setFriends] = useState([]);
  const [displayedFriends, setDisplayedFriends] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const auth = getAuth();
  const db = getFirestore();
  
  useEffect(() => {
    fetchFriends();
  }, []);

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
              userName: userData.profile?.userName || '이름 없음',
              profileImg: userData.profileImg || null,
              friendId: friendData.friendId,
              ...friendData
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

  const deleteFriend = async (friendId, friendDocId) => {
    try {
      // 현재 사용자의 친구 목록에서 삭제
      await deleteDoc(doc(db, 'friends', friendDocId));
      
      // 상대방의 친구 목록에서도 삭제
      const oppositeQuery = query(
        collection(db, 'friends'),
        where('userId', '==', friendId),
        where('friendId', '==', auth.currentUser.uid)
      );
      
      const oppositeSnapshot = await getDocs(oppositeQuery);
      const deletePromises = oppositeSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // UI 업데이트
      setFriends(prevFriends => prevFriends.filter(friend => friend.id !== friendDocId));
      
      Alert.alert('알림', '친구가 삭제되었습니다.');
    } catch (error) {
      console.error('Error deleting friend:', error);
      Alert.alert('오류', '친구 삭제 중 문제가 발생했습니다.');
    }
  };

  const handleDeleteFriend = (friend) => {
    Alert.alert(
      '친구 삭제',
      `${friend.userName}님을 친구 목록에서 삭제하시겠습니까?`,
      [
        {
          text: '취소',
          style: 'cancel'
        },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => deleteFriend(friend.friendId, friend.id)
        }
      ]
    );
  };

  const renderFriendItem = ({ item }) => (
    <TouchableOpacity style={styles.friendItem}>
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
      </View>
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => handleDeleteFriend(item)}
      >
        <Ionicons name="trash-outline" size={20} color="#FF4444" />
      </TouchableOpacity>
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
    padding: 16,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  profileImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  friendInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  friendName: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
  },
  showMoreButton: {
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
    marginTop: 8,
  },
  showMoreText: {
    fontSize: 14,
    color: '#5271ff',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginVertical: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'center',
  },
});

export default FriendsList;