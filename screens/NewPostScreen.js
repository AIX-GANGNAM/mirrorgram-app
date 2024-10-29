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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelText}>취소</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>새 게시물</Text>
        <TouchableOpacity 
          style={[styles.headerButton, !image && styles.disabledButton]} 
          onPress={handlePost}
          disabled={!image}
        >
          <Text style={[styles.postText, !image && styles.disabledText]}>게시</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {image ? (
          <View style={styles.postContainer}>
            <View style={styles.userInfo}>
              <View style={styles.userAvatar}>
                <Text style={styles.avatarText}>{user.userId?.[0]?.toUpperCase()}</Text>
              </View>
              <Text style={styles.userName}>{user.userId}</Text>
            </View>
            
            <TextInput
              style={styles.captionInput}
              placeholder="무슨 일이 일어나고 있나요?"
              placeholderTextColor="#657786"
              value={caption}
              onChangeText={setCaption}
              multiline
              maxLength={280}
            />
            
            <Image source={{ uri: image }} style={styles.selectedImage} />
            
            <TouchableOpacity style={styles.changeImageButton} onPress={pickImage}>
              <Ionicons name="images-outline" size={24} color="#5271ff" />
              <Text style={styles.changeImageText}>이미지 변경</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.optionsContainer}>
            <TouchableOpacity style={styles.mediaOption} onPress={takePicture}>
              <Ionicons name="camera-outline" size={24} color="#5271ff" />
              <Text style={styles.optionText}>사진 찍기</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.mediaOption} onPress={pickImage}>
              <Ionicons name="images-outline" size={24} color="#5271ff" />
              <Text style={styles.optionText}>갤러리에서 선택</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.personaOption} onPress={handlePersonaFeed}>
              <Ionicons name="sparkles-outline" size={24} color="#ff7043" />
              <Text style={styles.personaOptionText}>페르소나 피드 자동생성</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {isLoading && (
        <View style={styles.overlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#5271ff" size="large" />
            <Text style={styles.loadingText}>업로드 중... {uploadProgress.toFixed(0)}%</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progress, { width: `${uploadProgress}%` }]} />
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
  },
  headerButton: {
    padding: 8,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#14171A',
  },
  cancelText: {
    fontSize: 16,
    color: '#657786',
  },
  postText: {
    fontSize: 16,
    color: '#5271ff',
    fontWeight: '600',
  },
  disabledText: {
    color: '#AAB8C2',
  },
  content: {
    flex: 1,
  },
  postContainer: {
    padding: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#5271ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  userName: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#14171A',
  },
  captionInput: {
    fontSize: 16,
    color: '#14171A',
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  selectedImage: {
    width: '100%',
    height: 300,
    borderRadius: 15,
    marginBottom: 16,
  },
  changeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#5271ff',
    borderRadius: 25,
    justifyContent: 'center',
  },
  changeImageText: {
    marginLeft: 8,
    color: '#5271ff',
    fontSize: 16,
    fontWeight: '500',
  },
  optionsContainer: {
    padding: 20,
  },
  mediaOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 25,
    marginBottom: 12,
  },
  optionText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#14171A',
    fontWeight: '500',
  },
  personaOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF3E0',
    borderRadius: 25,
    marginTop: 20,
  },
  personaOptionText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#ff7043',
    fontWeight: '500',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#14171A',
    marginTop: 12,
    marginBottom: 8,
  },
  progressBar: {
    width: 200,
    height: 4,
    backgroundColor: '#E1E8ED',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 8,
  },
  progress: {
    height: '100%',
    backgroundColor: '#5271ff',
  },
});

export default NewPostScreen;
