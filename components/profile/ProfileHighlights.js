import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { doc, onSnapshot } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';


const ProfileHighlights = () => {
  const navigation = useNavigation();
  const user = useSelector(state => state.user.user);
  const [userData, setUserData] = useState(null);
  const [highlights, setHighlights] = useState([]);

  const db = getFirestore();

  useEffect(() => {
    if (user && user.uid) {
      const unsub = onSnapshot(
        doc(db, 'users', user.uid),
        { includeMetadataChanges: true },
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            setUserData(docSnapshot.data());
          }
        }
      );

      return () => unsub();
    }
  }, [user]);

  useEffect(() => {
    if (userData) {
      const newHighlights = [
        { id: 1, title: '기쁜놈', persona: 'Joy', image: userData.persona?.joy },
        { id: 2, title: '화남놈', persona: 'Anger', image: userData.persona?.anger },
        { id: 3, title: '까칠이', persona: 'Disgust', image: userData.persona?.disgust },
        { id: 4, title: '슬픔', persona: 'Sadness', image: userData.persona?.sadness },
        { id: 5, title: '선비', persona: 'Serious', image: userData.persona?.serious },
      ];
      setHighlights(newHighlights);
    }
  }, [userData]);

  const handleHighlightPress = (highlight) => {
    navigation.navigate('Chat', { highlightTitle: highlight.title, highlightImage: highlight.image, persona: highlight.persona });
  };

  const renderHighlightContent = (highlight) => {
    if (highlight.image) {
      return (
        <Image 
          source={{ uri: highlight.image }} 
          style={styles.highlightImage}
          onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
        />
      );
    } else {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#0000ff" />
          <Text style={styles.loadingText}>생성중</Text>
        </View>
      );
    }
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
      <TouchableOpacity style={styles.highlightItem}>
        <View style={styles.addButton}>
          <Ionicons name="add" size={24} color="#fff" />
        </View>
        <Text style={styles.highlightText}>New</Text>
      </TouchableOpacity>
      {highlights.map((highlight) => (
        <TouchableOpacity 
          key={highlight.id} 
          style={styles.highlightItem}
          onPress={() => handleHighlightPress(highlight)}
        >
          <View style={styles.highlightImageContainer}>
            {renderHighlightContent(highlight)}
          </View>
          <Text style={styles.highlightText} numberOfLines={1}>{highlight.title}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 15,
    backgroundColor: '#fff', // 배경색을 흰색으로 변경
  },
  highlightItem: {
    alignItems: 'center',
    marginRight: 15,
    width: 70,
  },
  addButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f0f0f0', // 배경색을 밝은 회색으로 변경
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dbdbdb', // 테두리 색상을 연한 회색으로 변경
  },
  highlightImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#dbdbdb', // 테두리 색상을 연한 회색으로 변경
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  highlightImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  highlightText: {
    color: '#262626', // 텍스트 색상을 어두운 회색으로 변경
    marginTop: 5,
    fontSize: 12,
    textAlign: 'center',
    width: '100%',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 10,
    color: '#0000ff',
    marginTop: 5,
  },
});

export default ProfileHighlights;
