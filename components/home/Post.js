import { ScrollView, Pressable, TextInput, StyleSheet, TouchableOpacity, View, Text, Image, ToastAndroid, } from 'react-native';
import { Divider } from 'react-native-elements';
import { HeartIcon as FillHeartIcon, BookmarkIcon as FilledBookmarkIcon, EllipsisVerticalIcon, CheckBadgeIcon } from 'react-native-heroicons/solid';
import { HeartIcon, BookmarkIcon, ChatBubbleOvalLeftIcon, PaperAirplaneIcon, } from 'react-native-heroicons/outline';
import React, {useState, } from 'react';
import ImageViewer from 'react-native-image-zoom-viewer';
import {getFirestore, doc, updateDoc} from 'firebase/firestore';


const Post = ({post}) => {
   const [comment, setComment] = useState(false);
   const [like, setLike] = useState(false);

   const today = new Date();
   const postDate = new Date(post.createdAt.seconds * 1000 + post.createdAt.nanoseconds / 1000000);
   const diffTime = Math.abs(today.getTime() - postDate.getTime());
   const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
   const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

   let timeAgo;
   if (diffDays === 0) {
     if (diffHours === 0) {
       timeAgo = '방금 전';
     } else {
       timeAgo = `${diffHours}시간 전`;
     }
   } else if (diffDays === 1) {
     timeAgo = '어제';
   } else {
     timeAgo = `${diffDays}일 전`;
   }

   return(
     <View style={styles.container}>
	<Divider width={1} orientation='vertical'/>
	<PostHeader post={post} />
	<ScrollView>
	  <PostImage post={post} />
	</ScrollView>
	<PostFooter like={like} setLike={setLike} comment={comment} setComment={setComment} post={post} />
	<Likes like={like}  post={post} />
	<Caption post={post} />
	<Comments post={post.comments} />
	{ comment &&
 	<PostComment  />
	}
	<Text style={[styles.Texts, {fontWeight:'bold',color:'gray', padding:4}]} > {timeAgo} </Text>
     </View>
   );
}


const PostHeader = ({post}) => {

   return(
   
     <View style={styles.header}>
      <View style={{flexDirection:'row',marginTop:3,}}>
       <TouchableOpacity>
	  <Image
	    style={styles.image}
	    source={post.profileImg ? {uri: post.profileImg} : require('../../assets/no-profile.png')} />
       	</TouchableOpacity>
	<View style={{marginLeft: 1,}}>
 	 <View style={{flexDirection:'row', alignItems: 'center'}}>
	  <Text style={styles.user} > {post.nick } </Text>
	      {post.followers >= 700 ?
	       	<Text style={{paddingBottom: -8}}>
	          <CheckBadgeIcon color='blue' size={20} />
		</Text>
	       : null}
	  </View>
	  <Text style={{color:'gray', fontSize:13, fontWeight:'bold'}} > Followers {post.followers} </Text>
	</View>
      </View>
       <TouchableOpacity>
	 <EllipsisVerticalIcon color='black' size={30} />
       </TouchableOpacity>
     </View>
   );
}


const PostImage = ({post}) => {
//        <Image style={styles.postImg} source={{uri: post.imageUrl}} />
//       <ImageViewer style={styles.postImg} imageUrls={post.postImg} />

  return(
   <Pressable style={{marginHorizontal: 8, padding:5}}>
        <Image style={styles.postImg} 
        source={post.image ? {uri: post.image} : require('../../assets/no-image.png')} />
    </Pressable>
  );
}



const PostFooter = ({post, like, setLike, comment, setComment}) => {
  const [bookmark, setBookmark] = useState(false);
  const db = getFirestore();

  const bookmarkBtn = () => {
  		const message = bookmark ? 'Bookmark removed' : 'Bookmark added succesfully';
  		setBookmark(!bookmark);
  		ToastAndroid.showWithGravityAndOffset(
  		      message,
  		      ToastAndroid.LONG,
  		      ToastAndroid.CENTER,
  		      25,
  		      50,
  	   );
  }

  const likepress = async () => {
    const postDoc = doc(db, 'feeds', post.id);

    try{
      if(like){
        setLike(false);
        post.likes = post.likes - 1;
      }else{
        setLike(true);
        post.likes = post.likes + 1;
      }
    }catch(error){
      console.log(error);
    }
  }
  return(
   <View style={styles.postFooter}>
   <View style={styles.postIcon}>
    <TouchableOpacity
	onPress={() => likepress()}
	style={styles.icon} >
     {!like?
      <HeartIcon color='black' size={35} />
      :
       <FillHeartIcon color='red' size={35} />
      }
    </TouchableOpacity>
    <TouchableOpacity
	onPress={() => setComment(!comment)}
        style={styles.icon} >
      <ChatBubbleOvalLeftIcon color='black' size={35} />
    </TouchableOpacity>
    <TouchableOpacity style={styles.icon} >
      <PaperAirplaneIcon
	color='black'
	size={35}
	style={{transform: [{rotate: '-45deg'}],marginTop:-10}} />
    </TouchableOpacity>
   </View>
   <TouchableOpacity
	onPress={bookmarkBtn}
	
	style={{marginRight: 20, padding: 5,}}>
     {bookmark === true? <FilledBookmarkIcon color='lightblue' size={35} />
                       : <BookmarkIcon color='black' size={35} />
      }
    </TouchableOpacity>
   </View>
  );
}

const Likes = ({post ,like}) => {
	
   return(
    <View style={styles.likes}>
      <Text style={[styles.Texts,{opacity: 0.9}]}> Like by  {like? 'you and ': null} 
      		{like?  post.likes+1 : post.likes } {post.likes > 1?'others': 'person' }</Text>
    </View>
   );
}

const Caption = ({post}) => {

   return(
    <View style={{marginLeft: 12}}>
      <Text style={{color:'black'}} >
        <Text style={{fontWeight:'600'}} > {post.nick}  </Text>
        <Text > {post.caption} </Text>
      </Text>
    </View>
   );
}

const Comments = ({post}) => {
  const [comLikes, setComLikes] = useState(post.map(() =>false));

  const handleLike = (index) => {
    const newLikes = [...comLikes];
    newLikes[index] = !newLikes[index];
    setComLikes(newLikes);
  };

   return(
   <>
   {post.length >= 1 ?
   <Text style={{color:'gray', padding:4,marginLeft:12}}>
        View {post.length > 1? 'all' : '' } { post.length } { post.length > 1? 'comments' : 'comment'}
    </Text>
    : null
   }
   {post.map((comment, index) => (
    <View key={index} style={styles.comHeader}>
     <View style={{flexDirection:'row', alignItems: 'center', width: '90%'}}>
       <Text style={[styles.Texts, {color: 'gray',fontWeight:'600', fontSize:16,}]} >{comment.user} </Text>
       <Text style={[styles.Texts,{width: '88%'}]} >{comment.comment} </Text>
     </View>
     <TouchableOpacity style={{padding:5}} onPress={() => handleLike(index)}>
     {comLikes[index]?
      <>
       <FillHeartIcon color='red' size={26} />
        <Text style={{
        		position: 'absolute',
        		color: '#fff',
        		bottom: -5,
        		left: comment.likes >=10? 10 : 13,
        		fontSize: 12,
        		fontWeight: '900'
        		}}>{comment.likes + 1}</Text>
        </>
  	  : <>
        <HeartIcon color='white' size={25} />
         <Text style={{
        		position: 'absolute',
        		color: '#fff',
        		bottom: -5,
        		left: comment.likes >=10? 10 : 13,
        		fontSize: 12,
        		fontWeight: '900',
        		}}>{comment.likes}</Text>
        </>
      }
     </TouchableOpacity>
    </View>
    ))}
    </>
   );
}

const PostComment = () => {

   return(
   <>
   <TouchableOpacity style={styles.comInput}>
      <Image
          source={{uri: userImg}}
          style={[styles.image, {marginRight:3, width: 25,height: 25,}]}/>
        <TextInput
        	placeholder='Add a comments...'
        	placeholderTextColor='gray'
        	style={{flexDirection:'row', width: '88%', color:'#fff', }} />
     </TouchableOpacity>
   </>
   );
}

const styles = StyleSheet.create({
  container: {
    padding:3,
    marginBottom: 18,
  },
  header: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   margin: 5,
   alignItems: 'center',
  },
  image: {
    height: 38,
    width: 38,
    borderRadius: 50,
    padding: 2,
    marginLeft: 8,
    borderWidth: 2,
    borderColor:'#FF8501',
  },
  user:{
   color: 'white',
   fontWeight:'bold',
   fontSize: 16,
  },
  postImg: {
   resizeMode: 'cover',
   height: 300,
   width: '100%',
   borderRadius: 10,
  },
  postFooter: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   paddingTop: 3,
  },
  postIcon: {
   flexDirection: 'row',
   justifyContent:'center',
   alignItems: 'center',
  },
  icon:{
   marginLeft: 10,
   padding: 5,
  },
  likes: {
   padding:3,
   
  },
  Texts:{
   color:'white',
   fontWeight:'bold',
   marginLeft: 8,
  },
  comHeader: {
   flexDirection: 'row',
   justifyContent:'space-between',
   marginHorizontal:6,
   paddingTop: 2,
   width: '100%',
  },
  comInput: {
   flexDirection:'row',
    marginTop:5,
    borderWidth:1,
    borderColor: 'gray',
    borderRadius: 50,
    padding:5,
    // width: '75%',
    backgroundColor:'rgba(52,52,52,0.6)',
    marginHorizontal: 5,
  },
});


export default Post;
