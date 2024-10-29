import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProgressBar from './ProgressBar';
import { extraCommonStyles } from './commonStyles';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '../../../store/slice/userSlice';

const UserInfoStep4 = ({ navigation, route }) => {
  const [region, setRegion] = useState('');
  const [loading, setLoading] = useState(false);
  const user = useSelector(state => state.user.user);
  const dispatch = useDispatch();

  const handleFinish = async () => {
    if (!region) return;

    setLoading(true);
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
      
      dispatch(setUser({
        ...user,
        profile: profileData
      }));
      
      navigation.navigate('Home');
    } catch (error) {
      console.error('프로필 정보 저장 중 오류 발생:', error);
      alert('프로필 정보 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={extraCommonStyles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={extraCommonStyles.innerContainer}>
          <ProgressBar step={4} totalSteps={4} />
          
          <Text style={extraCommonStyles.title}>지역을 입력해주세요</Text>
          <Text style={extraCommonStyles.subtitle}>
            주변 지역의 사람들과 더 쉽게 연결될 수 있어요
          </Text>

          <View style={styles.inputContainer}>
            <Ionicons name="location-outline" size={20} color="#657786" />
            <TextInput
              style={styles.input}
              placeholder="예: 서울시 강남구"
              placeholderTextColor="#657786"
              value={region}
              onChangeText={setRegion}
            />
          </View>

          <View style={styles.noticeContainer}>
            <Ionicons name="information-circle-outline" size={20} color="#657786" />
            <Text style={styles.noticeText}>
              입력하신 지역 정보는 위치 기반 추천에만 사용되며,
              정확한 주소는 공개되지 않습니다.
            </Text>
          </View>

          <TouchableOpacity 
            style={[
              extraCommonStyles.button,
              !region && extraCommonStyles.disabledButton,
              styles.finishButton
            ]}
            onPress={handleFinish}
            disabled={!region || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={extraCommonStyles.buttonText}>프로필 설정 완료</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F8FA',
    borderWidth: 1,
    borderColor: '#E1E8ED',
    borderRadius: 25,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    height: 50,
    marginTop: 20,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#14171A',
  },
  noticeContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F8FA',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 20,
    marginTop: 20,
    alignItems: 'flex-start',
  },
  noticeText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#657786',
    lineHeight: 20,
  },
  finishButton: {
    marginTop: 'auto',
    marginBottom: 20,
  },
});

export default UserInfoStep4;
