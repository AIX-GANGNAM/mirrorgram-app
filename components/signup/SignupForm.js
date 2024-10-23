import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Text, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import app from '../../firebaseConfig'; // Firebase 앱 인스턴스 import
import * as Yup from 'yup';
import { createUserProfile } from '../../firebaseConfig';

// 토큰 발급
async function registerForPushNotificationsAsync() {
  console.log("registerForPushNotificationsAsync 함수 실행");
  let token;
  
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        console.log("프로젝트ID : ", projectId);
      if (!projectId) {
        throw new Error('Project ID not found');
      }
      console.log("토큰 값 출력 시작");
      // token = (await Notifications.getDevicePushTokenAsync()).data;
      token = (await Notifications.getExpoPushTokenAsync({projectId,})).data;
      console.log("토큰 값 : ", token);
    } catch (e) {
      token = `${e}`;
    }


  return token;
}

const SignupSchema = Yup.object().shape({
  email: Yup.string().email('올바른 이메일 형식을 입력해주세요').required('이메일을 입력해주세요'),
  password: Yup.string().min(8, '비밀번호는 8자리 이상이어야 합니다').required('비밀번호를 입력해주세요'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], '비밀번호가 일치하지 않습니다')
    .required('비밀번호 확인을 입력해주세요'),
});

const SignupForm = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    validateForm();
  }, [email, password, confirmPassword]);

  const validateForm = async () => {
    try {
      if (email === '' && password === '' && confirmPassword === '') {
        setErrors({});
        setIsFormValid(false);
        return;
      }
      await SignupSchema.validate({ email, password, confirmPassword }, { abortEarly: false });
      setErrors({});
      setIsFormValid(true);
    } catch (error) {
      const newErrors = {};
      error.inner.forEach((err) => {
        if (err.path === 'email' && email !== '') {
          newErrors[err.path] = err.message;
        }
        if (err.path === 'password' && password !== '') {
          newErrors[err.path] = err.message;
        }
        if (err.path === 'confirmPassword' && confirmPassword !== '') {
          newErrors[err.path] = err.message;
        }
      });
      setErrors(newErrors);
      setIsFormValid(false);
    }
  };

  const handleSignup = async () => {
    try {
      const auth = getAuth(app);
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      const pushToken = await registerForPushNotificationsAsync();
      await createUserProfile(user, { displayName: email.split('@')[0], pushToken: pushToken }); // 회원가입 완료 후 프로필 생성
      console.log("푸시 알림 토큰 : ", pushToken);
      alert('회원가입이 완료되었습니다.');
      // 여기서 UserVerificationStep1으로 네비게이션을 변경합니다.
      navigation.navigate('UserVerificationStep0');
    } catch (error) {
      console.error(error);
      let errorMessage = '회원가입 중 오류가 발생했습니다.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = '이미 사용 중인 이메일 주소입니다.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = '유효하지 않은 이메일 주소입니다.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = '비밀번호가 너무 약합니다.';
      }
      alert(errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/logo/mybot-log-color.png')}
        style={styles.logo}
      />
      <Text style={styles.subtitle}>친구들의 사진과 동영상을 보려면 가입하세요.</Text>
      <TextInput
        style={styles.input}
        placeholder="이메일 주소"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      {email !== '' && errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      <TextInput
        style={styles.input}
        placeholder="비밀번호"
        placeholderTextColor="#999"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {password !== '' && errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
      <TextInput
        style={styles.input}
        placeholder="비밀번호 확인"
        placeholderTextColor="#999"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      {confirmPassword !== '' && errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
      <TouchableOpacity 
        style={[styles.signupButton, !isFormValid && styles.disabledButton]} 
        onPress={handleSignup}
        disabled={!isFormValid}
      >
        <Text style={styles.signupButtonText}>가입</Text>
      </TouchableOpacity>
      <Text style={styles.termsText}>
        가입하면 Mirrorgram의 약관, 데이터 정책 및 쿠키 정책에 동의하게 됩니다.
      </Text>
      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>계정이 있으신가요?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLink}>로그인</Text>
        </TouchableOpacity>
      </View>
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
    width: 300,
    height: 300,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 17,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
  facebookButton: {
    backgroundColor: '#3797EF',
    width: '100%',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  facebookButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#dbdbdb',
  },
  orText: {
    marginHorizontal: 10,
    color: '#999',
    fontWeight: '600',
  },
  input: {
    width: '100%',
    height: 44,
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 5,
    paddingHorizontal: 15,
    marginBottom: 12,
    fontSize: 14,
  },
  signupButton: {
    backgroundColor: '#3797EF',
    width: '100%',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  signupButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  termsText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  loginContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  loginText: {
    color: '#999',
    fontSize: 14,
  },
  loginLink: {
    color: '#3797EF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 5,
  },
  disabledButton: {
    backgroundColor: '#B2DFFC',
  },
});

export default SignupForm;
