import React, { useState, useEffect } from 'react';
import Constants from 'expo-constants';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Platform } from 'react-native';
// Firebase 관련 주석 처리
// import { getFirestore, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
// import { useSelector } from 'react-redux';

const PostDetail = ({ route }) => {
  const navigation = useNavigation();
  const [userProfile, setUserProfile] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showOptions, setShowOptions] = useState(false);

  // Firebase 관련 부분 주석 처리
  // const currentUser = useSelector(state => state.user.user);
  // const db = getFirestore();

  // fetchUserAndComments 관련 부분 주석 처리
  useEffect(() => {
    const fetchUserAndComments = async () => {
      setLoading(false);
    };
    fetchUserAndComments();
  }, []);

  // handleLike, handleDelete 함수 내용 주석 처리 후 null 반환으로 대체
  const handleBack = () => {
    navigation.goBack();
  };

  const handleLike = async () => {
    Alert.alert('테스트', '좋아요 버튼 눌림');
  };

  const handleDelete = async () => {
    Alert.alert('테스트', '삭제 버튼 눌림');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="arrow-back" size={24} color="#1A1A1A" onPress={handleBack} />
        <Text style={styles.headerTitle}>게시물</Text>
        {/* 옵션 버튼 부분 주석 */}
      </View>
      <Text style={{ margin: 20, fontSize: 16 }}>기본적인 테스트용 UI</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 0 : 25,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
});

export default PostDetail;
