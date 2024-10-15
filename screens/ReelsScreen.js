import React, { useState, useRef } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, Animated, PanResponder } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSelector } from 'react-redux';

export default function ReelsScreen() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dotImages, setDotImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const panY = useRef(new Animated.Value(0)).current;

  const resetPositionAnim = Animated.timing(panY, {
    toValue: 0,
    duration: 300,
    useNativeDriver: true,
  });

  const closeAnim = Animated.timing(panY, {
    toValue: 1000,
    duration: 300,
    useNativeDriver: true,
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => false,
      onPanResponderMove: (e, gs) => {
        panY.setValue(gs.dy);
      },
      onPanResponderRelease: (e, gs) => {
        if (gs.dy > 50) {
          closeAnim.start(() => setModalVisible(false));
        } else {
          resetPositionAnim.start();
        }
      },
    })
  ).current;

  const user = useSelector((state) => state.user.user);

  const profileImage = user.profileImg;

  const pickImage = async () => {
    let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("사진 접근 권한이 필요합니다!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleButtonPress = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDotImages([
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
        'https://example.com/image3.jpg',
        'https://example.com/image4.jpg',
        'https://example.com/image5.jpg',
      ]);
    }, 3000);
  };

  const handleDotPress = (image) => {
    setSelectedImage(image);
    setModalVisible(true);
    resetPositionAnim.start();
  };

  const translateY = panY.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>+</Text>
            <Text style={styles.placeholderSubText}>사진 추가</Text>
          </View>
        )}
      </TouchableOpacity>
      <Text style={styles.text}>당신의 사진을 넣어주세요</Text>
      
      <View style={styles.dotsContainer}>
        <View style={styles.dotsRow}>
          {[...Array(3)].map((_, i) => (
            <TouchableOpacity key={i} onPress={() => dotImages[i] && handleDotPress(dotImages[i])}>
              <View style={dotImages[i] ? styles.dotImage : styles.skeleton}>
                {dotImages[i] && <Image source={{ uri: dotImages[i] }} style={styles.dotImage} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.dotsRow}>
          {[...Array(2)].map((_, i) => (
            <TouchableOpacity key={i + 3} onPress={() => dotImages[i + 3] && handleDotPress(dotImages[i + 3])}>
              <View style={dotImages[i + 3] ? styles.dotImage : styles.skeleton}>
                {dotImages[i + 3] && <Image source={{ uri: dotImages[i + 3] }} style={styles.dotImage} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0095F6" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleButtonPress}>
          <Text style={styles.buttonText}>친구 꾸며주기</Text>
        </TouchableOpacity>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[styles.modalView, { transform: [{ translateY }] }]}
            {...panResponder.panHandlers}
          >
            <View style={styles.modalHeader}>
              <View style={styles.modalIndicator} />
            </View>
            <View style={styles.modalContent}>
              <Image source={{ uri: selectedImage }} style={styles.modalImage} />
              {/* 여기에 추가 모달 내용을 넣을 수 있습니다 */}
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
    padding: 20,
  },
  topSection: {
    alignItems: 'center',
    marginTop: 50, // 이 값을 조절하여 원의 위치를 위로 옮깁니다.
  },
  imageContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#DBDBDB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
  },
  placeholderText: {
    fontSize: 40,
    color: '#AAAAAA',
  },
  placeholderSubText: {
    fontSize: 16,
    color: '#AAAAAA',
    marginTop: 5,
  },
  text: {
    marginBottom: 20,
    fontSize: 16,
    color: '#262626',
  },
  dotsContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  dotImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: '#DBDBDB',
  },
  skeleton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#EFEFEF',
    marginHorizontal: 10,
  },
  button: {
    backgroundColor: '#0095F6',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalView: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 0,  // 상단 패딩 제거
    paddingHorizontal: 35,
    paddingBottom: 35,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    height: '80%',
  },
  modalContent: {
    flex: 1,
    alignItems: 'center',
  },
  modalImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  modalHeader: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  modalIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#DDDDDD',
    borderRadius: 2,
  },
});
