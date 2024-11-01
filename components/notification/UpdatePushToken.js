// import * as Notifications from 'expo-notifications';
// import { auth } from 'firebase/auth';
// import { db } from 'firebase/firestore';
// import NowPushToken from './NowPushToken';

// const UpdatePushToken = async (userId) => {
//   console.log("UpdatePushToken.js 실행");
//   try {
//     // userId를 직접 사용
//     if (!userId) {
//       console.log("사용자 ID가 제공되지 않았습니다");
//       return null;
//     }

//     // 현재 토큰 가져오기
//     const nowExpoPushToken = await NowPushToken();
//     console.log("UpdatePushToken > 현재 토큰:", nowExpoPushToken);

//     // Firestore 문서 참조 및 데이터 가져오기
//     const userRef = firestore().collection('users').doc(userId);
//     const userDoc = await userRef.get();
    
//     // console.log("Firestore 문서 데이터:", userDoc.data());

//     const savedToken = userDoc.exists ? userDoc.data().pushToken : null;
//     console.log("UpdatePushToken > 저장된 토큰:", savedToken);

//     if (savedToken !== nowExpoPushToken) {
//       console.log("UpdatePushToken > 토큰 업데이트 필요");
//       await userRef.update({
//         pushToken: nowExpoPushToken
//       });
//       console.log("UpdatePushToken > 토큰 업데이트 완료");
//     }

//     return nowExpoPushToken;
//   } catch (e) {
//     console.error("UpdatePushToken > 토큰 처리 중 오류:", e);
//     console.error("에러 상세:", e.message);
//     return null;
//   }
// };

// export default UpdatePushToken;