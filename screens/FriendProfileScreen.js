import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import ProfileInfo from '../components/profile/ProfileInfo';

import ProfileGallery from '../components/profile/ProfileGallery';

const FriendProfileScreen = ({ route }) => {
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

  if (!userData) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileContainer}>
        <ProfileInfo 
          user={userData}
          showAddFriend={!isFriend}
          targetUserId={userId}
        />
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
  }
});

export default FriendProfileScreen;