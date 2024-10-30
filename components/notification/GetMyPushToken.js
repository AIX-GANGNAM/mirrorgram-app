import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth } from 'firebase/auth';
import { db } from 'firebase/firestore';

const GetPushToken = async () => {
  console.log("GetPushToken.js 실행");
  let token;
  
  try {
    // 현재 토큰 가져오기
    const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    if (!projectId) {
      throw new Error('Project ID not found');
    }
    
    // Expo 푸시 토큰을 가져와서 형식 맞추기
    const expoPushToken = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    token = `ExponentPushToken[${expoPushToken.split('[')[1]}`; // 형식 맞추기
    console.log("현재 토큰:", token);

    // Firebase에서 저장된 토큰 가져오기
    const userRef = doc(db, 'users', auth.currentUser.uid);
    const userDoc = await getDoc(userRef);
    const savedToken = userDoc.data()?.pushToken;
    console.log("저장된 토큰:", savedToken);

    // 토큰이 다르면 업데이트
    if (savedToken !== token) {
      console.log("토큰 업데이트 필요");
      await updateDoc(userRef, {
        pushToken: token
      });
      console.log("토큰 업데이트 완료");
    }

  } catch (e) {
    console.error("토큰 처리 중 오류:", e);
    token = `${e}`;
  }
};

export default GetPushToken;
