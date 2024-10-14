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
});

export default HomeScreen;
