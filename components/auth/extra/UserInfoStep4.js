import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ProgressBar from './ProgressBar.js';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig'; // Firebase 설정 파일의 경로를 적절히 수정해주세요
import { useSelector, useDispatch } from 'react-redux'; // Redux 사용을 가정합니다. 상태 관리 방식에 따라 수정이 필요할 수 있습니다.
import { setUser } from '../../../store/slice/userSlice'; // userSlice에서 setUser action을 import

const UserInfoStep4 = ({ navigation, route }) => {
  const [region, setRegion] = useState('');
  const user = useSelector(state => state.user.user); // Redux에서 사용자 정보를 가져옵니다. 상태 관리 방식에 따라 수정이 필요할 수 있습니다.
  const dispatch = useDispatch();

  const handleFinish = async () => {
    if (region) {
      try {
        const userRef = doc(db, 'users', user.uid);
        const profileData = {
          education: route.params.education,
          gender: route.params.gender,
          mbti: route.params.mbti,
          region: region
        };
        
        await updateDoc(userRef, {
          profile: profileData
        });
        
        // Redux 상태 업데이트
        dispatch(setUser({
          ...user,
          profile: profileData
        }));
        
        console.log('프로필 정보가 성공적으로 저장되었습니다.');
        navigation.navigate('Home');
      } catch (error) {
        console.error('프로필 정보 저장 중 오류 발생:', error);
        alert('프로필 정보 저장에 실패했습니다. 다시 시도해주세요.');
      }
    } else {
      alert('지역명을 입력해주세요.');
    }
  };

  return (
    <LinearGradient colors={['#FF9A8B', '#FF6A88', '#FF99AC']} style={styles.container}>
      <ProgressBar step={4} totalSteps={4} />
      <Text style={styles.title}>당신이 사는 지역은 어디인가요?</Text>
      <Text style={styles.subtitle}>지역명은 위치 기반 추천에 사용됩니다.</Text>
      <TextInput
        style={styles.input}
        placeholder="예: 서울시 강남구, 부산시 해운대구"
        value={region}
        onChangeText={setRegion}
      />
      <TouchableOpacity 
        style={[styles.button, !region && styles.disabledButton]} 
        onPress={handleFinish}
        disabled={!region}
      >
        <Text style={styles.buttonText}>완료</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    color: '#fff',
    opacity: 0.8,
  },
  input: {
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 30,
    fontSize: 18,
    color: '#333',
  },
  button: {
    backgroundColor: '#3897f0',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
  },
  disabledButton: {
    backgroundColor: 'rgba(56, 151, 240, 0.5)',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default UserInfoStep4;
