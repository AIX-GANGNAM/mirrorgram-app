import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const FriendRequestButton = ({ targetUserId }) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [canSendRequest, setCanSendRequest] = useState(true);
  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    checkExistingRequest();
  }, [targetUserId]);

  const checkExistingRequest = async () => {
    if (!targetUserId || !auth.currentUser) return;

    try {
      // 이미 친구인지 확인
      const friendsQuery = query(
        collection(db, 'friends'),
        where('userId', '==', auth.currentUser.uid),
        where('friendId', '==', targetUserId)
      );
      const friendsSnapshot = await getDocs(friendsQuery);
      
      if (!friendsSnapshot.empty) {
        setCanSendRequest(false);
        return;
      }

      // 보류 중인 요청이 있는지 확인
      const requestQuery = query(
        collection(db, 'friendRequests'),
        where('fromId', '==', auth.currentUser.uid),
        where('toId', '==', targetUserId),
        where('status', '==', 'pending')
      );
      const requestSnapshot = await getDocs(requestQuery);
      
      setCanSendRequest(requestSnapshot.empty);
    } catch (error) {
      console.error('Error checking friend status:', error);
    }
  };

  const handleAddFriend = async () => {
    if (!canSendRequest || isRequesting) return;

    try {
      setIsRequesting(true);
      const currentUser = auth.currentUser;
      
      // 다시 한번 중복 체크
      const requestQuery = query(
        collection(db, 'friendRequests'),
        where('fromId', '==', currentUser.uid),
        where('toId', '==', targetUserId)
      );
      const requestSnapshot = await getDocs(requestQuery);
      
      if (!requestSnapshot.empty) {
        Alert.alert('알림', '이미 친구 요청을 보냈습니다.');
        setCanSendRequest(false);
        return;
      }
      
      // 친구 요청 보내기
      await addDoc(collection(db, 'friendRequests'), {
        fromId: currentUser.uid,
        toId: targetUserId,
        status: 'pending',
        timestamp: new Date().toISOString(),
        fromUserName: currentUser.displayName || '',
        fromUserPhoto: currentUser.photoURL || ''
      });
      
      setCanSendRequest(false);
      Alert.alert('성공', '친구 요청을 보냈습니다.');
    } catch (error) {
      console.error('Error adding friend:', error);
      Alert.alert('오류', '친구 요청 중 오류가 발생했습니다.');
    } finally {
      setIsRequesting(false);
    }
  };

  if (!canSendRequest) {
    return (
      <View style={styles.disabledButton}>
        <Text style={styles.disabledButtonText}>요청됨</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity 
      style={[styles.addFriendButton, isRequesting && styles.requestingButton]}
      onPress={handleAddFriend}
      disabled={isRequesting || !canSendRequest}
    >
      {isRequesting ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <Text style={styles.addFriendButtonText}>친구 추가</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  addFriendButton: {
    backgroundColor: '#5271ff',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 16,
    minWidth: 100,
  },
  requestingButton: {
    opacity: 0.7,
  },
  disabledButton: {
    backgroundColor: '#E0E0E0',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 16,
    minWidth: 100,
  },
  addFriendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FriendRequestButton;