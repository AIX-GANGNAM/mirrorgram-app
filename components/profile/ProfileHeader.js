import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth, signOut } from 'firebase/auth'; // Firebase 인증
import { useNavigation } from '@react-navigation/native'; // 네비게이션 훅 추가

const ProfileHeader = ({ username, setIsAuthenticated }) => { // setIsAuthenticated 추가
  const navigation = useNavigation(); // 네비게이션 훅 가져오기
  const auth = getAuth();

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

  const handleHamburgerPress = () => {
    Alert.alert(
      '메뉴',
      '선택하세요:',
      [
        {
          text: '로그아웃',
          onPress: handleLogout,
          style: 'destructive',
        },
        {
          text: '취소',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.header}>
      <Text style={styles.username}>@ {username}</Text>
      <TouchableOpacity onPress={handleHamburgerPress}>
        <Ionicons name="menu-outline" size={24} color="#000" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#dbdbdb',
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileHeader;
