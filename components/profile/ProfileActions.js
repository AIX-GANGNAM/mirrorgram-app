import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth, signOut } from 'firebase/auth'; // Firebase 인증 모듈 임포트

const ProfileActions = ({ user, setIsAuthenticated }) => {
  const navigation = useNavigation();
  const auth = getAuth();

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
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        Alert.alert('로그아웃 성공', '로그인 화면으로 이동합니다.');
        setIsAuthenticated(false); // 로그인 상태 업데이트
        navigation.navigate('Login'); // 로그인 화면으로 이동
      })
      .catch((error) => {
        console.error('로그아웃 에러:', error);
        Alert.alert('로그아웃 실패', '다시 시도해 주세요.');
      });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handleEditProfile}>
        <Text style={styles.buttonText}>프로필 편집</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
        <Text style={styles.buttonText}>로그아웃</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
  },
  button: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 5,
    paddingVertical: 7,
    alignItems: 'center',
    marginBottom: 10, // 버튼 간격을 위해 추가
  },
  logoutButton: {
    backgroundColor: '#ffcccc', // 로그아웃 버튼 색상
  },
  buttonText: {
    color: '#000',
    fontWeight: '600',
  },
});

export default ProfileActions;
