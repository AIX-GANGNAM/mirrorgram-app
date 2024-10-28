import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getFirestore, addDoc, collection, setDoc, doc } from 'firebase/firestore';
import axios from 'axios'; // Axios import 추가

const NewPostScreen = ({ navigation }) => {
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const user = useSelector((state) => state.user.user);

  console.log('user', user);

  const takePicture = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status === 'granted') {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0,
        v = c == 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  const handlePost = async () => {
    if (!image) {
      alert('이미지를 선택해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(image);
      const blob = await response.blob();

      const uuid = generateUUID();
      const storage = getStorage();
      const storageRef = ref(storage, `${user.uid}/feeds/${uuid}`);

      const uploadTask = uploadBytesResumable(storageRef, blob);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
          console.log('Upload is ' + progress + '% done');
        },
        (error) => {
          console.error('Upload error:', error);
          setIsLoading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          const post = {
            id: uuid,
            image: downloadURL,
            caption: caption,
            likes: [],
            comments: [],
            createdAt: new Date().toISOString(),
            userId: user.uid,
            nick: user.userId,
            subCommentId: [],
          };

          const db = getFirestore();

          // Firestore에 데이터 추가 (올바른 방법)
          await setDoc(doc(db, 'feeds', uuid), post);

          // /feed 엔드포인트로 Axios 요청을 비동기적으로 실행
          axios
            .post('http://127.0.0.1:8000/feed', post)
            .then(() => console.log('API 요청 성공'))
            .catch((error) => console.error('API 요청 실패:', error));

          console.log('포스트 업로드 완료');
          setCaption('');
          setImage(null);
          setIsLoading(false);
          navigation.navigate('Home');
        }
      );
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
      alert('포스트 업로드에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handlePersonaFeed = async () => {
    try {
      // 사용자 ID를 받아서 전달할 준비 (예시로 personaId를 사용자 ID로 사용)
      const personaId = user.uid; // 페르소나 ID가 특정된 경우 해당 ID를 사용
      
      // FastAPI의 /generate_feed 엔드포인트로 POST 요청 보내기
      const response = await axios.post('http://127.0.0.1:8000/generate_feed', {
        persona_id: personaId, // 백엔드에 페르소나 ID를 전달
      });
      
      if (response.status === 200) {
        console.log('페르소나 피드 자동생성이 완료되었습니다.');
        alert('페르소나 피드 자동생성이 완료되었습니다.');
      } else {
        console.error('피드 생성 중 문제가 발생했습니다.');
        alert('피드 생성 중 문제가 발생했습니다.');
      }
    } catch (error) {
      console.error('피드 생성 중 오류 발생:', error);
      alert('피드 생성 중 오류가 발생했습니다. 다시 시도해 주세요.');
    }
  };

  const LoadingOverlay = () => (
    <View style={styles.overlay}>
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>업로드 중... {uploadProgress.toFixed(0)}%</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progress, { width: `${uploadProgress}%` }]} />
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close-outline" size={30} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerText}>새 게시물</Text>
          <TouchableOpacity onPress={handlePost}>
            <Text style={styles.shareText}>공유</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.imageContainer}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <View style={styles.placeholderContainer}>
              <TouchableOpacity style={styles.button} onPress={takePicture}>
                <Text style={styles.buttonText}>사진 찍기</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={pickImage}>
                <Text style={styles.buttonText}>갤러리에서 선택</Text>
              </TouchableOpacity>

              {/* 페르소나 피드 자동생성 버튼 추가 */}
              <TouchableOpacity style={styles.personaButton} onPress={handlePersonaFeed}>
                <Text style={styles.personaButtonText}>페르소나 피드 자동생성</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        <TextInput
          style={styles.input}
          placeholder="문구 입력..."
          value={caption}
          onChangeText={setCaption}
          multiline
        />
      </View>
      {isLoading && <LoadingOverlay />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 40 : 0,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#dbdbdb',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  shareText: {
    color: '#3897f0',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#5271ff',
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
    width: 200, // 모든 버튼의 너비를 일정하게 설정
    alignItems: 'center', // 텍스트를 중앙 정렬
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  personaButton: {
    backgroundColor: '#ff7043', // 페르소나 피드 자동생성 버튼의 색상
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
    width: 200, // 동일한 너비 설정
    alignItems: 'center', // 텍스트를 중앙 정렬
  },
  personaButtonText: {
    color: 'white',
    fontSize: 16,
  },
  input: {
    padding: 15,
    fontSize: 16,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    marginBottom: 10,
  },
  progressBar: {
    width: 200,
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
});

export default NewPostScreen;
