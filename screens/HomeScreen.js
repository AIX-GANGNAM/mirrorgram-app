import React, { useEffect, useState, useCallback } from 'react';
import { SafeAreaView, StyleSheet, View, FlatList, RefreshControl, Platform, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import Header from '../components/home/Header';
import ProfileHighlights from '../components/profile/ProfileHighlights';
import Post from '../components/home/Post';
import { POSTS } from '../data/posts';

const HomeScreen = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const user = useSelector((state) => state.user.user);

  const navigation = useNavigation();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [])
  );

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

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <View style={styles.highlightsContainer}>
        <ProfileHighlights />
      </View>
      <FlatList
        data={posts}
        renderItem={({ item }) => (
          <Post post={item} navigation={navigation} /> // navigation을 전달합니다.
        )}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 0 : 25,
    backgroundColor: '#fff',
  },
  highlightsContainer: {
    marginBottom: 0,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalContent: {
    backgroundColor: '#FFF5E6',
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    height: '40%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#8B4513',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 30,
    textAlign: 'center',
    color: '#A0522D',
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
    borderColor: '#D2691E',
    width: '48%',
  },
  buttonText: {
    color: '#D2691E',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  primaryButton: {
    backgroundColor: '#D2691E',
  },
  primaryButtonText: {
    color: 'white',
  },
});

export default HomeScreen;
