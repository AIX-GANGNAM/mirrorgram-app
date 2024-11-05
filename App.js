import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, View, Image, Text, Platform, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { TextInput } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import saveNotification from './components/notification/SaveNotification';
import { setupBackgroundTask } from './components/notification/BackgroundTask';
import PersonaChat from './components/chat/PersonaChat';
import { createNavigationContainerRef } from '@react-navigation/native';
import ReelsScreen from './screens/ReelsScreen';
import PostDetail from './components/post/PostDetail';
import HomeScreen from './screens/HomeScreen';
import NewPostScreen from './screens/NewPostScreen';
import ProfileScreen from './screens/ProfileScreen';
import CreatePersonaScreen from './screens/CreatePersonaScreen';
import CalenderScreen from './screens/CalenderScreen';
import LoginScreen from './screens/LoginScreen';
import ActivityScreen from './screens/ActivityScreen';
import FriendProfileScreen from './screens/FriendProfileScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import ChatScreen from './screens/ChatScreen';
import ChatListScreen from './screens/ChatListScreen';
import ChatUserScreen from './screens/ChatUserScreen';
import Post from './components/home/Post';
import FriendScreen from './screens/FriendScreen';
import { userImg } from './components/home/Post';
import Status from './components/home/Status';
import SignupForm from './components/signup/SignupForm';
import ForgotPassword from './components/login/ForgotPassword';
import UserVerification from './components/auth/UserVerification.js';
import NewChat from './components/chat/NewChat';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { setUser } from './store/slice/userSlice';
import UserVerificationStep0 from './components/auth/UserVerificationStep0';
import UserVerificationStep1 from './components/auth/UserVerificationStep1.js';
import UserVerificationStep2 from './components/auth/UserVerificationStep2.js';
import UserVerificationStep3 from './components/auth/UserVerificationStep3.js';
import UserVerificationStep4 from './components/auth/UserVerificationStep4.js';
import UserVerificationSummary from './components/auth/UserVerificationSummary.js';
import UserInfoStep1 from './components/auth/extra/UserInfoStep1.js';
import UserInfoStep2 from './components/auth/extra/UserInfoStep2.js';
import UserInfoStep3 from './components/auth/extra/UserInfoStep3.js';
import UserInfoStep4 from './components/auth/extra/UserInfoStep4.js';
import FriendRequests from './components/friend/FriendRequests';
import DebateChat from './screens/DebateChat';
import PersonaProfile from './components/persona/PersonaProfile';
import { Provider } from 'react-redux';
import store from './store';
import GoToScreen from './components/notification/GoToScreen';
import CreatePersonaPostScreen from './screens/CreatePersonaPostScreen';
import { serverTimestamp, getDoc, updateDoc } from 'firebase/firestore';
import { doc, collection } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { navigationRef } from './utils/navigationRef';
import NowPushToken from './components/notification/NowPushToken';
import UpdatePushToken from './components/notification/UpdatePushToken';
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const AppWrapper = () => {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
};

const App = () => {
  const dispatch = useDispatch();
  const Tab = createBottomTabNavigator();
  const Stack = createNativeStackNavigator();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    const checkAutoLogin = async () => {
      try {
        const autoLogin = await AsyncStorage.getItem('autoLogin');
        const userToken = await AsyncStorage.getItem('userToken');
        const userData = await AsyncStorage.getItem('userData');

        if (autoLogin === 'true' && userToken && userData) {
          const parsedUserData = JSON.parse(userData);
          dispatch(setUser(parsedUserData));
          setIsAuthenticated(true);
          UpdatePushToken(userToken);
          NowPushToken();
        }
      } catch (error) {
        console.error('자동 로그인 체크 중 오류 발생:', error);
      }
    };

    checkAutoLogin();
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      registerForPushNotificationsAsync();
      NowPushToken();
    };
    
    initializeApp();

    notificationListener.current = Notifications.addNotificationReceivedListener(async (notification) => {
      try {
        await saveNotification(notification);
        console.log("알림 저장 성공");
        console.log("알림 수신 : ", notification);
      
        const {content}  = notification.request;
        console.log("알림수신 : content : ", content);
        console.log("알림수신 : content.data.screenType : ", content.data.screenType);   
        console.log("알림수신 : content.data.targetUserUid : ", content.data.targetUserUid);
        console.log("알림수신 : content.data.URL : ", content.data.URL);
        console.log("알림수신 : content.data.fromUid : ", content.data.fromUid);
        console.log("알림수신 : content.body : ", content.body);      
        console.log("알림수신 : content.data.whoSendMessage : ", content.data.whoSendMessage);      
        console.log("알림수신 : content.data.highlightImage : ", content.data.highlightImage);      
        console.log("알림수신 : content.data.pushTime : ", content.data.pushTime);      
      } catch (error) {
        console.error("알림 저장 중 오류 발생:", error);
      }
    });

    // 알림 클릭 시 실행되는 함수
    responseListener.current = Notifications.addNotificationResponseReceivedListener(async (response) => {
      const { content } = response.notification.request;
      GoToScreen({response: content});
    });

   
      const auth = getAuth();
      if (auth.currentUser) {
        const updateActivity = async () => {
          try {
            const userRef = doc(db, 'users', auth.currentUser.uid);
            const userDoc = await getDoc(userRef); // userDoc을 가져옵니다.
            const userData = userDoc.data(); // Firestore에서 현재 userData를 가져옵니다.
            
            const timestamp = serverTimestamp();
            
            await updateDoc(userRef, {
              lastActivity: timestamp
            });
          
          
          dispatch(setUser({
            ...userData,
            lastActivity: Date.now()
          }));
        } catch (error) {
          // console.error('활동 상태 업데이트 실패:', error);
        }
      };
      // 1분마다 활동 시간 업데이트
      const activityInterval = setInterval(updateActivity, 60000);
      //초기 활동 시간 설정
      updateActivity();


            // 클린업에 interval 정리 추가

      return () => {
        clearInterval(activityInterval);
        Notifications.removeNotificationSubscription(notificationListener.current);
        Notifications.removeNotificationSubscription(responseListener.current);
      };
    }
  }, []);
// 로그아웃 처리 함수를 MainTabs 내부로 이동
  const MainTabs = () => {
    const auth = getAuth();
    
    const handleLogout = async () => {
      try {
        await signOut(auth);
        await AsyncStorage.multiRemove([
          'autoLogin',
          'userToken',
          'userData'
        ]);
        Alert.alert('로그아웃 성공', '로그인 화면으로 이동합니다.');
        setIsAuthenticated(false);
      } catch (error) {
        console.error('로그아웃 에러:', error);
        Alert.alert('로그아웃 실패', '다시 시도해 주세요.');
      }
    };

    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Calender') {
              iconName = focused ? 'calendar' : 'calendar-outline';
            } else if (route.name === 'NewPost') {
              iconName = focused ? 'add-circle' : 'add-circle-outline';
            } else if (route.name === 'PlayGround') {
              iconName = focused ? 'body' : 'body-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#5271ff',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Calender" component={CalenderScreen} />
        <Tab.Screen name="NewPost" component={NewPostScreen} />
        <Tab.Screen name="PlayGround" component={ReelsScreen} />
        <Tab.Screen name="Profile">
          {props => (
            <ProfileScreen 
              {...props} 
              setIsAuthenticated={setIsAuthenticated} 
              handleLogout={handleLogout}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>
    );
  };

  const BottomTabScreen = () => {
    return (
      <Stack.Navigator>
        <Stack.Screen 
          name="MainTabs" 
          component={MainTabs} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="FriendProfile" 
          component={FriendProfileScreen}
          options={({ route }) => ({
            title: route.params.userName,
            headerShown: true
          })}
        />
      </Stack.Navigator>
    );
  };

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login">
              {props => <LoginScreen {...props} isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />}
            </Stack.Screen>
            <Stack.Screen name="Signup" component={SignupForm} />
            <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ title: '비밀번호 찾기' }} />
            <Stack.Screen name="UserVerification" component={UserVerification} />
            <Stack.Screen name="UserVerificationStep0" component={UserVerificationStep0} />
            <Stack.Screen name="UserVerificationStep1" component={UserVerificationStep1} />
            <Stack.Screen name="UserVerificationStep2" component={UserVerificationStep2} />
            <Stack.Screen name="UserVerificationStep3" component={UserVerificationStep3} />
            <Stack.Screen name="UserVerificationStep4" component={UserVerificationStep4} />
            <Stack.Screen name="UserVerificationSummary">
              {props => <UserVerificationSummary {...props} setIsAuthenticated={setIsAuthenticated} />}
            </Stack.Screen>
          </>
        ) : (
          <>
            <Stack.Screen name="BottomTab" component={BottomTabScreen} />
            <Stack.Screen name="Activity" component={ActivityScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen
              name="FriendProfile"
              component={FriendProfileScreen}
              options={({ route }) => ({
                title: route.params.name,
                headerShown: true
              })}
            />
            <Stack.Screen name="FriendRequests" component={FriendRequests} options={{ title: "친구 요청" }} />
            <Stack.Screen name="FriendHeader" component={FriendScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Status" component={Status} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="UserInfoStep1" component={UserInfoStep1} />
            <Stack.Screen name="UserInfoStep2" component={UserInfoStep2} />
            <Stack.Screen name="UserInfoStep3" component={UserInfoStep3} />
            <Stack.Screen name="UserInfoStep4" component={UserInfoStep4} />
            <Stack.Screen
              name="ChatList"
              component={ChatListScreen}
              options={{
                headerShown: true,
              }}
            />
            <Stack.Screen
              name="ChatUser"
              component={ChatUserScreen}
              options={{
                headerShown: false
              }}
            />
            <Stack.Screen name="NewChat" component={NewChat} options={{ headerShown: false }} />
            <Stack.Screen name="CreatePersona" component={CreatePersonaScreen} />
            <Stack.Screen name="Post" component={Post} />
            <Stack.Screen name="PersonaChat" component={PersonaChat} />
            <Stack.Screen name="DebateChat" component={DebateChat} />
            <Stack.Screen name="PostDetail" component={PostDetail} />
          </>
        )}
        <Stack.Screen name="PersonaProfile" component={PersonaProfile} options={{ headerShown: true }} />
        <Stack.Screen 
          name="CreatePersonaPost" 
          component={CreatePersonaPostScreen}
          options={{
            headerShown: true,
            title: '페르소나 피드 자동 생성',
            headerTitleAlign: 'center',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

async function registerForPushNotificationsAsync() {
  console.log("registerForPushNotificationsAsync 함수 실행");

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('channel_high', {
            // 알림 및 진동이 울림, 화면에 표시됨, 
      name: 'channel_high',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      enableLights: true,
      enableVibrate: true,
      showBadge: true,
      sound: 'default'
    });

    await Notifications.setNotificationChannelAsync('channel_low', {
            // 알림 및 진동이 울리지 않음

      name: 'channel_low',
      importance: Notifications.AndroidImportance.LOW,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      enableLights: true,
      enableVibrate: true,
      showBadge: true,
      sound: 'default'
    });
  }

  if (Device.isDevice) {
    console.log("App.js > registerForPushNotificationsAsync > 디바이스 확인");
    console.log("실제 디바이스 인가?? : ",Device.isDevice);
    console.log("디바이스 이름 : ",Constants.deviceName);


    // 기존 푸시 알림 권한 상태를 확인
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

       // 권한이 여전히 허용되지 않았다면 알림을 띄우고 함수 종료

    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
  } else {
    alert('실제 단말기를 사용해주세요');
  }
}
const styles = StyleSheet.create({
  debugContainer: {
    top: 1,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
    zIndex: 1000,
  },
  active: {
    borderBottomWidth: 3,
    borderColor: '#00ccbb',
    borderRadius: 10,
    padding: 5,
  },
  userCircle: {
    height: 30,
    width: 30,
    padding: 5,
    marginTop: 3,
    borderRadius: 50,
    borderColor: '#00ccbb',
  },
});
export default AppWrapper;