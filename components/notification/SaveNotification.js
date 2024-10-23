import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from 'firebase/auth';

const saveNotification = async (notification, type) => {
  console.log("SaveNotification.js 실행");
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    const userEmail = currentUser.email;

    if (!currentUser) {
      console.log("로그인된 사용자가 없습니다. 알림을 저장하지 않습니다.");
      return;
    }

    // 키 생성 (이메일_알림유형) ex) bhomika@gmail.com_follow, bhomika@gmail.com_heart, bhomika@gmail.com_reply
    const storageKey = `${userEmail}_${type}`; 

    // 기존 알림 목록 가져오기
    const existingNotifications = await AsyncStorage.getItem(storageKey);
    let notifications = existingNotifications ? JSON.parse(existingNotifications) : []; // 기존 알림 목록이 있으면 가져오고, 없으면 빈 배열 생성
    console.log(`기존 ${type} 알림 목록:`, notifications);

    // 새 알림 추가
    notifications.push({
      ...notification,
      timestamp: new Date().toISOString() // 타임스탬프 추가
    });
    console.log(`새 ${type} 알림 추가 후:`, notifications);

    // 최대 50개의 알림만 유지 (선택사항)
    if (notifications.length > 50) {
      notifications = notifications.slice(-50);
    }

    // 업데이트된 알림 목록 저장
    await AsyncStorage.setItem(storageKey, JSON.stringify(notifications));

    console.log(`${type} 알림이 로컬에 저장되었습니다`);
  } catch (error) {
    console.error(`${type} 알림 로컬 저장 실패:`, error);
  }
}

export default saveNotification;
