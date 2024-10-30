import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, View, Image, Text, Platform, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons'; // 중복 제거 완료
import { TextInput } from 'react-native';
import { getAuth, signOut } from 'firebase/auth'; // Firebase 인증 가져오기
import GetPushToken from './components/notification/GetMyPushToken';
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
import { Alert } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true ,
  }),
});

// NavigationContainer에 대한 ref 생성
const navigationRef = createNavigationContainerRef();

const App = () => {
  const Tab = createBottomTabNavigator();
  const Stack = createNativeStackNavigator();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    const initializeApp = async () => {
      registerForPushNotificationsAsync();
      await GetPushToken();
    };
    
    initializeApp();
    
    // fetchPushToken() 대신 GetPushToken 컴포넌트 사용


    // setupBackgroundTask(); 백그라운드 작업 등록 중단

    const personaImages = {
      "Disgust": "https://inabooth.io/_next/image?url=https%3A%2F%2Fd19bi7owzxc0m2.cloudfront.net%2Fprod%2Fcharacter_files%2F19dec92d-10be-4f5a-aad9-c68846c3d4b7.jpeg&w=3840&q=75",
      "Joy": "https://img1.daumcdn.net/thumb/R1280x0/?fname=http://t1.daumcdn.net/brunch/service/user/gI8/image/nl4J4OCc7QyIoC8rBK8Fn1kYVCc.jpg",
      "Sadness": "https://d3ihz389yobwks.cloudfront.net/1597427709625898634218810800.jpg",
      "Anger": "https://pds.joongang.co.kr/news/component/htmlphoto_mmdata/201506/28/htm_20150628083828504.jpg",
      "Fear": "https://img.newspim.com/news/2017/01/31/1701311632536400.jpg",
      // 다른 persona들에 대한 이미지 URL 추가
    };



    // 알림 수신 시 실행되는 함수
    notificationListener.current = Notifications.addNotificationReceivedListener(async (notification) => {
      try {
        await saveNotification(notification);
        console.log("알림 저장 성공");
      } catch (error) {
        console.error("알림 저장 중 오류 발생:", error);
      }
      console.log("알림 수신 : ", notification);
      
      const {content}  = notification.request;
      console.log("알림수신 : content : ", content);
      console.log("알림수신 : content.data.pushType : ", content.data.pushType);      
      console.log("알림수신 : content.body : ", content.body);      
      console.log("알림수신 : content.data.whoSendMessage : ", content.data.whoSendMessage);      
      console.log("알림수신 : content.data.highlightImage : ", content.data.highlightImage);      
      console.log("알림수신 : content.data.pushTime : ", content.data.pushTime);      
    });

    const defaultImage = "https://example.com/default-image.jpg";

    // 알림 클릭 시 실행되는 함수
    responseListener.current = Notifications.addNotificationResponseReceivedListener(async (response) => {

      console.log("알림 터치됨:", response);
      const persona = response.notification.request.content.title;

      console.log("persona : ", persona);

      const highlightImage = personaImages[persona] || defaultImage;

      // navigationRef가 준비되었고 persona가 존재하는 경우에만 네비게이션 실행
      if (navigationRef.isReady() && persona) {
        navigationRef.navigate('Chat', { 
          persona: persona,
          highlightTitle: persona, // 또는 다른 적절한 제목
          highlightImage: highlightImage // persona에 따른 이미지 URL
        });
      }
    });


    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
      // Notifications.unregisterTaskAsync(BACKGROUND_NOTIFICATION_TASK);
    };
  }, []);


  const MainTabs = () => {
    const auth = getAuth();

    // 로그아웃 처리 함수를 MainTabs 내부로 이동
    const handleLogout = () => {
      signOut(auth)
        .then(() => {
          Alert.alert('로그아웃 성공', '로그인 화면으로 이동합니다.');
          setIsAuthenticated(false);
        })
        .catch((error) => {
          console.error('로그아웃 에러:', error);
          Alert.alert('로그아웃 실패', '다시 시도해 주세요.');
        });
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

  return(
    <Provider store={store}>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          {!isAuthenticated ? (
            // 인증되지 않은 상태의 스크린들
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
            // 인증된 상태의 스크린들
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
              <Stack.Screen name="FriendHeader" component={FriendScreen} options={{ headerShown: false, }} />
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
              <Stack.Screen name="CreatePersona" component={CreatePersonaScreen} />
              <Stack.Screen name="Post" component={Post} />
              <Stack.Screen name="PersonaChat" component={PersonaChat} />
              <Stack.Screen name="DebateChat" component={DebateChat} />
              <Stack.Screen name="PostDetail" component={PostDetail} />
            </>
          )}
          <Stack.Screen name="PersonaProfile" component={PersonaProfile} options={{ headerShown: true }} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}

async function registerForPushNotificationsAsync() {
  console.log("registerForPushNotificationsAsync 함수 실행");

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    console.log("App.js > registerForPushNotificationsAsync > 디바이스 확인");
    console.log("실제 디바이스 인가?? : ",Device.isDevice);
    console.log("디바이스 이름 : ",Constants.deviceName);

    // 기존 푸시 알림 권한 상태를 확인
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // 기존 권한이 허용되지 않았을 경우, 권한 요청
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status; // 사용자가 선택한 권한 상태로 업데이트
    }

    // 권한이 여전히 허용되지 않았다면 알림을 띄우고 함수 종료
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!'); // 사용자에게 권한 허용이 안됐음을 알림
      return; // 함수 종료
    }
  } else {
    // 물리 디바이스가 아닌 경우, 사용자에게 알림
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

export default App;
