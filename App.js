import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, View, Image, Text, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './screens/HomeScreen';
import NewPostScreen from './screens/NewPostScreen';
import ProfileScreen from './screens/ProfileScreen';
import ReelsScreen from './screens/ReelsScreen';
import SearchScreen from './screens/SearchScreen';
import LoginScreen from './screens/LoginScreen';
import ActivityScreen from './screens/ActivityScreen';
import FriendProfileScreen from './screens/FriendProfileScreen';
import EditProfileScreen from './screens/EditProfileScreen';

import { userImg } from './components/home/Post';
import Status from './components/home/Status';
import SignupForm from './components/signup/SignupForm';
import ForgotPassword from './components/login/ForgotPassword';
import UserVerification from './components/auth/UserVerification.js';


import UserInfoStep1 from './components/auth/extra/UserInfoStep1.js';
import UserInfoStep2 from './components/auth/extra/UserInfoStep2.js';
import UserInfoStep3 from './components/auth/extra/UserInfoStep3.js';
import UserInfoStep4 from './components/auth/extra/UserInfoStep4.js';

import ChatScreen from './screens/ChatScreen';

import { Provider } from 'react-redux';
import store from './store';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true ,
  }),
});


const  App = () => {
  const Tab = createBottomTabNavigator();
  const Stack = createNativeStackNavigator();
  // const Stack = createStackNavigator();
  const [ isAuthenticated, setIsAuthenticated ] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();


  
  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (token) setExpoPushToken(token);
      console.log("토큰 값 : ", token);
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
      console.log("알림정보 : ", notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);
  

  const BottomTabScreen = () => {

  	return(
  		<Tab.Navigator
  			screenOptions={({route}) => ({
  				tabBarShowLabel: false,
				 headerShown: false,  				
  				tabBarHideOnKeyboard: true,
  				tabBarStyle: {
  					height: 50,	
  					backgroundColor: 'black'
  				},
  				
  				tabBarIcon: ({style, focused, size, color}) => {
  					let iconName;
  					if(route.name === 'Home'){
  						iconName= focused? "home-sharp" : "home-outline";
  						size= focused? size + 4 : size + 2;
  					}else if(route.name === "Search"){
  						iconName= focused? "search" : "ios-search-outline";
  						size= focused? size + 4  : size+2  ;
  					}else if(route.name === "NewPost"){
  						iconName= focused? "add-circle-outline" : "add-circle-outline";
  						size= focused? size+4  : size + 2  ;
  					}else if(route.name === "Reels"){
  						iconName= focused? "film" : "film-outline";
  						size= focused? size +4 : size+2 ;
  					}else if(route.name === "Profile"){
  						iconName= focused? "person-circle" : "person-circle-outline";
  						size= focused? size + 4 : size + 2;
  					}

  					return <Ionicons style={focused? styles.active : null} name={iconName} size={size} color={color} />;
  				}
  			})}>
  			<Tab.Screen name="Home" component={HomeScreen} />
  			<Tab.Screen name="Search" component={SearchScreen} />
  			<Tab.Screen
  				name="NewPost"
  				component={NewPostScreen}
  				options={{
  				   tabBarButton: ({ state, route, ...rest }) => {
  				 	   return (
  				   	     <TouchableOpacity
  				 	          {...rest}
  				 	           style={{
  				 	           		alignItems: 'center',
  				 		       		borderBottomWidth: rest.focused ? 5 : 0,
  				 		       		borderColor: 'skyblue',
  				 		      		 borderRadius: 50,
  				 		  		}} >
  				 		    <Ionicons name="add-circle-outline" size={50} color='white' />
  				 	     </TouchableOpacity>
  				 	     );
  				 	   },
  				 }}/>
  			<Tab.Screen name="Reels" component={ReelsScreen} />
  			<Tab.Screen
  				name="Profile"
  				component={ProfileScreen}
  				 options={{
	    			tabBarIcon: ({ color, size, focused}) => (
	     				<View style={[focused? styles.active : null,{padding:5}]}>
              				{focused?  <Image style={[styles.userCircle,{borderWidth:3,}]} source={{uri: userImg }} />
                			  : <Image style={styles.userCircle} source={{uri: userImg }} />
	     					}
	     			 	</View>
          			),
         		}}
  				/>
  		</Tab.Navigator>
  	);
  }

	return(
		<Provider store={store}>
			<NavigationContainer>
        <Text>Expo Push Token: {expoPushToken}</Text>
				<Stack.Navigator
					screenOptions={{
						headerShown: false,
					}}
				>
					{!isAuthenticated ? (
						<Stack.Screen name="Login">
							{props => <LoginScreen {...props} isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />}
						</Stack.Screen>
					) : (
						<>
							<Stack.Screen name="BottomTab" component={BottomTabScreen} />
							<Stack.Screen name="Activity" component={ActivityScreen} />
							<Stack.Screen name="FriendProfile" component={FriendProfileScreen} />
							<Stack.Screen name="Status" component={Status} />
							<Stack.Screen name="EditProfile" component={EditProfileScreen} />
						</>
					)}
					<Stack.Screen name="Signup" component={SignupForm} />
					<Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ title: '비밀번호 찾기' }} />
					<Stack.Screen name="UserVerification" component={UserVerification} options={{ headerShown: false }} />
				</Stack.Navigator>
			</NavigationContainer>
		</Provider>
	);
}

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Provider store={store}>
      <NavigationContainer>
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
              <Stack.Screen name="UserVerificationStep1" component={UserVerificationStep1} options={{ headerShown: false }} />
              <Stack.Screen name="UserVerificationStep2" component={UserVerificationStep2} options={{ headerShown: false }} />
              <Stack.Screen name="UserVerificationStep3" component={UserVerificationStep3} options={{ headerShown: false }} />
              <Stack.Screen name="UserVerificationStep4" component={UserVerificationStep4} options={{ headerShown: false }} />
              <Stack.Screen name="UserVerificationSummary">
                {props => <UserVerificationSummary {...props} setIsAuthenticated={setIsAuthenticated} />}
              </Stack.Screen>
            </>
          ) : (
            <>
              <Stack.Screen name="BottomTab" component={BottomTabScreen} />
              <Stack.Screen name="Activity" component={ActivityScreen} />
              <Stack.Screen name="FriendProfile" component={FriendProfileScreen} />
              <Stack.Screen name="Status" component={Status} />
              <Stack.Screen name="EditProfile" component={EditProfileScreen} />
              <Stack.Screen name="Chat" component={ChatScreen} />
              <Stack.Screen name="UserInfoStep1" component={UserInfoStep1} />
              <Stack.Screen name="UserInfoStep2" component={UserInfoStep2} />
              <Stack.Screen name="UserInfoStep3" component={UserInfoStep3} />
              <Stack.Screen name="UserInfoStep4" component={UserInfoStep4} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );

// 여기서 부터 expo 알림 설정 ----------------------------------------


async function registerForPushNotificationsAsync() {
  console.log("registerForPushNotificationsAsync 함수 실행");
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    console.log("Device.isDevice : ", Device.isDevice);
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    // Learn more about projectId:
    // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
    // EAS projectId is used here.
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        console.log("프로젝트ID : ", projectId);
      if (!projectId) {
        throw new Error('Project ID not found');
      }
      console.log("토큰 값 출력 시작");
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
    } catch (e) {
      token = `${e}`;
    }
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;

}
//   여기까지 expo 알림 설정 ----------------------------------------

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