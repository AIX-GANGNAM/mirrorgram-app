import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Image, Modal, TouchableWithoutFeedback, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import ProgressBar from './ProgressBar';
import { commonStyles } from './commonStyles';
import * as FileSystem from 'expo-file-system';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { setMessage } from '../../store/slice/userSlice';


const UserVerificationStep0 = () => {
  const dispatch = useDispatch();
  const [image, setImage] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const navigation = useNavigation();
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [gender, setGender] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const user = useSelector(state=>state.user.user);
  const takePicture = async () => {
    if (hasPermission) {
      const result = await ImagePicker.launchCameraAsync({
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
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const sendImageToServer = async (imageUri, gender) => {
    console.log(user)
    print('이미지 전송중')
    const uid = user.uid;
    console.log(uid)
    const ws = new WebSocket(`ws://221.148.97.237:1818/image-generate-default/${uid}`);

    ws.onopen = async () => {
      console.log('WebSocket 연결됨');
      
      if (imageUri) {
        // 이미지를 Base64로 인코딩
        const imageBase64 = await FileSystem.readAsStringAsync(imageUri, { encoding: FileSystem.EncodingType.Base64 });
        
        // 서버로 이미지 데이터 전송
        ws.send(JSON.stringify({ image: imageBase64 , gender : 'gender'}));
      } else {
        ws.send(JSON.stringify({image : null, gender : gender}));
      }
    };

    ws.onmessage = (event) => {
      const response = JSON.parse(event.data);
      if (response.status === 'success') {
        console.log('페르소나 이미지 생성 성공:', response.images);
        dispatch(setMessage(response.status));
        // 여기서 생성된 이미지를 처리하거나 표시할 수 있습니다
      } else {
        console.error('페르소나 이미지 생성 실패:', response.message);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket 오류:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket 연결 종료');
    };
  };

  const handleNext = () => {
    if (image) {
        console.log('dkdkdkdkdimage',image)
        sendImageToServer(image, gender);
        navigation.navigate('UserVerificationStep1');
    } else {
        setShowConfirmModal(true);
    }
  };

  const handleConfirm = (confirmed) => {
    setShowConfirmModal(false);
    if (confirmed) {
      setShowGenderModal(true);
    }
  };

  const handleSkipImage = () => {
    setShowGenderModal(true);
  };

  const handleSelectGender = (selectedGender) => {
    setGender(selectedGender);
    setShowGenderModal(false);
    // 여기에서 다음 단계로 네비게이션 처리
    sendImageToServer(image, selectedGender);
    navigation.navigate('UserVerificationStep1');
  };

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
  };

  const closeGenderModal = () => {
    setShowGenderModal(false);
  };

  const openImageModal = () => {
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      
      <View style={styles.contentContainer}>
        <ProgressBar step={1} totalSteps={5} />
        <Text style={styles.infoText}>
            프로필 사진을 선택해주세요.
        </Text>
        <TouchableOpacity onPress={openImageModal}>
          {image ? (
            <Image source={{ uri: image }} style={styles.profileImage} />
          ) : (
            <Image
              source={require('../../assets/no-profile.png')}
              style={styles.profileImage}
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>다음</Text>
        </TouchableOpacity>
      </View>

      {/* 이미지 선택 모달 */}
      <Modal
        visible={showImageModal}
        transparent={true}
        animationType="slide"
        onRequestClose={closeImageModal}
      >
        <TouchableWithoutFeedback onPress={closeImageModal}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>프로필 사진 선택</Text>
                <View style={styles.modalButtonContainer}>
                <TouchableOpacity style={styles.modalCircle} onPress={() => { takePicture(); closeImageModal(); }}>
                <Ionicons name="camera-outline" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalCircle} onPress={() => { pickImage(); closeImageModal(); }}>
                <Ionicons name="images-outline" size={24} color="white" />
                </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* 확인 모달 */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="slide"
        onRequestClose={closeConfirmModal}
      >
        <TouchableWithoutFeedback onPress={closeConfirmModal}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContentProfile}>
                <Text style={styles.modalTitle}>기본 프로필 이미지를 사용하시겠습니까?</Text>
                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity onPress={() => handleConfirm(true)} style={styles.modalButtonGo}>
                    <Text style={styles.modalButtonText}>네</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleConfirm(false)} style={styles.modalButtonGo}>
                    <Text style={styles.modalButtonText}>아니오</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* 성별 선택 모달 */}
      <Modal
        visible={showGenderModal}
        transparent={true}
        animationType="slide"
        onRequestClose={closeGenderModal}
      >
        <TouchableWithoutFeedback onPress={closeGenderModal}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>성별을 선택해주세요</Text>
                <TouchableOpacity onPress={() => handleSelectGender('male')} style={styles.modalButton}>
                  <Text style={styles.modalButtonText}>남성</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleSelectGender('female')} style={styles.modalButton}>
                  <Text style={styles.modalButtonText}>여성</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding : 20
  },

  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  profileImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 30,

  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
  },
  imageButton: {
    backgroundColor: '#3897f0',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#0095f6',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 16,
    color: '#262626',
    marginBottom: 10,
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalOption: {
    fontSize: 16,
    padding: 10,
    marginVertical: 5,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 50
  },
  modalCircle: {
    width: 50,
    height: 50,
    borderRadius: 50,
    backgroundColor: '#3897f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonGo: {
    backgroundColor: '#3897f0',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: '30%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  progressBarContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#3897f0',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContentProfile: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '90%',
  },
});

export default UserVerificationStep0;
