
import React, { useEffect, useState, useCallback } from 'react';
import { SafeAreaView, StyleSheet, ScrollView, View, KeyboardAvoidingView, ActivityIndicator, Alert } from 'react-native';
import { useSelector } from 'react-redux';

import Header from '../components/home/Header';
import Stories from '../components/home/Stories';
import Post from '../components/home/Post';
import { POSTS } from '../data/posts';

const HomeScreen = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = useSelector((state) => state.user.user);

  const fetchPosts = useCallback(async () => {
    if (user && user.uid) {
      try {
        setIsLoading(true);
        const fetchedPosts = await POSTS(user.uid);
        setPosts(fetchedPosts);
      } catch (error) {
        console.error('포스트 데이터 가져오기 실패:', error);
        Alert.alert('오류', '포스트를 불러오는 데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const renderItem = useCallback(({ item }) => <Post post={item} />, []);

  const keyExtractor = useCallback((item) => item.id.toString(), []);


  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView>
        <Stories />

      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        posts.map((post) => <Post key={post.id} post={post} />)
      )}
      </ScrollView>

    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,

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

export default HomeScreen;
