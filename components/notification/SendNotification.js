import axios from 'axios';
import { getOtherPushTokenByUserId } from './GetOtherUserUidByUserId';
import { getDeviceIPAddress } from '../../utils/getIpAddress';
import { Platform } from 'react-native';
import auth from '@react-native-firebase/auth';

// 알림 타입별 메시지 포맷 정의
const NOTIFICATION_TYPES = {
  LIKE: {
    type: 'like',
    getMessage: (data) => `${data.userName}님이 회원님의 게시물을 좋아합니다.`
  },
  FRIEND_REQUEST: {
    type: 'friendRequest',
    getMessage: (data) => `${data.userName}님이 친구 요청을 보냈습니다.`
  },
  FRIEND_ACCEPT: {
    type: 'friendAccept',
    getMessage: (data) => `${data.userName}님이 친구 요청을 수락했습니다.`
  },
  FRIEND_REJECT: {
    type: 'friendReject',
    getMessage: (data) => `${data.userName}님이 친구 요청을 거절했습니다.`
  },
  PERSONA_CHAT: {
    type: 'personaChat',
    getMessage: (data) => `${data.userName}님이 새로운 메시지를 보냈습니다: ${data.message}`
  },
  COMMENT: {
    type: 'comment',
    getMessage: (data) => `${data.userName}님이 회원님의 게시물에 댓글을 남겼습니다.`
  },
  MENTION: {
    type: 'mention',
    getMessage: (data) => `${data.userName}님이 회원님을 멘션했습니다.`
  }
};

const sendNotificationToOther = async (userId, notificationData, pushType) => {
  try {
    const friendUid = await getOtherPushTokenByUserId(userId);
    const currentUser = auth.currentUser;
    
    if (!friendUid || !currentUser) {
      throw new Error('Required user information is missing');
    }

    const notificationType = NOTIFICATION_TYPES[pushType.toUpperCase()];
    if (!notificationType) {
      throw new Error(`Invalid push type: ${pushType}`);
    }

    // IP 주소 가져오기
    const deviceIP = await getDeviceIPAddress();
    const baseURL = deviceIP ? `http://${deviceIP}:8000` : 'http://localhost:8000';

    // 알림 데이터 구성
    const notificationPayload = {
      uid: friendUid,
      whoSendMessage: currentUser.uid,
      message: notificationType.getMessage({
        userName: notificationData.userName || '사용자',
        message: notificationData.message || '',
        ...notificationData
      }),
      pushType: notificationType.type,
      // 추가 메타데이터
      metadata: {
        timestamp: new Date().toISOString(),
        type: notificationType.type,
        ...notificationData.metadata
      }
    };

    // 백엔드에 알림 전송
    const response = await axios.post(`${baseURL}/v2/chat`, notificationPayload);
    
    console.log('Notification sent successfully:', response.data);
    return response.data;

  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

export default sendNotificationToOther;

// 사용 예시:
/*
// 좋아요 알림
await sendNotificationToOther(userId, {
  userName: '홍길동',
  metadata: { postId: 'post123' }
}, 'LIKE');

// 친구 요청 알림
await sendNotificationToOther(userId, {
  userName: '김철수'
}, 'FRIEND_REQUEST');

// 채팅 메시지 알림
await sendNotificationToOther(userId, {
  userName: '이영희',
  message: '안녕하세요!',
  metadata: { chatRoomId: 'chat456' }
}, 'PERSONA_CHAT');
*/