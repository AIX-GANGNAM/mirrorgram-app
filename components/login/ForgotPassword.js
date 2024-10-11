import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Text, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import app from '../../firebaseConfig';

const ForgotPassword = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const auth = getAuth(app);

  const handleResetPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      alert('비밀번호 재설정 이메일을 보냈습니다. 이메일을 확인해주세요.');
      navigation.navigate('Login');
    } catch (error) {
      console.error(error);
      alert('비밀번호 재설정 이메일 전송에 실패했습니다. 이메일 주소를 확인해주세요.');
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/logo/Instagram-logo.png')}
        style={styles.logo}
      />
      <Text style={styles.title}>비밀번호 찾기</Text>
      <Text style={styles.description}>
        가입할 때 사용한 이메일 주소를 입력하면 비밀번호 재설정 링크를 보내드립니다.
      </Text>
      <TextInput
        style={styles.input}
        placeholder="이메일 주소"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleResetPassword}
      >
        <Text style={styles.buttonText}>비밀번호 재설정 링크 보내기</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>로그인으로 돌아가기</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 40,
  },
  logo: {
    width: 200,
    height: 70,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#262626',
  },
  description: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 44,
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 5,
    paddingHorizontal: 15,
    marginBottom: 10,
    fontSize: 14,
  },
  button: {
    width: '100%',
    height: 44,
    backgroundColor: '#3797EF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  backButton: {
    marginTop: 20,
  },
  backButtonText: {
    color: '#3797EF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ForgotPassword;