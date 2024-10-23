import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Text, TouchableOpacity, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import app from '../../firebaseConfig';
import * as Yup from 'yup';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useDispatch } from 'react-redux';
import { setUser } from '../../store/slice/userSlice.js';

WebBrowser.maybeCompleteAuthSession();

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('올바른 이메일 형식이 아닙니다').required('이메일을 입력해주세요'),
  password: Yup.string().min(8, '비밀번호는 8자리 이상이어야 합니다').required('비밀번호를 입력해주세요'),
});

const LoginForm = ({ isAuthenticated, setIsAuthenticated }) => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const auth = getAuth(app);
  const db = getFirestore(app);

  const dispatch = useDispatch();

  const [googleRequest, googleResponse, googlePromptAsync] = Google.useIdTokenAuthRequest({
    clientId: '979781266861-eo6hbft87fqbt615k0a0aj94c287d7dc.apps.googleusercontent.com',
    redirectUri: 'https://auth.expo.io/@realyoon77/mirrorgram',
  }); 

  useEffect(() => {
    validateForm();
  }, [email, password]);

  const validateForm = async () => {
    try {
      if (email === '' && password === '') {
        setErrors({});
        setIsFormValid(false);
        return;
      }
      await LoginSchema.validate({ email, password }, { abortEarly: false });
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
      });
      setErrors(newErrors);
      setIsFormValid(false);
    }
  };

  const handleLogin = async () => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      const userRef = doc(db, 'users', user.uid);
      const userSnapshot = await getDoc(userRef);
      
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        console.log(userData);
        dispatch(setUser({ uid: user.uid, ...userData }));
        setIsAuthenticated(true);
        navigation.navigate('BottomTab', { screen: 'Home' });
      } else {
        navigation.navigate('UserVerificationStep1');
      }
    } catch (error) {
      console.error(error);
      alert('로그인에 실패했습니다. 이메일과 비밀번호를 확인해 주세요.');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await googlePromptAsync();
      if (result.type === 'success') {
        const { id_token } = result.params;
        const credential = GoogleAuthProvider.credential(id_token);
        const userCredential = await signInWithCredential(auth, credential);
        const user = userCredential.user;
  
        // Firestore에 사용자 데이터 추가 (가입 여부 확인 후)
        const userRef = doc(db, 'users', user.uid);
        const userSnapshot = await getDoc(userRef);
  
        if (!userSnapshot.exists()) {
          // 사용자 문서가 없으면 새로 생성 (즉, 회원가입)
          await setDoc(userRef, {
            email: user.email,
            createdAt: new Date().toISOString(),
            // 추가적인 사용자 정보가 필요하면 여기에 추가
          });
        }
  
        // 스토어에 사용자 정보 설정
        dispatch(setUser({ uid: user.uid, email: user.email }));
        setIsAuthenticated(true);
        navigation.navigate('Home');
      }
    } catch (error) {
      console.error('Google 로그인 오류:', error);
      alert('Google 로그인에 실패했습니다.');
    }
  };
  

  useEffect(() => {
    if (googleResponse?.type === 'success') {
      const { id_token } = googleResponse.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then(userCredential => {
          // 사용자 정보를 이용해 추가적인 로직 처리
          const user = userCredential.user;
          setIsAuthenticated(true);
          // 프로필 데이터 가져오기 및 스토어에 저장
          fetchUserProfile(user.uid);
          navigation.navigate('Home');
        })
        .catch(error => {
          console.error('Google 로그인 오류:', error);
          alert('Google 로그인에 실패했습니다.');
        });
    }
  }, [googleResponse]);
  
  const handleGithubSignIn = () => {
    alert('기능 개발 예정입니다 ㅠㅠ');
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/logo/mirrorgram-logo.png')}
        style={styles.logo}
      />
      <TextInput
        style={styles.input}
        placeholder="이메일을 입력해주세요"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      {email !== '' && errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      <TextInput
        style={styles.input}
        placeholder="비밀번호를 입력해주세요"
        placeholderTextColor="#999"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {password !== '' && errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
      <TouchableOpacity
        onPress={handleLogin}
        style={[styles.button, !isFormValid && styles.disabledButton]}
        disabled={!isFormValid}
      >
        <Text style={styles.buttonText}>로그인</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.forgotPassword} onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.forgotPasswordText}>비밀번호를 잊으셨나요?</Text>
      </TouchableOpacity>
      <View style={styles.orContainer}>
        <View style={styles.orLine} />
        <Text style={styles.orText}>또는</Text>
        <View style={styles.orLine} />
      </View>
      <View style={styles.socialLoginContainer}>
        <TouchableOpacity style={styles.socialButton} onPress={handleGoogleSignIn}>
          <FontAwesome name="google" size={20} color="#DB4437" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton} onPress={handleGithubSignIn}>
          <FontAwesome name="github" size={20} color="#333" />
        </TouchableOpacity>
      </View>
      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>계정이 없으신가요?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.signupLink}>가입하기</Text>
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
    height: 100,
    resizeMode: 'contain',
    marginBottom: 30,
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
    backgroundColor: '#5271ff',
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
  forgotPassword: {
    marginTop: 20,
  },
  forgotPasswordText: {
    color: '#3797EF',
    fontSize: 12,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#dbdbdb',
  },
  orText: {
    marginHorizontal: 10,
    color: '#999',
    fontSize: 12,
  },
  facebookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  facebookButtonText: {
    color: '#3b5998',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 10,
  },
  signupContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  signupText: {
    color: '#999',
    fontSize: 12,
  },
  signupLink: {
    color: '#3797EF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DB4437',
    borderRadius: 5,
    padding: 10,
  },
  googleButtonText: {
    color: '#DB4437',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 10,
  },
  socialLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  socialButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dbdbdb',
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

export default LoginForm;