import * as Notifications from 'expo-notifications';
import { auth } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import NowPushToken from './NowPushToken';

const UpdatePushToken = async (userId) => {
  console.log("UpdatePushToken.js 실행");
  try {
    // userId를 직접 사용
    if (!userId) {
      console.log("사용자 ID가 제공되지 않았습니다");
      return null;
    }

    // 현재 토큰 가져오기
    const nowExpoPushToken = await NowPushToken();

    // Firestore 문서 참조 및 데이터 가져오기
    const db = getFirestore();
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    // console.log("Firestore 문서 데이터:", userDoc.data());

    const savedToken = userDoc.exists() ? userDoc.data().pushToken : null;
    console.log("저장된 토큰:", savedToken);

    if (savedToken !== nowExpoPushToken) {
      console.log("토큰 업데이트 필요");
      const updated = await updateDoc(userRef, {
        pushToken: nowExpoPushToken
      });
      console.log("업데이트 전 : ",nowExpoPushToken);
      console.log("업데이트 후 : ", updated);
      console.log("토큰 업데이트 완료");
    }

    return nowExpoPushToken;
  } catch (e) {
    console.error("UpdatePushToken > 토큰 처리 중 오류:", e);
    console.error("에러 상세:", e.message);
    return null;
  }
};

export default UpdatePushToken;