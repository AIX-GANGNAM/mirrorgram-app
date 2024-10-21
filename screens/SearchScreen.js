
import React, { useState } from 'react';
import { StyleSheet, SafeAreaView, View, ScrollView, Text, TextInput, TouchableOpacity, Platform, Dimensions, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import SearchContent from '../components/search/SearchContent'; // 기존의 SearchContent 적용

const { height, width } = Dimensions.get('window');

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState(''); // 검색 쿼리 상태 추가
  const [searchResults, setSearchResults] = useState([]); // 검색 결과 상태 추가
  const [image, setImage] = useState(null); // 이미지 상태 추가
  const navigation = useNavigation(); // 네비게이션 훅 추가

  const handleSearch = async () => {
    try {
      if (searchQuery.trim() !== '') {
        const usersCollectionRef = collection(db, "users");
        const q = query(
          usersCollectionRef, 
          where("userId", "==", searchQuery)  // 정확하게 일치하는 userId 검색
        );

        const querySnapshot = await getDocs(q);
        const results = [];
        querySnapshot.forEach((doc) => {
          results.push({ ...doc.data(), id: doc.id });
        });
        setSearchResults(results); // 검색 결과 상태 업데이트
      }
    } catch (error) {
      console.error('Firebase 쿼리 에러:', error);
    }
  };

  // 사용자 클릭 시 프로필 화면으로 이동
  const handleUserClick = (user) => {
    navigation.navigate('FriendProfileScreen', { userId: user.userId }); // 'FriendProfileScreen'으로 이동
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ marginHorizontal: 6 }}>
        <TextInput
          style={styles.searchBox}
          placeholder="Search by ID"
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
          onSubmitEditing={handleSearch}
        />

        <ScrollView style={{ marginBottom: 70 }} showsVerticalScrollIndicator={false}>
          {searchResults.length > 0 ? (
            searchResults.map((user) => (
              <TouchableOpacity key={user.id} onPress={() => handleUserClick(user)}>
                <View style={styles.userItem}>
                  {/* 프로필 이미지가 있는 경우 표시, 없는 경우 기본 아이콘 표시 */}
                  {user.profileImage ? (
                    <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
                  ) : (
                    <Ionicons name="person-circle-outline" size={40} color="gray" />
                  )}
                  <View style={styles.userInfo}>
                    <Text style={styles.userText}>ID: {user.userId}</Text>
                    <Text style={styles.userText}>Name: {user.profile.userName}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <SearchContent data={setImage} /> // 기존 SearchContent 활용
          )}
        </ScrollView>

        {image && (
          <View style={styles.imageOverlay}>
            <Image source={{ uri: image }} style={styles.fullImage} />
            <TouchableOpacity style={styles.closeButton} onPress={() => setImage(null)}>
              <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={{ marginTop: 10, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="add-circle-outline" size={50} color="gray" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 0 : 30,
    padding: 12,
    backgroundColor: '#000',
  },
  searchBox: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: 'white',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userInfo: {
    flexDirection: 'column',
  },
  userText: {
    color: '#fff',
  },
  imageOverlay: {
    position: 'absolute',
    zIndex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(52,52,52,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: width / 1.23,
    height: 465,
    borderRadius: 15,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
});

export default SearchScreen;
