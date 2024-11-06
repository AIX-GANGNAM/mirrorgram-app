import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Image, 
  Animated, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  Modal,
  Dimensions 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { collection, query, where, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const { width, height } = Dimensions.get('window');

// 맵 매트릭스 정의
const mapMatrix = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 2, 2, 2, 0, 0, 0, 0, 3, 3, 3, 3, 0, 1],
    [1, 0, 2, 2, 2, 0, 0, 0, 0, 3, 3, 3, 3, 0, 1],
    [1, 0, 2, 8, 2, 0, 0, 0, 0, 3, 8, 3, 3, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 0, 1],
    [1, 0, 0, 0, 5, 5, 5, 5, 0, 0, 4, 4, 4, 0, 1],
    [1, 0, 0, 0, 5, 5, 5, 5, 0, 0, 4, 4, 4, 0, 1],
    [1, 0, 0, 0, 5, 8, 5, 5, 0, 0, 8, 4, 4, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 6, 6, 6, 6, 0, 0, 7, 7, 7, 0, 0, 0, 1],
    [1, 0, 6, 6, 6, 6, 0, 0, 7, 7, 7, 0, 0, 0, 1],
    [1, 0, 6, 6, 6, 6, 0, 0, 7, 7, 7, 0, 0, 0, 1],
    [1, 0, 6, 8, 8, 6, 0, 0, 7, 8, 7, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 9, 9, 0, 1],
    [1, 0, 0,10,10,10,10,10, 0, 9, 9, 9, 9, 0, 1],
    [1, 0, 0,10,10,10,10,10, 0, 9, 9, 9, 9, 0, 1],
    [1, 0, 0,10,10, 8,10,10, 0, 9, 8, 9, 9, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 0, 0, 0,11,11, 8,11, 0, 1],
    [1, 0, 1, 1, 1, 0, 0, 0, 0,11,11,11,11, 0, 1],
    [1, 0, 1, 1, 1, 0, 0, 0, 0,11,11,11,11, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ];

// 타일 크기 정의
const Tile_HEIGHT = 33;
const Tile_WIDTH = 30;

// 타일 색상 정의
const TILE_COLORS = {
  0: 'rgba(0, 255, 0, 0.2)',
  1: 'rgba(255, 0, 0, 0.3)',
  2: 'rgba(0, 0, 255, 0.3)',
  3: 'cyan',
  4: 'rgba(255, 255, 0, 0.3)',
  5: 'rgba(255, 0, 255, 0.3)',
  8: 'black'
};

export default function VillageV2() {
  const auth = getAuth();
  
  // 기존 상태들
  const [characters, setCharacters] = useState([
    {
      id: 1,
      position: new Animated.ValueXY({ x: Tile_WIDTH * 2, y: Tile_HEIGHT * 3 }),
      image: require('../../assets/character/yellow.png'),
    },
    // ... 다른 캐릭터들
  ]);

  // 모달 관련 상태
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [personaImage, setPersonaImage] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  // 페르소나 정보 데이터
  const personaInfo = {
    clone: {
      name: "분신",
      description: "당신의 또 다른 모습",
      traits: ["적응력", "다면성", "유연성"],
      specialty: "상황에 따른 역할 전환"
    },
    Joy: {
      name: "기쁨",
      description: "긍정적 에너지의 원천",
      traits: ["낙관성", "열정", "친근함"],
      specialty: "즐거운 순간 만들기"
    },
    Anger: {
      name: "분노",
      description: "정의와 변화의 동력",
      traits: ["결단력", "추진력", "정직함"],
      specialty: "부당한 상황 개선하기"
    },
    Sadness: {
      name: "슬픔",
      description: "공감과 치유의 매개체",
      traits: ["공감능력", "섬세함", "이해심"],
      specialty: "깊은 감정 이해하기"
    },
    custom: {
      name: "사용자 정의",
      description: "나만의 특별한 페르소나",
      traits: ["창의성", "독창성", "자유로움"],
      specialty: "새로운 관점 제시하기"
    }
  };

  // 메뉴 버튼 정의
  const menuButtons = [
    {
      image: { uri: personaImage?.clone },
      onPress: () => handlePersonaPress('clone'),
      type: 'clone'
    },
    {
      image: { uri: personaImage?.Joy },
      onPress: () => handlePersonaPress('Joy'),
      type: 'Joy'
    },
    {
      image: { uri: personaImage?.Anger },
      onPress: () => handlePersonaPress('Anger'),
      type: 'Anger'
    },
    {
      image: { uri: personaImage?.Sadness },
      onPress: () => handlePersonaPress('Sadness'),
      type: 'Sadness'
    },
    {
      image: { uri: personaImage?.custom },
      onPress: () => handlePersonaPress('custom'),
      type: 'custom'
    }
  ];

  // 페르소나 이미지 가져오기
  useEffect(() => {
    const fetchPersonaImage = async () => {
      try {
        const db = getFirestore();
        const user_doc = collection(db, 'users');
        const result = await getDoc(doc(user_doc, auth.currentUser.uid));
        const personaData = result.data().persona;
        
        const defaultImage = 'https://firebasestorage.googleapis.com/v0/b/mirrorgram-20713.appspot.com/o/%E2%80%94Pngtree%E2%80%94default%20avatar_5408436.png?alt=media&token=36f0736a-17cb-444f-8fe1-1bca085b28e2';
        
        const imageMap = personaData.reduce((acc, item) => {
          acc[item.Name] = item.IMG || defaultImage;
          return acc;
        }, {});
        
        setPersonaImage(imageMap);
      } catch (error) {
        console.error('페르소나 이미지 가져오기 실패:', error);
      }
    };

    fetchPersonaImage();
  }, []);

  // 메뉴 토글 함수
  const toggleMenu = () => {
    const toValue = isMenuOpen ? 0 : 1;
    
    Animated.spring(animation, {
      toValue,
      useNativeDriver: true,
      friction: 5,
      tension: 40,
      duration: 300
    }).start();
    
    setIsMenuOpen(!isMenuOpen);
  };

  // 페르소나 선택 핸들러
  const handlePersonaPress = (type) => {
    setSelectedPersona(personaInfo[type]);
    setModalVisible(true);
  };

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedPersona(null);
  };

  return (
    <View style={styles.container}>
      {/* 배경 맵 */}
      <Image 
        source={require('../../assets/map-background.gif')}
        style={styles.mapBackground}
      />
      
      {/* 캐릭터들 */}
      {characters.map((character) => (
        <Animated.View
          key={character.id}
          style={[
            styles.character,
            { transform: character.position.getTranslateTransform() }
          ]}
        >
          <Image source={character.image} style={styles.characterImage} />
        </Animated.View>
      ))}

      {/* 페르소나 모달 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleCloseModal}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCloseModal}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
            
            {selectedPersona && (
              <View style={styles.personaInfo}>
                <Text style={styles.personaName}>{selectedPersona.name}</Text>
                <Text style={styles.personaDescription}>
                  {selectedPersona.description}
                </Text>
                
                <View style={styles.traitsContainer}>
                  <Text style={styles.sectionTitle}>특성</Text>
                  {selectedPersona.traits.map((trait, index) => (
                    <View key={index} style={styles.traitItem}>
                      <Text style={styles.traitText}>• {trait}</Text>
                    </View>
                  ))}
                </View>
                
                <View style={styles.specialtyContainer}>
                  <Text style={styles.sectionTitle}>전문 분야</Text>
                  <Text style={styles.specialtyText}>
                    {selectedPersona.specialty}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 메뉴 버튼들 */}
      {menuButtons.map((button, index) => {
        const offsetX = (index + 1) * 60;
        
        return (
          <Animated.View
            key={index}
            style={[
              styles.floatingButton,
              styles.menuButton,
              {
                transform: [
                  {
                    translateX: animation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, offsetX]
                    })
                  },
                  {
                    scale: animation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1]
                    })
                  }
                ],
                opacity: animation
              }
            ]}
          >
            <TouchableOpacity 
              onPress={button.onPress}
              style={{ width: '100%', height: '100%' }}
            >
              <Image 
                source={button.image}
                style={styles.buttonImage}
              />
            </TouchableOpacity>
          </Animated.View>
        );
      })}

      {/* 메인 메뉴 버튼 */}
      <Animated.View
        style={[
          styles.floatingButton,
          {
            transform: [
              {
                rotate: animation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '45deg']
                })
              }
            ]
          }
        ]}
      >
        <TouchableOpacity onPress={toggleMenu}>
          <Icon name="add" size={24} color="white" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  mapBackground: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    resizeMode: 'cover',
  },
  character: {
    position: 'absolute',
    width: Tile_WIDTH,
    height: Tile_HEIGHT,
  },
  characterImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    zIndex: 1,
  },
  menuButton: {
    backgroundColor: '#FFFFFF',
    zIndex: 0,
  },
  buttonImage: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    resizeMode: 'cover'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.8,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  closeButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
    fontWeight: 'bold',
  },
  personaInfo: {
    width: '100%',
    paddingTop: 20,
  },
  personaName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  personaDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 10,
  },
  traitsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  traitItem: {
    marginVertical: 5,
  },
  traitText: {
    fontSize: 16,
    color: '#555',
  },
  specialtyContainer: {
    width: '100%',
  },
  specialtyText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 22,
  },
});