import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Text, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import app from '../../firebaseConfig';
import * as Yup from 'yup';
import * as ImagePicker from 'expo-image-picker';

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
  const [selectedImage, setSelectedImage] = useState(null); // 이미지 상태 추가

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
      alert('회원가입이 완료되었습니다.');
      navigation.navigate('UserVerification');
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

  // 이미지 선택 핸들러
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],  // 정사각형 비율로 자르기
      quality: 1,
    });

    if (!result.cancelled) {
      setSelectedImage(result.uri);  // 선택된 이미지 설정
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/logo/Instagram-logo.png')}
        style={styles.logo}
      />
      <Text style={styles.subtitle}>친구들의 사진과 동영상을 보려면 가입하세요.</Text>

      {/* 이미지 업로드 영역 */}
      <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.image} />
        ) : (
          <Text style={styles.imagePlaceholder}>image</Text>
        )}
      </TouchableOpacity>

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
    width: 200,
    height: 70,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 17,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: '#dbdbdb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  imagePlaceholder: {
    color: '#999',
    fontSize: 18,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
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
