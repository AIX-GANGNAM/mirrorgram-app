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
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <Image source={require('../../assets/logo/mybot-log-color.png')} style={styles.logo} />

      <TouchableOpacity 
        onPress={() => navigation.navigate('FriendRequests')} 
        style={styles.notificationButton}
      >
        <Ionicons name="people-outline" size={24} color="#5271ff" />
      </TouchableOpacity>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          onPress={() => onTabChange('friends')} 
          style={[styles.tabButton, activeTab === 'friends' && styles.activeTabButton]}
        >
          <Text style={[
            styles.tabText, 
            activeTab === 'friends' ? styles.activeTabButtonText : styles.inactiveTab
          ]}>
            {friendCount} 친구
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => onTabChange('ProfileSearch')} 
          style={[styles.tabButton, activeTab === 'ProfileSearch' && styles.activeTabButton]}
        >
          <Text style={[
            styles.tabText, 
            activeTab === 'ProfileSearch' ? styles.activeTabButtonText : styles.inactiveTab
          ]}>
            친구찾기
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
  },
  backButton: {
    position: 'absolute',
    left: 10,
    top: 16,
  },
  notificationButton: {
    position: 'absolute',
    right: 10,
    top: 16,
    padding: 8,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#DBDBDB',
  },
  activeTabButton: {
    borderBottomColor: '#5271ff',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  activeTabButtonText: {
    color: '#5271ff',
    fontWeight: 'bold',
  },
  inactiveTab: {
    color: 'grey',
    opacity: 0.5,
  },
});

export default FriendHeader;