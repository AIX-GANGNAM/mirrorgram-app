import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const FriendHeader = ({ onTabChange, activeTab }) => {
  const navigation = useNavigation();
  const [friendCount, setFriendCount] = useState(0);
  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    if (!auth.currentUser) return;

    // 친구 수를 실시간으로 감시하는 리스너 설정
    const friendsQuery = query(
      collection(db, 'friends'),
      where('userId', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(friendsQuery, (snapshot) => {
      setFriendCount(snapshot.size);
    }, (error) => {
      console.error('Error listening to friends count:', error);
    });

    // 컴포넌트 언마운트 시 리스너 해제
    return () => unsubscribe();
  }, [db, auth.currentUser]);

  return (
    <View style={styles.headerContainer}>
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>친구</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('FriendRequests')} 
          style={styles.notificationButton}
        >
          <Ionicons name="people-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          onPress={() => onTabChange('friends')} 
          style={[styles.tabButton, activeTab === 'friends' && styles.activeTabButton]}
        >
          <Text style={styles.tabText}>
            {friendCount} 친구
          </Text>
          {activeTab === 'friends' && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => onTabChange('ProfileSearch')} 
          style={[styles.tabButton, activeTab === 'ProfileSearch' && styles.activeTabButton]}
        >
          <Text style={styles.tabText}>친구찾기</Text>
          {activeTab === 'ProfileSearch' && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 4,
  },
  notificationButton: {
    padding: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  tabButton: {
    paddingVertical: 12,
    marginRight: 24,
    position: 'relative',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#536471',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#000',
    borderRadius: 3,
  }
});

export default FriendHeader;