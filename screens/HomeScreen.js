import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, BackHandler, TouchableOpacity, Modal, Animated, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import Header from '../components/home/Header';
import Stories from '../components/home/Stories';
import Post from '../components/home/Post';
import { POSTS } from '../data/posts';
import { Platform } from 'react-native';
import { useSelector } from 'react-redux';

const HomeScreen = () => {
  const navigation = useNavigation();
  const user = useSelector(state => state.user.user);
  const [isModalVisible, setModalVisible] = useState(false);
  const [slideAnimation] = useState(new Animated.Value(0));
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (!user.profile.mbti) {
      setModalVisible(true);
      Animated.timing(slideAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [user, slideAnimation]);

  useEffect(() => {
    const backAction = () => {
      Alert.alert('잠깐!', '정말로 앱을 종료하시겠습니까?', [
        {
          text: '취소',
          onPress: () => null,
          style: 'cancel',
        },
        { text: '예', onPress: () => BackHandler.exitApp() },
      ]);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      const fetchedPosts = await POSTS();
      console.log('post 값을 확인해보자', fetchedPosts);
      setPosts(fetchedPosts);
    };
    fetchPosts();
  }, []);

  const handleLater = () => {
    Animated.timing(slideAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setModalVisible(false));
  };

  const handleInputNow = () => {
    handleLater();
    navigation.navigate('UserInfoStep1');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView>
        <Stories />
        {posts.map((post, index) => (
          <Post post={post} key={index} />
        ))}
      </ScrollView>
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="none"
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalContent,
              {
                transform: [
                  {
                    translateY: slideAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [300, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.modalTitle}>추가 정보 입력</Text>
            <Text style={styles.modalText}>
              추가 정보를 입력해주세요! 입력하면 페르소나가 더욱 사용자와의 대화를 자세하게 합니다.
            </Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={handleLater}>
                <Text style={styles.buttonText}>나중에</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleInputNow}>
                <Text style={[styles.buttonText, styles.primaryButtonText]}>지금 입력</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 0 : 25,
    backgroundColor: '#fff',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalContent: {
    backgroundColor: '#FFF5E6', // 웜톤 배경색
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    height: '40%', // 모달 크기 증가
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#8B4513', // 웜톤 제목 색상
  },
  modalText: {
    fontSize: 18,
    marginBottom: 30,
    textAlign: 'center',
    color: '#A0522D', // 웜톤 텍스트 색상
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D2691E', // 웜톤 버튼 테두리 색상
    width: '48%',
  },
  buttonText: {
    color: '#D2691E', // 웜톤 버튼 텍스트 색상
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  primaryButton: {
    backgroundColor: '#D2691E', // 웜톤 주 버튼 배경색
  },
  primaryButtonText: {
    color: 'white',
  },
});
