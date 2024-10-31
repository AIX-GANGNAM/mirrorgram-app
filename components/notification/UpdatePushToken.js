import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth } from 'firebase/auth';
import { db } from 'firebase/firestore';
import NowPushToken from './NowPushToken';

const UpdatePushToken = async () => {
  console.log("UpdatePushToken.js 실행");
  let token;
  
  try {
    // 현재 토큰 가져오기
    const nowExpoPushToken = await NowPushToken();
    console.log("현재 토큰:", nowExpoPushToken);

    // Firebase에서 현재 로그인한 사용자의 문서 참조 가져오기
    const userRef = doc(db, 'users', auth.currentUser.uid);
    const userDoc = await getDoc(userRef);
    
    // pushToken 필드 값 가져오기 (ExponentPushToken[lw5mTFNA-GtnOzFP5WrmMU] 형식)
    const savedToken = userDoc.exists() ? userDoc.data().pushToken || null : null;
    console.log("저장된 토큰:", savedToken);

    // 토큰이 다르면 업데이트
    if (savedToken !== nowExpoPushToken) {
      console.log("토큰 업데이트 필요");
      await updateDoc(userRef, {
        pushToken: nowExpoPushToken
      });
      console.log("토큰 업데이트 완료");
    }

  } catch (e) {
    console.error("토큰 처리 중 오류:", e);
    token = `${e}`;
  }
};

export default UpdatePushToken;