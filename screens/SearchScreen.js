import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, SafeAreaView, View, ScrollView, Text, StatusBar, Dimensions, Image, TextInput, Platform } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import SearchContent from '../components/search/SearchContent';
import SearchBox from '../components/search/SearchBox';
import { useNavigation } from '@react-navigation/native';
import { collection, query, where, getDocs, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Firebase 설정 파일에서 가져옴

const { height, width } = Dimensions.get('window');

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState(''); // 검색 쿼리 상태 추가
  const [searchResults, setSearchResults] = useState([]); // 검색 결과 상태 추가
  const navigation = useNavigation(); // 네비게이션 훅 추가
  const [image, setImage] = useState(null);

  const getData = data => {
    setImage(data);
  };

  const handleSearch = async () => {
    try {
      if (searchQuery.trim() !== '') {
        // 상위 'users' 컬렉션을 참조 (특정 UID 문서가 아닌 전체 컬렉션을 대상으로 검색)
        const usersCollectionRef = collection(db, "users");

        // 모든 users 컬렉션을 대상으로 검색
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

        // 검색 결과가 있는지 확인
        if (results.length > 0) {
          console.log("정보가 있습니다:", results);
        } else {
          console.log("정보가 없습니다.");
        }
      }
    } catch (error) {
      console.error('Firebase 쿼리 에러:', error); // 에러 처리 추가
    }
  };

  const handleUserClick = (user) => { // 사용자 클릭 처리 함수 추가
    navigation.navigate('FriendProfileScreen', { userId: user.id });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ marginHorizontal: 6 }}>
        <SearchBox />
        <TextInput
          style={styles.searchBox} // 검색 박스 스타일
          placeholder="Search by ID" // 플레이스홀더 텍스트
          value={searchQuery} // 검색 쿼리 상태
          onChangeText={(text) => setSearchQuery(text)} // 텍스트 변경 시 상태 업데이트
          onSubmitEditing={handleSearch} // 엔터를 누르면 검색 실행
        />
        <ScrollView style={{ marginBottom: 70 }} showsVerticalScrollIndicator={false}>
          <SearchContent data={getData} />
          <TouchableOpacity style={{ marginTop: 10, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="add-circle-outline" size={50} color="gray" />
          </TouchableOpacity>
        </ScrollView>

        {image ? (
          <View style={{
            position: 'absolute',
            zIndex: 1,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(52,52,52,0.8)'
          }}>
            <StatusBar backgroundColor='#525252' barStyle="dark-content" />
            <View style={{
              position: 'absolute',
              top: height / 6,
              left: width / 19.5,
              backgroundColor: 'white',
              width: width / 1.23,
              height: 465,
              borderRadius: 15,
              zIndex: 1,
              elevation: 50,
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 10,
                paddingHorizontal: 15,
              }}>
                <Image
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 100,
                  }}
                  source={{ uri: image }}
                />
                <View style={{
                  padding: 8,
                }}>
                  <Text style={{
                    fontSize: 12,
                    fontWeight: '600',
                  }}> The anonymous guy </Text>
                </View>
              </View>
              <Image source={{ uri: image }} style={{ width: '100%', height: '80%' }} />
              <View style={{
                justifyContent: 'space-around',
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                padding: 8,
              }}>
                <Ionicons name="ios-heart-outline" size={24} color="black" />
                <Ionicons name="ios-person-circle-outline" size={24} color="black" />
                <Feather name="navigation" size={24} color="black" />
              </View>
            </View>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

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
});

export default SearchScreen;
