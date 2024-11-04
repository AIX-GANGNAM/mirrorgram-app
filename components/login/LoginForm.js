import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Text, TouchableOpacity, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import app from '../../firebaseConfig';
import * as Yup from 'yup';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { useDispatch } from 'react-redux';
import { setUser } from '../../store/slice/userSlice.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UpdatePushToken from '../notification/UpdatePushToken';
import NowPushToken from '../notification/NowPushToken';

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
  const [rememberMe, setRememberMe] = useState(false);
  const [isAutoLogin, setIsAutoLogin] = useState(false);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const dispatch = useDispatch();

  const [googleRequest, googleResponse, googlePromptAsync] = Google.useIdTokenAuthRequest({
    clientId: '979781266861-eo6hbft87fqbt615k0a0aj94c287d7dc.apps.googleusercontent.com',
    redirectUri: 'https://auth.expo.io/@realyoon77/mirrorgram',
  });

  useEffect(() => {
    checkAutoLogin();
    loadSavedCredentials();
  }, []);

  const checkAutoLogin = async () => {
    try {
      const authToken = await AsyncStorage.getItem('authToken');
      const userDataString = await AsyncStorage.getItem('userData');
      const isAutoLoginEnabled = await AsyncStorage.getItem('isAutoLogin');
      
      if (isAutoLoginEnabled === 'true' && authToken && userDataString) {
        const userData = JSON.parse(userDataString);
        
        // Firebase 토큰 유효성 검증
        const auth = getAuth(app);
        const currentUser = auth.currentUser;
        
        if (currentUser) {
          dispatch(setUser(userData));
          setIsAuthenticated(true);
          navigation.navigate('BottomTab', { screen: 'Home' });
        } else {
          await AsyncStorage.multiRemove([
            'authToken',
            'userData',
            'isAutoLogin'
          ]);
        }
      }
    } catch (error) {
      console.error('자동 로그인 확인 중 오류 발생:', error);
      await AsyncStorage.multiRemove([
        'authToken',
        'userData',
        'isAutoLogin'
      ]);
    }
  };

  const loadSavedCredentials = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem('savedEmail');
      const savedPassword = await AsyncStorage.getItem('savedPassword');
      const savedRememberMe = await AsyncStorage.getItem('rememberMe');
      const isAutoLoginEnabled = await AsyncStorage.getItem('isAutoLogin');
      
      // 로그인 정보 기억하기가 활성화되어 있으면 이메일과 비밀번호 모두 불러오기
      if (savedRememberMe === 'true' && savedEmail && savedPassword) {
        setEmail(savedEmail);
        setPassword(savedPassword);
        setRememberMe(true);
      }

      if (isAutoLoginEnabled === 'true') {
        setIsAutoLogin(true);
      } else {
        await AsyncStorage.multiRemove([
          'authToken',
          'userData',
          'isAutoLogin'
        ]);
      }
    } catch (error) {
      console.error('저장된 로그인 정보를 불러오는데 실패했습니다:', error);
    }
  };

  const saveAuthData = async (user, userData) => {
    try {
      const token = await user.getIdToken();
      
      // 로그인 정보 기억하기 처리
      if (rememberMe) {
        await AsyncStorage.multiSet([
          ['savedEmail', email],
          ['savedPassword', password],
          ['rememberMe', 'true']
        ]);
      } else {
        await AsyncStorage.multiRemove([
          'savedEmail',
          'savedPassword',
          'rememberMe'
        ]);
      }

      // 자동 로그인 처리
      if (isAutoLogin) {
        await AsyncStorage.multiSet([
          ['authToken', token],
          ['userData', JSON.stringify(userData)],
          ['isAutoLogin', 'true']
        ]);
      } else {
        await AsyncStorage.multiRemove([
          'authToken',
          'userData',
          'isAutoLogin'
        ]);
      }
    } catch (error) {
      console.error('인증 데이터 저장 중 오류 발생:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      
      // 로그인 정보 기억하기를 제외한 나머지 데이터만 삭제
      if (!rememberMe) {
        await AsyncStorage.multiRemove([
          'savedEmail',
          'savedPassword',
          'rememberMe'
        ]);
      }
      
      // 자동 로그인 관련 데이터는 항상 삭제
      await AsyncStorage.multiRemove([
        'authToken',
        'userData',
        'isAutoLogin'
      ]);
      
      dispatch(setUser(null));
      setIsAuthenticated(false);
      
      if (!rememberMe) {
        setEmail('');
        setPassword('');
      }
      setIsAutoLogin(false);
      
      navigation.navigate('Login');
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
    }
  };

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
        const userDataWithId = { uid: user.uid, ...userData };
        
        await saveAuthData(user, userDataWithId);
        dispatch(setUser(userDataWithId));
        setIsAuthenticated(true);
        UpdatePushToken(user.uid);
        NowPushToken();
        navigation.navigate('BottomTab', { screen: 'Home' });
      } else {
        navigation.navigate('UserVerificationStep0');
      }
    } catch (error) {
      console.error('로그인 오류:', error);
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
  
        const userRef = doc(db, 'users', user.uid);
        const userSnapshot = await getDoc(userRef);
  
        if (!userSnapshot.exists()) {
          await setDoc(userRef, {
            email: user.email,
            createdAt: new Date().toISOString(),
          });
        }
  
        dispatch(setUser({ uid: user.uid, email: user.email }));
        setIsAuthenticated(true);
        navigation.navigate('Home');
      }
    } catch (error) {
      console.error('Google 로그인 오류:', error);
      alert('Google 로그인에 실패했습니다.');
    }
  };

  const handleGithubSignIn = () => {
    alert('기능 개발 예정입니다 ㅠㅠ');
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Image
          source={require('../../assets/logo/mybot-log-color.png')}
          style={styles.logo}
        />
        <Text style={styles.welcomeText}>AI와 함께하는 소셜 네트워크</Text>
        <Text style={styles.subText}>지금 일어나고 있는 일을 AI와 함께 공유하세요</Text>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="이메일"
          placeholderTextColor="#657786"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {email !== '' && errors.email && 
          <Text style={styles.errorText}>{errors.email}</Text>
        }
        
        <TextInput
          style={styles.input}
          placeholder="비밀번호"
          placeholderTextColor="#657786"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
        />
        {password !== '' && errors.password && 
          <Text style={styles.errorText}>{errors.password}</Text>
        }

        <View style={styles.checkboxesContainer}>
          <TouchableOpacity 
            style={styles.checkboxWrapper}
            onPress={() => setRememberMe(!rememberMe)}
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
              {rememberMe && <FontAwesome name="check" size={12} color="#fff" />}
            </View>
            <Text style={styles.checkboxText}>로그인 정보 기억하기</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.checkboxWrapper}
            onPress={() => setIsAutoLogin(!isAutoLogin)}
          >
            <View style={[styles.checkbox, isAutoLogin && styles.checkboxChecked]}>
              {isAutoLogin && <FontAwesome name="check" size={12} color="#fff" />}
            </View>
            <Text style={styles.checkboxText}>자동 로그인</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleLogin}
          style={[styles.button, !isFormValid && styles.disabledButton]}
          disabled={!isFormValid}
        >
          <Text style={styles.buttonText}>로그인</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>또는</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity 
          style={styles.socialLoginButton} 
          onPress={handleGoogleSignIn}
        >
          <FontAwesome name="google" size={20} color="#000" />
          <Text style={styles.socialLoginText}>Google로 계속하기</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.socialLoginButton} 
          onPress={handleGithubSignIn}
        >
          <FontAwesome name="github" size={20} color="#000" />
          <Text style={styles.socialLoginText}>Github로 계속하기</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomContainer}>
        <Text style={styles.bottomText}>계정이 없으신가요?</Text>
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
    backgroundColor: '#fff',
    paddingHorizontal: 30,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#14171A',
    marginTop: 20,
    textAlign: 'center',
  },
  subText: {
    fontSize: 16,
    color: '#657786',
    marginTop: 10,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#F5F8FA',
    borderWidth: 1,
    borderColor: '#E1E8ED',
    borderRadius: 25,
    paddingHorizontal: 20,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#5271ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E1E8ED',
  },
  dividerText: {
    paddingHorizontal: 15,
    color: '#657786',
  },
  socialLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E1E8ED',
    borderRadius: 25,
    marginBottom: 15,
  },
  socialLoginText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#14171A',
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  bottomText: {
    color: '#657786',
    fontSize: 14,
  },
  signupLink: {
    color: '#5271ff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  errorText: {
    color: '#E0245E',
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
    marginLeft: 15,
  },
  disabledButton: {
    backgroundColor: '#AAB8C2',
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 15,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#657786',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#5271ff',
    borderColor: '#5271ff',
  },
  rememberText: {
    fontSize: 14,
    color: '#657786',
  },
});

export default LoginForm;