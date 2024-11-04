import { navigationRef ,navigate } from '../../utils/navigationRef';

const GoToScreen = ({response}) => {
    console.log("GoToScreen.js 실asdaaaf행");
  console.log("navigationRef.isReady() : ", navigationRef.isReady());
  console.log("navigationRef.current : ", navigationRef.current);
  console.log("navigationRef.navigate : ", navigationRef.navigate);
  console.log("response : ", response);

  // response에서 필요한 데이터 추출
  const data = response.data;  // 데이터 구조에 맞게 수정
  const screenType = data.screenType;  // screenType 추출
  const URL = data.URL;  // URL 추출

  console.log("추출된 데이터:", {
      screenType: screenType,
      URL: URL
  });

  if (!navigationRef.isReady()) {
    console.log("Navigation is not ready");
    return;
}

if(navigationRef.isReady() ){

  console.log("navigationRef.isReady() 참");
  console.log("screenType : ", screenType);

  // 알림 타입에 따라 화면 이동
  switch (screenType) {
    case 'LIKE':
      console.log("좋아요 알림 처리");
      navigate('PostDetail', {
        postId: URL
      });
      break;
      

    case 'PLAYGROUND':
      console.log("이미지 생성 완료 알림 처리");
      navigate('PlayGround');
      break;

    case 'FRIEND_REQUEST':
    case 'FRIEND_ACCEPT':
    case 'FRIEND_REJECT':
      console.log("친구 요청 알림 처리");
      navigate('FriendRequests');
      break;

    case 'PERSONA_CHAT':
      console.log("페르소나 채팅 알림 처리");
      navigate('PersonaChat', {
        chatId: data.chatId,
        personaId: data.personaId
      });
      break;

    case 'POST_COMMENT':
      console.log("댓글 알림 처리");
      navigate('PostDetail', {
        postId: data.postId,
        commentId: data.commentId
      });
      break;

    case 'MENTION':
      console.log("멘션 알림 처리");
      if (data.locationType === 'post') {
        navigationRef.navigate('PostDetail', {
          postId: data.postId
        });
      } else if (data.locationType === 'comment') {
        navigationRef.navigate('PostDetail', {
          postId: data.postId,
          commentId: data.commentId
        });
      }
      break;

    default:
      console.log('알 수 없는 알림 타입:', type);
    }
  }
};

export default GoToScreen;