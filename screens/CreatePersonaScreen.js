import { useState, useRef ,useCallback } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, Animated, PanResponder, ScrollView, TextInput, SafeAreaView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {getFirestore, collection, doc, updateDoc} from 'firebase/firestore';
import Village from './Village';
import {useFocusEffect} from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/Ionicons';
import { Alert } from 'react-native';
import { getAuth } from 'firebase/auth';

// 이미지 생성 API 호출
const generatePersonaImages = async (formData) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('사용자 인증 정보가 없습니다.');
    }
    
    formData.append('uid', user.uid);
    
    const response = await axios.post(`http://221.148.97.237:1818/generate-persona-images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.images;
  } catch (error) {
    console.error('Error generating persona images:', error);
    Alert.alert("오류", "페르소나 이미지 생성 중 오류가 발생했습니다.");
    throw error;
  }
};

// 성격 생성 API 호출
const generatePersonaDetails = async (customPersona) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('사용자 인증 정보가 없습니다.');
    }

    const response = await axios.post(`http://localhost:8000/generate-personality`, {
      uid: user.uid,
      name: customPersona.name,
      personality: customPersona.personality,
      speechStyle: customPersona.speechStyle
    });
    return response.data.details;
  } catch (error) {
    console.error('Error generating persona details:', error);
    Alert.alert("오류", "페르소나 성격 생성 중 오류가 발생했습니다.");
    throw error;
  }
};

export default function ReelsScreen() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generatedPersonas, setGeneratedPersonas] = useState({
    joy: null,
    anger: null,
    sadness: null,
    custom: null,
    clone: null
  });
  const [personaDetails, setPersonaDetails] = useState({
    joy: { name: '기쁨이', personality: '', speechStyle: '' },
    anger: { name: '화남이', personality: '', speechStyle: '' },
    sadness: { name: '슬픔이', personality: '', speechStyle: '' },
    custom: { name: '', personality: '', speechStyle: '' },
    clone: { name: '나의 분신', personality: '', speechStyle: '' }
  });
  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [customPersona, setCustomPersona] = useState({
    name: '',
    personality: '',
    speechStyle: ''
  });
  const [selectedPersonaType, setSelectedPersonaType] = useState(null);
  const [selectModalVisible, setSelectModalVisible] = useState(false);
  const [personaCharacteristics] = useState({
    joy: {
      name: '기쁨이',
      personality: '밝고 긍정적인 성격으로, 에너지가 넘치고 열정적입니다.',
      speechStyle: '활기차고 밝은 말투, 이모티콘을 자주 사용해요! 😊',
    },
    anger: {
      name: '화남이',
      personality: '정의감이 강하고 자신의 의견을 분명히 표현하는 성격입니다.',
      speechStyle: '강렬하고 직설적인 말투, 감정을 숨기지 않고 표현합니다!',
    },
    sadness: {
      name: '슬픔이',
      personality: '깊은 감수성과 공감 능력을 가진 섬세한 성격입니다.',
      speechStyle: '부드럽고 조용한 말투로 진솔하게 대화해요..ㅠㅠ',
    }
  });

  const pickImage = async () => {
    // 권한 요청
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '갤러리 접근 권한이 필요합니다.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        // 이미지 선택 시 기존 페르소나 초기화
        setGeneratedPersonas({
          joy: null,
          anger: null,
          sadness: null,
          custom: null,
          clone: null
        });
        setPersonaDetails({
          joy: { name: '기쁨이', personality: '', speechStyle: '' },
          anger: { name: '화남이', personality: '', speechStyle: '' },
          sadness: { name: '슬픔이', personality: '', speechStyle: '' },
          custom: { name: '', personality: '', speechStyle: '' },
          clone: { name: '나의 분신', personality: '', speechStyle: '' }
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('오류', '이미지를 선택하는 중 오류가 발생했습니다.');
    }
  };

  // handleGeneratePersonas 함수 수정
  const handleGeneratePersonas = async (skipImage = false) => {
    if (!skipImage && !image) {
      Alert.alert("알림", "먼저 사진을 선택해주세요.");
      return;
    }

    setLoading(true);
    
    try {
      // 커스텀 페르소나 정보가 없는 경우 알림
      if (!personaDetails.custom.name) {
        Alert.alert("알림", "페르소나 정보를 입력해주세요.");
        return;
      }

      // 1. 이미지 생성 API 호출 (사진 선택을 건너뛰지 않은 경우에만)
      if (!skipImage) {
        const formData = new FormData();
        formData.append('image', {
          uri: image,
          type: 'image/jpeg',
          name: 'image.jpg'
        });
        
        formData.append('customPersona', JSON.stringify({
          name: personaDetails.custom.name,
          personality: personaDetails.custom.personality,
          speechStyle: personaDetails.custom.speechStyle
        }));

        const generatedImages = await generatePersonaImages(formData);
        setGeneratedPersonas(generatedImages);
      }

      // 2. 성격 생성 API 호출
      const generatedDetails = await generatePersonaDetails(personaDetails.custom);
      setPersonaDetails(prev => ({
        ...prev,
        ...generatedDetails
      }));

    } catch (error) {
      console.error('Error in handleGeneratePersonas:', error);
      Alert.alert("오류", "페르소나 생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const renderPersonaCard = (type) => {
    const persona = generatedPersonas[type];
    const details = personaDetails[type];
    
    return (
      <TouchableOpacity 
        style={styles.personaCard}
        onPress={() => handlePersonaCardPress(type)}
        disabled={type === 'clone'}
      >
        {persona ? (
          <>
            <Image source={{ uri: persona }} style={styles.personaImage} />
            <Text style={styles.personaName}>{details.name}</Text>
            {details.personality && (
              <Text style={styles.personaDetail} numberOfLines={1}>
                {details.personality}
              </Text>
            )}
          </>
        ) : type === 'custom' ? (
          <View style={styles.customPersonaPlaceholder}>
            <Icon name="add-circle-outline" size={40} color="#5271FF" />
            <Text style={styles.customText}>나만의 페르소나</Text>
          </View>
        ) : (
          <View style={styles.emptyPersona}>
            <Icon name="person-outline" size={40} color="#CCCCCC" />
            <Text style={styles.emptyPersonaText}>
              {type === 'joy' ? '기쁨이' :
               type === 'anger' ? '화남이' :
               type === 'sadness' ? '슬픔이' :
               type === 'clone' ? '나의 분신' : ''}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const handlePersonaCardPress = (type) => {
    if (type === 'custom') {
      setCustomModalVisible(true);
    } else if (type !== 'clone' && personaCharacteristics[type]) {
      setSelectedPersonaType(type);
      setSelectModalVisible(true);
    }
  };

  const renderPersonaSelectModal = () => {
    if (!selectedPersonaType || !personaCharacteristics[selectedPersonaType]) {
      return null;
    }

    const selectedPersona = personaCharacteristics[selectedPersonaType];
    
    return (
      <Modal
        visible={selectModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                onPress={() => setSelectModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Icon name="close-outline" size={24} color="#666" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{selectedPersona.name}의 특성</Text>
              <View style={styles.modalHeaderRight} />
            </View>
            
            <View style={styles.characteristicContainer}>
              <View style={styles.characteristicSection}>
                <Text style={styles.characteristicTitle}>성격</Text>
                <Text style={styles.characteristicText}>{selectedPersona.personality}</Text>
              </View>
              
              <View style={styles.characteristicSection}>
                <Text style={styles.characteristicTitle}>말투</Text>
                <Text style={styles.characteristicText}>{selectedPersona.speechStyle}</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.confirmButton}
              onPress={() => setSelectModalVisible(false)}
            >
              <Text style={styles.confirmButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  // 커스텀 모달 제출 핸들러
  const handleCustomSubmit = () => {
    const { name, personality, speechStyle } = customPersona;
    
    if (!name.trim() || !personality.trim() || !speechStyle.trim()) {
      Alert.alert('알림', '모든 항목을 입력해주세요.');
      return;
    }

    setPersonaDetails(prev => ({
      ...prev,
      custom: {
        name: name,
        personality: personality,
        speechStyle: speechStyle
      }
    }));
    
    // 모달 닫고 입력값 초기화
    setCustomModalVisible(false);
    setCustomPersona({
      name: '',
      personality: '',
      speechStyle: ''
    });
  };

  // 커스텀 모달 렌더링 함수
  const renderCustomModal = () => {
    return (
      <Modal
        visible={customModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCustomModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.customModalView}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                onPress={() => setCustomModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Icon name="close-outline" size={24} color="#666" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>커스텀 페르소나</Text>
              <TouchableOpacity 
                onPress={handleCustomSubmit}
                style={styles.modalSaveButton}
              >
                <Text style={styles.modalSaveText}>완료</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>이름</Text>
                <TextInput
                  style={styles.input}
                  placeholder="페르소나의 이름을 입력하세요"
                  value={customPersona.name}
                  onChangeText={(text) => setCustomPersona(prev => ({...prev, name: text}))}
                  maxLength={10}
                />
              </View>

              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>성격</Text>
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  placeholder="페르소나의 성격을 자세히 설명해주세요"
                  value={customPersona.personality}
                  onChangeText={(text) => setCustomPersona(prev => ({...prev, personality: text}))}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>말투</Text>
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  placeholder="페르소나의 특징적인 말투를 설명해주세요"
                  value={customPersona.speechStyle}
                  onChangeText={(text) => setCustomPersona(prev => ({...prev, speechStyle: text}))}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.contentContainer}>
          {/* 상단 헤더 */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>AI 페르소나</Text>
          </View>

          {/* 이미지 선택 및 생성 섹션 */}
          <View style={styles.imageSection}>
            <View style={styles.guideContainer}>
              <Text style={styles.guideTitle}>나만의 귀여운 페르소나 만들기</Text>
              <Text style={styles.guideText}>얼굴 사진을 넣으면 AI가 당신과 닮은{'\n'}다양한 페르소나를 생성해드려요!</Text>
            </View>

            <TouchableOpacity 
              style={styles.imageContainer} 
              onPress={pickImage}
            >
              {image ? (
                <Image source={{ uri: image }} style={styles.selectedImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Icon name="camera-outline" size={32} color="#666" />
                  <Text style={styles.placeholderText}>얼굴 사진 선택하기</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[
                  styles.generateButton, 
                  (!image || !personaDetails.custom.name) && styles.generateButtonDisabled
                ]} 
                onPress={() => handleGeneratePersonas(false)}
                disabled={!image || !personaDetails.custom.name || loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Icon 
                      name="sparkles-outline" 
                      size={20} 
                      color="#FFFFFF" 
                      style={styles.generateIcon} 
                    />
                    <Text style={styles.generateText}>
                      사진으로 AI 페르소나 생성
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.skipButton,
                  !personaDetails.custom.name && styles.generateButtonDisabled
                ]} 
                onPress={() => handleGeneratePersonas(true)}
                disabled={!personaDetails.custom.name || loading}
              >
                <Text style={styles.skipButtonText}>
                  사진 없이 페르소나 생성
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 페르소나 섹션 */}
          <View style={styles.personaSection}>
            <Text style={styles.sectionTitle}>나의 페르소나</Text>
            <View style={styles.personaGrid}>
              {renderPersonaCard('joy')}
              {renderPersonaCard('anger')}
              {renderPersonaCard('sadness')}
              {renderPersonaCard('custom')}
              {renderPersonaCard('clone')}
            </View>
          </View>
        </View>
      </ScrollView>
      {renderPersonaSelectModal()}
      {renderCustomModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#DBDBDB',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#262626',
  },
  imageSection: {
    alignItems: 'center',
    gap: 24,
    marginBottom: 32,
  },
  guideContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  guideTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#262626',
    marginBottom: 8,
  },
  guideText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#0095F6',
    borderStyle: 'dashed',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  placeholderText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0095F6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '100%',
    maxWidth: 300,
  },
  generateButtonDisabled: {
    backgroundColor: '#B2DFFC',
  },
  generateIcon: {
    marginRight: 8,
  },
  generateText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  personaSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#262626',
    marginBottom: 16,
  },
  personaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  personaCard: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  personaImage: {
    width: '80%',
    height: '80%',
    borderRadius: 50,
    marginBottom: 8,
  },
  personaName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginTop: 8,
    textAlign: 'center',
  },
  personaDetail: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginTop: 4,
  },
  customPersonaPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  customText: {
    marginTop: 8,
    color: '#5271FF',
    fontSize: 14,
  },
  emptyPersona: {
    width: '80%',
    height: '80%',
    borderRadius: 50,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  emptyPersonaText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalView: {
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 20,
    paddingBottom: 30,
    maxHeight: '80%',
  },
  modalContent: {
    flex: 1,
    alignItems: 'center',
  },
  modalImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#DBDBDB',
  },
  modalCloseButton: {
    padding: 4,
    width: 40,
    alignItems: 'center',
  },
  modalHeaderRight: {
    width: 40, // 좌우 균형을 맞추기 위한 빈 공간
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#262626',
  },
  characteristicContainer: {
    padding: 20,
  },
  characteristicSection: {
    marginBottom: 20,
  },
  characteristicTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#262626',
    marginBottom: 8,
  },
  characteristicText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  confirmButton: {
    backgroundColor: '#5271FF',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  modalTextContainer: {
    width: '80%',
    height: '30%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#262626',
  },
  dropdownContainer: {
    width: '80%',
    marginBottom: 20,
    zIndex: 1000,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#262626',

  },
  dropdownMenu: {
    position: 'absolute',
    top: '150%', // 버튼 바로 아래에 위치
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#DBDBDB',
    marginTop: 5,
  },
  dropdownItem: {
    padding: 10,
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#262626',
  },
  disabledButton: {
    backgroundColor: '#A0A0A0',
  },
  personaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 20,
  },
  personaCard: {
    width: '45%',
    aspectRatio: 1,
    marginBottom: 20,
    borderRadius: 15,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personaImage: {
    width: '80%',
    height: '80%',
    borderRadius: 75,
  },
  personaName: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
  },
  customPersonaPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  customText: {
    marginTop: 10,
    color: '#5271FF',
    fontSize: 16,
  },
  generateButton: {
    backgroundColor: '#5271FF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: '80%',
    alignItems: 'center',
    marginTop: 20,
  },
  customModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: '#5271FF',
  },
  cancelButtonText: {
    color: '#666',
    textAlign: 'center',
    fontSize: 16,
  },
  confirmButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
  characteristicContainer: {
    padding: 20,
  },
  characteristicSection: {
    marginBottom: 20,
  },
  characteristicTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  characteristicText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  customModalView: {
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    height: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#DBDBDB',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#262626',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalSaveButton: {
    padding: 4,
  },
  modalSaveText: {
    color: '#0095F6',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    padding: 16,
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#262626',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DBDBDB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    gap: 12,
    marginTop: 20,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5271FF',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  generateButtonDisabled: {
    backgroundColor: '#E8E8E8',
  },
  generateText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '600',
  },
  generateIcon: {
    marginRight: 4,
  },
});

