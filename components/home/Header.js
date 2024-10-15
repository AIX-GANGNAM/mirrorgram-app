import { StyleSheet, TouchableOpacity, View, Text, Image } from 'react-native';
import { SparklesIcon } from "react-native-heroicons/solid";
import { HeartIcon,
	ChevronDownIcon,
	PlusCircleIcon,
	ChatBubbleOvalLeftIcon } from "react-native-heroicons/outline";



import { useNavigation } from '@react-navigation/native';

const Header = () => {
  const navigation = useNavigation();


  return(
  <>
      
   <View style={styles.container}>
    <TouchableOpacity style={{alignItems:'center',flexDirection:'row'}}>
    <Image style={styles.logo} 
	source={require('../../assets/logo/Instagram-logo.png')}
    />
    <TouchableOpacity style={{padding:5}}>
      <ChevronDownIcon color='white' size={28} />
    </TouchableOpacity>
   </TouchableOpacity>

   <View style={styles.iconContainer}>
     <TouchableOpacity style={styles.icon}>
       <PlusCircleIcon color='white' size={30} />
     </TouchableOpacity>
    <TouchableOpacity
    	onPress={() => navigation.navigate('Activity')}
    	style={styles.icon}>
       <HeartIcon color='white' size={30} />
     </TouchableOpacity>

    {/* 채팅 시작 */}
    <TouchableOpacity 
      style={styles.icon}
      onPress={() => navigation.navigate('ChatList')}
     >
       <View style={styles.unreadBadge}>
         <Text style={styles.unreadBadgeText}>92</Text>
       </View>
       <Image 
         source={require('../../assets/chat/chaticon.png')} 
         style={{width: 30, height: 30, tintColor: 'black', marginRight: 20}}
       />
     </TouchableOpacity>
   </View>
  </View>
  </>
  );
}

export default Header;


const styles = StyleSheet.create({
  container: {
   flexDirection:'row',
   justifyContent:'space-between',
   alignItems: 'center',
   marginHorizontal: 20,
   borderBottomWidth: 0.3,
   borderColor:'gray',
  },

  logo: {
   height: 50,
   width: 100,
   resizeMode:'contain',
  },
  iconContainer: {
   flexDirection: 'row',
  },
  icon: {
   padding:3,
   marginRight: 5,
  },
  unreadBadge:{
   position: 'absolute',
   backgroundColor: '#FF3250',
   borderRadius: 100,
   left: 30,
   bottom: 25,
   height: 22,
   width: 22,
   alignItems: 'center',
   justifyContent: 'center',
   zIndex: 100,
   
  },
  unreadBadgeText: {
   color:'white',
   fontWeight: '900',
   fontSize: 10,
  },
});
