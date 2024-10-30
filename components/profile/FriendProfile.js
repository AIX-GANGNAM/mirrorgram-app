import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Alert } from 'react-native';
import { getFirestore, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import ProfileInfo from './ProfileInfo';
import ProfileGallery from './ProfileGallery';
//FriendSearch에서 전달받은 사용자 정보를 표시
//친구 관계를 확인하여 친구가 아닌 경우 친구 추가 버튼 표시
//ProfileInfo와 ProfileGallery 컴포넌트를 사용하여 프로필 정보와 게시물 표시
const FriendProfile = ({ route }) => {
  const [userData, setUserData] = useState(null);
  const [isFriend, setIsFriend] = useState(false);
  const db = getFirestore();
  const auth = getAuth();
  const { userId, userName, profileImg, mbti, friendId } = route.params;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // 친구 관계 확인
        const friendsQuery = query(
          collection(db, 'friends'),
          where('userId', '==', auth.currentUser.uid),
          where('friendId', '==', userId)
        );
        const friendSnapshot = await getDocs(friendsQuery);
        setIsFriend(!friendSnapshot.empty);

        // 사용자 데이터 설정
        setUserData({
          uid: userId,
          profileImg: profileImg,
          userId: friendId,
          profile: {
            userName: userName,
            mbti: mbti
          }
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleAddFriend = async () => {
    try {
      const currentUser = auth.currentUser;
      
      // 이미 친구 요청을 보냈는지 확인
      const requestQuery = query(
        collection(db, 'friendRequests'),
        where('fromId', '==', currentUser.uid),
        where('toId', '==', userId)
      );
      const requestSnapshot = await getDocs(requestQuery);
      
      if (!requestSnapshot.empty) {
        Alert.alert('알림', '이미 친구 요청을 보냈습니다.');
        return;
      }

      // 친구 요청 보내기
      await addDoc(collection(db, 'friendRequests'), {
        fromId: currentUser.uid,
        toId: userId,
        status: 'pending',
        timestamp: new Date().toISOString()
      });

      Alert.alert('성공', '친구 요청을 보냈습니다.');
    } catch (error) {
      console.error('Error adding friend:', error);
      Alert.alert('오류', '친구 요청 중 오류가 발생했습니다.');
    }
  };

  if (!userData) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileContainer}>
        <ProfileInfo user={userData} />
        {!isFriend && (
          <TouchableOpacity 
            style={styles.addFriendButton}
            onPress={handleAddFriend}
          >
            <Text style={styles.addFriendButtonText}>친구 추가</Text>
          </TouchableOpacity>
        )}
      </View>
      <ProfileGallery user={userData} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  profileContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
    paddingBottom: 16,
  },
  addFriendButton: {
    backgroundColor: '#5271ff',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
  },
  addFriendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  }
});

export default FriendProfile;