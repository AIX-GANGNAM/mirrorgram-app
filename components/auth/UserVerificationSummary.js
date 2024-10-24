import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import app from '../../firebaseConfig';
import { useDispatch } from 'react-redux';
import { setUser } from '../../store/slice/userSlice.js';
import { commonStyles } from './commonStyles';
import { useSelector } from 'react-redux';

const UserVerificationSummary = ({ setIsAuthenticated }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const { username, name, birthdate, phone } = route.params;
  const auth = getAuth(app);
  const db = getFirestore(app);
  const dispatch = useDispatch();

  const handleSaveProfile = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const profileData = {
          userPhone: phone,
          userId: username,
          profile: {
            userName: name,
            birthdate: birthdate,
          }
        };
        await setDoc(userRef, profileData, { merge: true });

        dispatch(setUser(prevUser => ({
          ...prevUser,  // 기존 userData 유지
          uid: user.uid,  // uid 추가 또는 업데이트
          ...profileData  // profileData 추가 또는 업데이트
        })));
        setIsAuthenticated(true); // 여기서 인증 상태를 true로 설정
        navigation.navigate('BottomTab', { screen: 'Home' }); // 이 줄은 제거 또는 주석 처리
      }
    } catch (error) {
      console.error('프로필 저장 중 오류 발생:', error);
      alert('프로필 저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>정보 확인</Text>
      <Text style={styles.infoText}>사용자 ID: @{username}</Text>
      <Text style={styles.infoText}>이름: {name}</Text>
      <Text style={styles.infoText}>생년월일: {new Date(birthdate).toLocaleDateString('ko-KR')}</Text>
      <Text style={styles.infoText}>전화번호: {phone || '(입력하지 않음)'}</Text>
      <TouchableOpacity style={styles.button} onPress={handleSaveProfile}>
        <Text style={styles.buttonText}>프로필 저장</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  ...commonStyles,
  summaryContainer: {
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 5,
    padding: 15,
    marginBottom: 20,
  },
});

export default UserVerificationSummary;
