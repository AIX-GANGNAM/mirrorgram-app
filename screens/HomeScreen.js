import React, {useEffect , useState} from 'react';
import { SafeAreaView, View, KeyboardAvoidingView, Text, StyleSheet, ScrollView, BackHandler, Alert } from 'react-native';

import Header from '../components/home/Header';
import Stories from '../components/home/Stories';
import Post from '../components/home/Post';
import { POSTS } from '../data/posts';
import { Platform } from 'react-native';

const HomeScreen = () => {

  console.log('home 화면 확인해보자');

  useEffect(() => {
          const backAction = () => {
            Alert.alert('Hold on!', 'Are you sure you want to go back?', [
              {
                text: 'Cancel',
                onPress: () => null,
                style: 'cancel',
              },
              {text: 'YES', onPress: () => BackHandler.exitApp()},
            ]);
            return true;
          };
  
          const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction,
          );
  
          return () => backHandler.remove();
        }, []);

  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const posts = await POSTS();

      console.log('post 값을 혹인해보자',posts);
      setPosts(posts);
    };
    fetchPosts();
  }, [POSTS]);

  return(
   <SafeAreaView style={styles.container}>
     <Header />
     <ScrollView>
     <Stories />
       {
	posts.map((post, index) => (
          <Post post={post} key={index} />
	))}
     </ScrollView>
   </SafeAreaView>
  );
}

export default HomeScreen;



const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS==='ios'? 0 : 25,
    backgroundColor: '#fff',
  },
});
