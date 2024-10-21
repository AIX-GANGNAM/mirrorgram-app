import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth, signOut } from 'firebase/auth'; 
import { useNavigation } from '@react-navigation/native'; 

const ProfileHeader = ({ username, setIsAuthenticated, user }) => { 
  const navigation = useNavigation(); 
  const auth = getAuth();
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        Alert.alert('로그아웃 성공', '로그인 화면으로 이동합니다.');
        setIsAuthenticated(false); 
        navigation.navigate('Login'); 
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
    setDropdownVisible(false); 
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
