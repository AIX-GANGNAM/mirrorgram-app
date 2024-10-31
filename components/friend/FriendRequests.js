import React, { useState, useEffect } from 'react';
import {View,Text,StyleSheet,
  TouchableOpacity,
  Image,FlatList,Alert,ActivityIndicator} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// Firebase 관련 기능 import
import { collection,query,where, getDocs,updateDoc,doc,addDoc,deleteDoc} from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const FriendRequests = ({ navigation }) => {  // navigation prop 추가
  // 상태 관리를 위한 state 선언
  const [requests, setRequests] = useState([]); // 친구 요청 목록
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [processingId, setProcessingId] = useState(null); // 현재 처리 중인 요청 ID
  
  // Firebase 초기화
  const db = getFirestore();
  const auth = getAuth();

  // 컴포넌트 마운트 시 친구 요청 목록 가져오기
  useEffect(() => {
    fetchFriendRequests();
  }, []);

  // 친구 요청 목록을 가져오는 함수
  const fetchFriendRequests = async () => {
    if (!auth.currentUser) return; // 로그인 상태 확인

    try {
      // 현재 사용자에게 온 대기 중인 친구 요청 쿼리
      const requestsQuery = query(
        collection(db, 'friendRequests'),
        where('toId', '==', auth.currentUser.uid),
        where('status', '==', 'pending')
      );

      // 쿼리 실행 및 데이터 변환
      const querySnapshot = await getDocs(requestsQuery);
      const requestsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setRequests(requestsData); // 상태 업데이트
    } catch (error) {
      console.error('Error fetching friend requests:', error);
      Alert.alert('오류', '친구 요청을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false); // 로딩 상태 종료
    }
  };

  // 친구 요청 수락 처리 함수
  const handleAcceptRequest = async (request) => {
    if (processingId) return; // 이미 처리 중인 요청이 있는지 확인
    setProcessingId(request.id); // 처리 중 상태로 설정

    try {
      // 양방향 친구 관계 생성 (현재 사용자 -> 요청 보낸 사용자)
      await addDoc(collection(db, 'friends'), {
        userId: auth.currentUser.uid,
        friendId: request.fromId,
        createdAt: new Date().toISOString()
      });

      // 양방향 친구 관계 생성 (요청 보낸 사용자 -> 현재 사용자)
      await addDoc(collection(db, 'friends'), {
        userId: request.fromId,
        friendId: auth.currentUser.uid,
        createdAt: new Date().toISOString()
      });

      // 친구 요청 상태 업데이트
      await updateDoc(doc(db, 'friendRequests', request.id), {
        status: 'accepted',
        processedAt: new Date().toISOString()
      });

      // 로컬 상태 업데이트 (목록에서 제거)
      setRequests(prevRequests => 
        prevRequests.filter(req => req.id !== request.id)
      );

      Alert.alert('성공', '친구 요청을 수락했습니다.');
    } catch (error) {
      console.error('Error accepting friend request:', error);
      Alert.alert('오류', '친구 요청 수락 중 오류가 발생했습니다.');
    } finally {
      setProcessingId(null); // 처리 중 상태 해제
    }
  };

  // 친구 요청 거절 처리 함수
  const handleRejectRequest = async (request) => {
    if (processingId) return; // 이미 처리 중인 요청이 있는지 확인
    setProcessingId(request.id); // 처리 중 상태로 설정

    try {
      // 친구 요청 문서 삭제
      await deleteDoc(doc(db, 'friendRequests', request.id));

      // 로컬 상태 업데이트 (목록에서 제거)
      setRequests(prevRequests => 
        prevRequests.filter(req => req.id !== request.id)
      );

      Alert.alert('성공', '친구 요청을 거절했습니다.');
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      Alert.alert('오류', '친구 요청 거절 중 오류가 발생했습니다.');
    } finally {
      setProcessingId(null); // 처리 중 상태 해제
    }
  };

  // 각 친구 요청 항목 렌더링 함수
  const renderRequestItem = ({ item }) => (
    <View style={styles.requestItem}>
      {/* 사용자 정보 섹션 */}
      <View style={styles.userInfo}>
        {/* 프로필 사진 또는 기본 아이콘 */}
        {item.fromUserPhoto ? (
          <Image 
            source={{ uri: item.fromUserPhoto }} 
            style={styles.userPhoto} 
          />
        ) : (
          <View style={styles.userPhotoPlaceholder}>
            <Ionicons name="person" size={24} color="#A0A0A0" />
          </View>
        )}
        {/* 사용자 이름과 요청 시간 */}
        <View style={styles.userText}>
          <Text style={styles.userName}>{item.fromUserName || '사용자'}</Text>
          <Text style={styles.requestTime}>
            {new Date(item.timestamp).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* 수락/거절 버튼 */}
      <View style={styles.actionButtons}>
        {/* 수락 버튼 */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.acceptButton,
            processingId === item.id && styles.processingButton
          ]}
          onPress={() => handleAcceptRequest(item)}
          disabled={processingId === item.id}
        >
          {processingId === item.id ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.actionButtonText}>수락</Text>
          )}
        </TouchableOpacity>

        {/* 거절 버튼 */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.rejectButton,
            processingId === item.id && styles.processingButton
          ]}
          onPress={() => handleRejectRequest(item)}
          disabled={processingId === item.id}
        >
          {processingId === item.id ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.actionButtonText}>거절</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  // 로딩 중 화면
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Image 
          source={require('../../assets/logo/mybot-log-color.png')} 
          style={styles.logo} 
        />
        <ActivityIndicator size="large" color="#5271ff" />
      </View>
    );
  }

  // 요청이 없을 때 화면
  if (requests.length === 0) {
    return (
        
        <View style={styles.mainContainer}>
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Image 
            source={require('../../assets/logo/mybot-log-color.png')} 
            style={styles.logo} 
          />
        </View>
        <View style={styles.centerContainer}>
          <Ionicons name="people-outline" size={48} color="#A0A0A0" />
          <Text style={styles.noRequestsText}>받은 친구 요청이 없습니다.</Text>
        </View>
      </View>
    );
  }

  // 메인 렌더링
  return (
    <View style={styles.mainContainer}>
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Image 
          source={require('../../assets/logo/mybot-log-color.png')} 
          style={styles.logo} 
        />
      </View>
      <FlatList
        data={requests}
        renderItem={renderRequestItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.container}
      />
    </View>
  );
};

const styles = StyleSheet.create({
   mainContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
  },
  backButton: {
    padding: 8,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 10,
    flex: 1,
  },
  container: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  
  requestItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  // 사용자 정보 영역 스타일
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userPhoto: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  userPhotoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userText: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  requestTime: {
    fontSize: 14,
    color: '#6C757D',
    marginTop: 2,
  },
  
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginLeft: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#5271ff',
  },
  rejectButton: {
    backgroundColor: '#dc3545',
  },
  processingButton: {
    opacity: 0.7,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  noRequestsText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6C757D',
  },
});

export default FriendRequests;