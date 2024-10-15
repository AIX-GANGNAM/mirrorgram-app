import { ScrollView, Pressable, TextInput, StyleSheet, TouchableOpacity, View, Text, Image, ToastAndroid, Modal } from 'react-native';
import { Divider } from 'react-native-elements';
import React, {useState, useEffect } from 'react';
import {getFirestore, doc, updateDoc ,collection, getDoc , addDoc} from 'firebase/firestore';
import { useSelector } from 'react-redux';
import PostHeader from '../newPost/PostHeader';
import PostImage from '../newPost/PostImage';
import Likes from '../newPost/Likes';
import Caption from '../newPost/Caption';
import CommentsPreview from '../newPost/CommentsPreview';
import CommentModal from '../newPost/CommentModal';
import PostFooter from '../newPost/PostFooter';




const Post = ({post, refreshPosts}) => {
   // post가 undefined인 경우를 처리
   if (!post) {
     return null; // 또는 로딩 인디케이터나 에러 메시지를 표시할 수 있습니다.
   }

   // post.comments가 없으면 빈 배열로 초기화
   const comments = post.comments || [];

   const [comment, setComment] = useState(false);
   const [like, setLike] = useState(false);
   const [newComment, setNewComment] = useState('');
   const [showFullCaption, setShowFullCaption] = useState(false);
   const [showCommentModal, setShowCommentModal] = useState(false);
   const [commentCount, setCommentCount] = useState(post.comments ? post.comments.length : 0);

   const user = useSelector(state => state.user.user);
   const db = getFirestore();
   const [isLiked, setIsLiked] = useState(false);
   const [likeCount, setLikeCount] = useState(0);

   useEffect(() => {
     if (Array.isArray(post.likes)) {
       setIsLiked(post.likes.includes(user.uid));
       setLikeCount(post.likes.length);
     } else {
       setIsLiked(false);
       setLikeCount(0);
     }
   }, [post.likes, user.uid]);

   const handleLike = async () => {
     try {
       const postRef = doc(db, 'feeds', post.folderId);
       let updatedLikes = Array.isArray(post.likes) ? [...post.likes] : [];

       if (isLiked) {
         updatedLikes = updatedLikes.filter(id => id !== user.uid);
       } else {
         updatedLikes.push(user.uid);
       }

       await updateDoc(postRef, { likes: updatedLikes });

       setIsLiked(!isLiked);
       setLikeCount(updatedLikes.length);
     } catch (error) {
       console.error('좋아요 처리 중 류 발생:', error);
     }
   };

   const addComment = async () => {

      console.log('newComment 확인중우우우우우', newComment);


     if (newComment.trim() !== '') {
      

       // 여기에 Firebase에 댓글을 저장하는 로직을 추가할 수 있습니다.

       const commentInfo ={
        nick: user.userId,
        content: newComment,
        profileImg: user.profileImg,
        uid: user.uid,
        createdAt: new Date().toISOString(),
        subCommentId: [],
       }

       const db = getFirestore();
       const docRef = await addDoc(collection(db, 'subcomment'), commentInfo);
       console.log('docRef', docRef.id);
       
       console.log('postadfasdf', post.folderId);
       
       const db2 = getFirestore();
       const postRef = doc(db2, 'feeds', post.folderId);

       console.log('postRef', postRef);
       const newCommentData = {
          subCommentId: docRef.id,
          nick: user.userId,
          content: newComment,
          profileImg: user.profileImg,
          uid: user.uid,
          createdAt: new Date().toISOString(),
       }
       const docSnap = await getDoc(postRef);
      if (docSnap.exists()) {
        const currentData = docSnap.data();
        const currentSubComments = currentData.subCommentId || [];
        const newSubComments = [...currentSubComments, newCommentData];

        // Firestore 업데이트
        await updateDoc(postRef, { subCommentId: newSubComments });

        // 로컬 상태 업데이트
        setComments(prevComments => [...prevComments, newCommentData]);
        setNewComment('');

        console.log('댓글이 성공적으로 추가되었습니다.');
      } else {
        console.log('문서가 존재하지 않습니다.');
      }

      
       
     }
   };

   const today = new Date();
   const postDate = new Date(post.createdAt);
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
	<PostFooter 
	  post={post} 
	  setShowCommentModal={setShowCommentModal} 
	  commentCount={commentCount} 
	  setCommentCount={setCommentCount}
	/>
	<Likes like={like} post={post} />
	<Caption post={post} showFullCaption={showFullCaption} setShowFullCaption={setShowFullCaption} />
	<CommentsPreview commentCount={commentCount} setShowCommentModal={setShowCommentModal} />
	<CommentModal visible={showCommentModal} setVisible={setShowCommentModal} newComment={newComment} setNewComment={setNewComment} addComment={addComment} post={post} setCommentCount={setCommentCount} />
	<Text style={[styles.Texts, {fontWeight:'bold',color:'gray', padding:4}]} > {timeAgo} </Text>
     </View>
   );
}
const styles = StyleSheet.create({
  container: {
    padding:3,
    marginBottom: 18,
  }, 
  Texts: {
    color:'white',
   fontWeight:'bold',
   marginLeft: 8,
  },

});




export default Post;