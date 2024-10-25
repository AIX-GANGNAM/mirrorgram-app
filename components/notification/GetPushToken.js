import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

const GetPushToken = async () => {
  console.log("GetPushToken.js 실행");
  let token;
  try {
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    if (!projectId) {
      throw new Error('Project ID not found');
    }
    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId,
      })
    ).data;
    console.log("GetPushToken > token : ", token);
  } catch (e) {
    token = `${e}`;
  }

};

export default GetPushToken;
