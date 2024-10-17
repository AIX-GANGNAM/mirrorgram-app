import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from 'firebase/auth';

const GetPushToken = async () => {
  console.log("GetPushToken.js 실행");
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    const userEmail = currentUser.email;
    console.log("userEmail : ", userEmail);

    if (!currentUser) {
      console.log("로그인된 사용자가 없습니다.");
      return null;
    }
    const notifications = await AsyncStorage.getItem(userEmail);
    console.log("알림 정보 가져오기 완료");

    if (notifications) {
      const parsedNotifications = JSON.parse(notifications);
      console.log("LoadNotification > parsedNotifications : ", parsedNotifications);
      return parsedNotifications;
    } else {
        console.log("LoadNotification > 알림 정보 없음");
      return null;
    }
  } catch (e) {
    console.log("알림 정보 가져오기 실패:", e);
    return null;
  }
};

export default GetPushToken;
