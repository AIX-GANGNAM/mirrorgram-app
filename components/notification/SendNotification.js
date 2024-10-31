import axios from 'axios';
import { getDeviceIPAddress } from '../../utils/getIpAddress';
import { Platform } from 'react-native';
import auth from '@react-native-firebase/auth';

const extractUserNameFromEmail = async (uid) => {
  try {
    const userDoc = await firestore().collection('users').doc(uid).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      const email = userData.email || '';
      return email.split('@')[0];  // 이메일의 @ 앞부분만 반환
    }
    return '알 수 없는 사용자';
  } catch (error) {
    console.error('Error fetching user email:', error);
    return '알 수 없는 사용자';
  }
};

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

// 각 pushType에 대한 URL이 있어야 이동을 한다
// 특정 유저에게 알림 보내기
const sendNotificationToUser = async (otherUserUid  , URL, pushType) => {
  console.log('SendNotificationToUser.js 실행');
  console.log('otherUserUid : ', otherUserUid);
  console.log('URL : ', URL);
  console.log('pushType : ', pushType);

  try {
    const friendUid = otherUserUid;
    const whoSendMessage = await extractUserNameFromEmail(auth.currentUser.uid);

    console.log('whoSendMessage : ', whoSendMessage);
    console.log('friendUid : ', friendUid);

    if (!friendUid || !whoSendMessage) {
      throw new Error('Required user information is missing');
    }

    const notificationType = NOTIFICATION_TYPES[pushType.toUpperCase()];
    if (!notificationType) {
      throw new Error(`잘못된 알림 타입입니다 : ${pushType}`);
    }

    // IP 주소 가져오기
    const deviceIP = await getDeviceIPAddress();
    const baseURL = deviceIP ? `http://${deviceIP}:8000` : 'http://localhost:8000';

    // 알림 데이터 구성
    const notificationPayload = {
      uid: friendUid,
      whoSendMessage: whoSendMessage,
      message: notificationType.getMessage({
        userName: whoSendMessage,
      }),
      URL: URL || '', // 이동할 URL
      pushType: notificationType.type,
    };

    // 백엔드에 알림 전송
    const response = await axios.post('http://localhost:8000/notification', notificationPayload);
    
    console.log('알람 보내기 성공 : ', response.data);
    return response.data;

  } catch (error) {
    console.error('알람 보내기 실패 : ', error);
    throw error;
  }
};

export default sendNotificationToUser;

// 사용 예시:
/*
// 좋아요 알림
await sendNotificationToUser(userId, {
  userName: '홍길동',
  metadata: { postId: 'post123' }
}, 'LIKE');

// 친구 요청 알림
await sendNotificationToUser(userId, {
  userName: '김철수'
}, 'FRIEND_REQUEST');

// 채팅 메시지 알림
await sendNotificationToUser(userId, {
  userName: '이영희',
  message: '안녕하세요!',
  metadata: { chatRoomId: 'chat456' }
}, 'PERSONA_CHAT');
*/