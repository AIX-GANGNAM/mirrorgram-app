import axios from 'axios';
import { firestore } from 'firebase/firestore';

const findProfileImageFromUid = async (uid) => {
  console.log("보내는 사람의 대표 이미지 찾기");
  const userDoc = await firestore().collection('users').doc(uid).get();
  const profileImage = userDoc.data().profileImage;
  if(profileImage === undefined){
    return 'https://example.com/default-image.jpg'; // 기본 이미지
  }
  return profileImage
}

const findUserDisplayNameFromUid = async (uid) => {  
  console.log('findUserNameFromUid > uid : ', uid);
  if(uid === 'System'){
    return '시스템';
  }
  if(uid === 'clone'){
    return 'MyBot';
  }

  try {
    const userDoc = await firestore().collection('users').doc(uid).get();
    console.log('findUserNameFromUid > userDoc : ', userDoc);
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      const DisplayName=userData.displayName;
      console.log('findUserNameFromUid > DisplayName : ', DisplayName);
      return DisplayName;
    }
    return '알 수 없는 사용자';
  } catch (error) {
    console.error('Error fetching user email:', error);
    return '알 수 없는 사용자';
  }
};

// 알림 타입별 메시지 포맷 정의
const SCREEN_TYPES = {
  Playground: {
    type: 'Playground',
    getMessage: (data) => `이미지 생성을 완료했습니다.`
  },
  Like: {
    type: 'Like',
    getMessage: (data) => `${data.userName}님이 회원님의 게시물을 좋아합니다.`
  },
  FriendRequest: {
    type: 'FriendRequest',
    getMessage: (data) => `${data.userName}님이 친구 요청을 보냈습니다.`
  },
  FriendAccept: {
    type: 'FriendAccept',
    getMessage: (data) => `${data.userName}님이 친구 요청을 수락했습니다.`
  },
  FriendReject: {
    type: 'FriendReject',
    getMessage: (data) => `${data.userName}님이 친구 요청을 거절했습니다.`
  },
  PersonaChat: {
    type: 'PersonaChat',
    getMessage: (data) => `${data.userName}님이 새로운 메시지를 보냈습니다: ${data.message}`
  },
  PostComment: {
    type: 'PostComment',
    getMessage: (data) => `${data.userName}님이 회원님의 게시물에 댓글을 남겼습니다.`
  },
  ChatUserScreen: {
    type: 'ChatUserScreen',
    getMessage: (data) => `${data.userName}님이 새로운 메시지를 보냈습니다: ${data.message}`
  }
};

// 각 pushType에 대한 URL이 있어야 이동을 한다
// 특정 유저에게 알림 보내기
const sendNotificationToUser = async (targetUserUid, fromUid, URL, inputScreenType) => {
  try {
    const whoSendMessage = await findUserDisplayNameFromUid(fromUid); // 내가 상대방에게 알람을 보내는데, 상대방에게 표시되는 내 이름
    const profileImage = await findProfileImageFromUid(fromUid); // 내가 상대방에게 알람을 보내는데, 상대방에게 표시되는 내 이미지
    console.log('sendNotificationToUser > whoSendMessage : ', whoSendMessage);

    if (!targetUserUid || !whoSendMessage) {
      throw new Error('Required user information is missing');
    }

    const screenType = SCREEN_TYPES[inputScreenType.toUpperCase()];
    console.log('sendNotificationToUser > screenType : ', screenType);
    if (!screenType) {
      throw new Error(`잘못된 화면 타입입니다 : ${inputScreenType}`);
    }

    // 서버 모델과 정확히 일치하는 데이터 구조
    const requestData = {
      targetUid: targetUserUid,
      fromUid: fromUid,
      whoSendMessage: whoSendMessage,
      profileImage: profileImage,
      message: screenType.getMessage({ userName: whoSendMessage }),
      screenType: screenType.type,
      URL: URL || '없음'
    };

    console.log('전송 데이터 확인:', requestData);

    // 모든 필드가 존재하는지 확인
    const requiredFields = ['targetUid', 'fromUid', 'whoSendMessage', 'message', 'screenType', 'URL'];
    for (const field of requiredFields) {
      if (!requestData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    const response = await axios.post(
      'http://192.168.0.229:8000/notification', 
      requestData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;

  } catch (error) {
    if (error.response) {
      console.error('서버 에러 응답:', {
        status: error.response.status,
        data: error.response.data,
        detail: error.response.data.detail
      });
    }
    throw error;
  }
};

export default sendNotificationToUser;