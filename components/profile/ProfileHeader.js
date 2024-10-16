import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth, signOut } from 'firebase/auth'; // Firebase 인증
import { useNavigation } from '@react-navigation/native'; // 네비게이션 훅 추가

const ProfileHeader = ({ username, setIsAuthenticated, user }) => { // setIsAuthenticated 추가
  const navigation = useNavigation(); // 네비게이션 훅 가져오기
  const auth = getAuth();
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        Alert.alert('로그아웃 성공', '로그인 화면으로 이동합니다.');
        setIsAuthenticated(false); // 인증 상태 변경
        navigation.navigate('Login'); // 로그인 화면으로 이동
      })
      .catch((error) => {
        console.error('로그아웃 에러:', error);
      });
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile', {
      name: user?.profile?.userName,
      userId: user?.userId,
      profileImg: user?.profileImg,
      birthdate: user?.profile?.birthdate,
      phone: user?.userPhone,
      mbti: user?.profile?.mbti,
      personality: user?.profile?.personality,
    });
    setDropdownVisible(false); // Close the dropdown menu
  };

  const handleHamburgerPress = () => {
    setDropdownVisible(!dropdownVisible);
  };

  return (
    <View style={styles.headerContainer}>
      <Text style={styles.username}>{username}</Text>
      <TouchableOpacity onPress={handleHamburgerPress}>
        <Ionicons name="menu" size={24} color="black" />
      </TouchableOpacity>
      {dropdownVisible && (
        <View style={styles.dropdownMenu}>
          <TouchableOpacity onPress={handleEditProfile}>
            <Text style={styles.dropdownItem}>프로필 편집</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.dropdownItem}>로그아웃</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'white',
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 40,
    right: 10,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 1,
  },
  dropdownItem: {
    padding: 10,
    fontSize: 16,
  },
});

export default ProfileHeader;
