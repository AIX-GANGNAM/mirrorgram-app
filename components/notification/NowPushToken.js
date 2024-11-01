import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

const NowPushToken = async () => {
  console.log("NowPushToken.js 실행");
  try {
    const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    const nowExpoPushToken = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    return nowExpoPushToken;
  } catch (error) {
    console.error("NowPushToken > 토큰 처리 중 오류:", error);
    return null;
  }
};

export default NowPushToken;