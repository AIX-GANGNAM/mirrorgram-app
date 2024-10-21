import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from 'firebase/auth';

const saveNotification = async (notification) => {
  console.log("SaveNotification.js 실행");
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    const userEmail = currentUser.email;

    if (!currentUser) {
      console.log("로그인된 사용자가 없습니다. 알림을 저장하지 않습니다.");
      return;
    }


    // 기존 알림 목록 가져오기
    const existingNotifications = await AsyncStorage.getItem(userEmail); // 현재 로그인 사람의 폴더이름?? 으로 JSON파일 가져온다
    let notifications = existingNotifications ? JSON.parse(existingNotifications) : [];
    console.log("기존 알림 목록 : ", notifications);

    // 새 알림 추가
    notifications.push({
        notification
      });
      console.log("새 알림 추가 후 : ", notifications);
  

    // 최대 50개의 알림만 유지 (선택사항)
    if (notifications.length > 50) {
      notifications = notifications.slice(-50);
    }

    // 업데이트된 알림 목록 저장
    await AsyncStorage.setItem(userEmail, JSON.stringify(notifications));

    console.log("알림이 로컬에 저장되었습니다");
  } catch (error) {
    console.error("알림 로컬 저장 실패:", error);
  }
}

export default saveNotification;