import React, { useState } from 'react';
import { View, TextInput, FlatList, Image, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { getFirestore, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const FriendSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchType, setSearchType] = useState('id'); // 'id' or 'mbti'
  const auth = getAuth();
  const db = getFirestore();
  const navigation = useNavigation();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      let results = [];
      const currentUser = auth.currentUser;

      if (searchType === 'id') {
        // 아이디로 검색
        const idQuery = query(
          collection(db, 'users'),
          where('userId', '>=', searchQuery.toLowerCase()),
          where('userId', '<=', searchQuery.toLowerCase() + '\uf8ff')
        );
        const idSnapshot = await getDocs(idQuery);
        
        // 이름으로 검색
        const nameQuery = query(
          collection(db, 'users'),
          where('profile.userName', '>=', searchQuery),
          where('profile.userName', '<=', searchQuery + '\uf8ff')
        );
        const nameSnapshot = await getDocs(nameQuery);

        // 결과 합치기 (현재 로그인한 사용자 제외)
        const combinedResults = new Map();
        
        idSnapshot.forEach((doc) => {
          if (doc.id !== currentUser.uid) {
            combinedResults.set(doc.id, {
              id: doc.id,
              ...doc.data()
            });
          }
        });

        nameSnapshot.forEach((doc) => {
          if (doc.id !== currentUser.uid) {
            combinedResults.set(doc.id, {
              id: doc.id,
              ...doc.data()
            });
          }
        });

        results = Array.from(combinedResults.values());
      } else {
        // MBTI로 검색
        const mbtiQuery = query(
          collection(db, 'users'),
          where('profile.mbti', '==', searchQuery.toUpperCase())
        );
        const mbtiSnapshot = await getDocs(mbtiQuery);
        results = mbtiSnapshot.docs
          .filter(doc => doc.id !== currentUser.uid)
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
      }
      
      // 친구 목록 가져오기
      const friendsQuery = query(
        collection(db, 'friends'),
        where('userId', '==', currentUser.uid)
      );
      const friendsSnapshot = await getDocs(friendsQuery);
      const friendIds = new Set(friendsSnapshot.docs.map(doc => doc.data().friendId));
      
      // 친구 상태 표시하기
      results = results.map(user => ({
        ...user,
        isFriend: friendIds.has(user.id)
      }));
      
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
      Alert.alert('검색 오류', '사용자 검색 중 오류가 발생했습니다.');
    }
  };

  const handleAddFriend = async (userId) => {
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

  const handleProfilePress = (userData) => {
    navigation.navigate('FriendProfile', {
      userId: userData.id,
      userName: userData.profile?.userName,
      userProfile: userData.profile,
      profileImg: userData.profileImg,
      mbti: userData.profile?.mbti,
      friendId: userData.userId
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchTypeContainer}>
        <TouchableOpacity 
          style={[styles.typeButton, searchType === 'id' && styles.activeType]}
          onPress={() => setSearchType('id')}
        >
          <Text style={[styles.typeText, searchType === 'id' && styles.activeTypeText]}>아이디</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.typeButton, searchType === 'mbti' && styles.activeType]}
          onPress={() => setSearchType('mbti')}
        >
          <Text style={[styles.typeText, searchType === 'mbti' && styles.activeTypeText]}>MBTI</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={
            searchType === 'id' ? "아이디 또는 이름으로 검색하기" : 
            "MBTI로 검색하기 (예: ENFP)"
          }
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoCapitalize={searchType === 'mbti' ? "characters" : "none"}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Ionicons name="search" size={24} color="#5271ff" />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={searchResults}
        renderItem={({ item }) => (
          <View style={styles.userItem}>
            <TouchableOpacity 
              style={styles.profileSection}
              onPress={() => handleProfilePress(item)}
            >
              <Image 
                source={item.profileImg 
                  ? { uri: item.profileImg } 
                  : require('../../assets/logo/mybot-log-color.png')
                }
                style={styles.profileImage} 
              />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>
                  {item.profile?.userName || '이름 없음'}
                </Text>
                <Text style={styles.userId}>@{item.userId}</Text>
                {item.profile?.mbti && (
                  <Text style={styles.mbti}>{item.profile.mbti}</Text>
                )}
              </View>
            </TouchableOpacity>
            
            {!item.isFriend && (
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => handleAddFriend(item.id)}
              >
                <Ionicons name="person-add-outline" size={24} color="#5271ff" />
              </TouchableOpacity>
            )}
            {item.isFriend && (
              <View style={styles.friendBadge}>
                <Text style={styles.friendBadgeText}>친구</Text>
              </View>
            )}
          </View>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery ? '검색 결과가 없습니다.' : 
                `${searchType === 'id' ? '아이디 또는 이름' : 'MBTI'}로 검색해보세요!`}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  searchTypeContainer: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  typeButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    marginHorizontal: 8,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
  },
  activeType: {
    backgroundColor: '#5271ff',
  },
  typeText: {
    color: '#6C757D',
    fontWeight: '600',
  },
  activeTypeText: {
    color: 'white',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  searchButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  profileSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  userId: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 4,
  },
  mbti: {
    fontSize: 14,
    color: '#5271ff',
  },
  addButton: {
    padding: 8,
  },
  friendBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E9ECEF',
    borderRadius: 12,
  },
  friendBadgeText: {
    fontSize: 12,
    color: '#6C757D',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
  },
});

export default FriendSearch;