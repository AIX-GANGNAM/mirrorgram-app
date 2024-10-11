
import { SafeAreaView, TouchableOpacity, View, ScrollView, Text, Platform, StyleSheet} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import ThisWeek from '../components/activity/ThisWeek';
import Now from '../components/activity/Now';
import Yesterday from '../components/activity/Yesterday';
import ThisMonth from '../components/activity/ThisMonth';
import PreviousActivity from '../components/activity/Previous_activity';

import { useNavigation } from '@react-navigation/native';
import{ FriendsProfileData } from '../data/users';
import{ FollowUserData } from '../data/follow';
import{ HeartUserData } from '../data/heart';
import{ ReplyUserData } from '../data/reply';


const ActivityScreen = () => {
  const navigation = useNavigation();
  
	return(
	  <SafeAreaView style={styles.safe}>
		<View style={{height:'100%',width: '100%'}}>
		<View style={{
			flexDirection: 'row',
			justifyConternt: 'cener',
			alignItems: 'center',
			borderBottomWidth: 0.5,
			borderColor: 'gray',
		}}>
		<TouchableOpacity 
			onPress={() => navigation.goBack()}>
			<AntDesign name="arrowleft" size={24} color="black" />
		</TouchableOpacity>
		 <Text style={{
		 	color: 'black',
		 	fontSize: 20, 
		 	fontWeight: '900',
		 	borderBottomWidth:0.5,
		 	paddingLeft: 10,
			paddingVertical: 10,
		 	}}> 알림 </Text>
		 </View>
		 {/* 여기서 현재, 어제, 이번주, 이번달, 최근, 추천 리스트가 적용된다 */}
		 {/* 팔로우 요청, 좋아요, 댓글 리스트가 적용된다 */}
		 <ScrollView showsVerticalScrollIndicator={false}>
			<Now
				FriendsProfileData={FriendsProfileData}
				FollowUserData={FollowUserData}
				HeartUserData={HeartUserData}
				ReplyUserData={ReplyUserData}
				navigation={navigation} />		   
			<Yesterday
				FriendsProfileData={FriendsProfileData}
				FollowUserData={FollowUserData}
				HeartUserData={HeartUserData}
				ReplyUserData={ReplyUserData}
				navigation={navigation}/>		   
			<ThisWeek
				FriendsProfileData={FriendsProfileData}
				FollowUserData={FollowUserData}
				HeartUserData={HeartUserData}
				ReplyUserData={ReplyUserData}
				navigation={navigation}/> 
			<ThisMonth
				FriendsProfileData={FriendsProfileData}
				FollowUserData={FollowUserData}
				HeartUserData={HeartUserData}
				ReplyUserData={ReplyUserData}
				navigation={navigation}/>
			<PreviousActivity // 한 달 이후
				FriendsProfileData={FriendsProfileData}
				FollowUserData={FollowUserData}
				HeartUserData={HeartUserData}
				ReplyUserData={ReplyUserData}
				navigation={navigation}/>
		
		 </ScrollView>
		</View>
	  </SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safe:{
	 flex: 1,
	 paddingTop: Platform.OS === 'ios'? 0 : 15,
	 backgroundColor: 'white',
	 padding:12
	},
});

export default ActivityScreen;
