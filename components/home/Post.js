import { ScrollView, Pressable, TextInput, StyleSheet, TouchableOpacity, View, Text, Image, ToastAndroid, Modal, Platform } from 'react-native';
import { Divider } from 'react-native-elements';
import { HeartIcon as FillHeartIcon, BookmarkIcon as FilledBookmarkIcon, EllipsisVerticalIcon, CheckBadgeIcon, XMarkIcon } from 'react-native-heroicons/solid';
import { HeartIcon, BookmarkIcon, ChatBubbleOvalLeftIcon, PaperAirplaneIcon, } from 'react-native-heroicons/outline';
import React, {useState, useEffect } from 'react';
import ImageViewer from 'react-native-image-zoom-viewer';
import {getFirestore, doc, updateDoc ,collection, query, where, getDocs, orderBy, getDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import {  PencilIcon, TrashIcon } from 'react-native-heroicons/outline';
import { useSelector } from 'react-redux';




const Post = ({post: initialPost}) => {
   const [post, setPost] = useState(initialPost);
   const [comment, setComment] = useState(false);
   const [like, setLike] = useState(false);
   const [comments, setComments] = useState(post.comments || []);
   const [newComment, setNewComment] = useState('');
   const [showFullCaption, setShowFullCaption] = useState(false);
   const [showCommentModal, setShowCommentModal] = useState(false);

   const addComment = () => {
     if (newComment.trim() !== '') {
       const updatedComments = [...comments, { user: 'CurrentUser', comment: newComment, likes: 0 }];
       setComments(updatedComments);
       setNewComment('');

       // 여기에 Firebase에 댓글을 저장하는 로직을 추가할 수 있습니다.
       
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
	<PostFooter like={like} setLike={setLike} comment={comment} setComment={setComment} post={post} setPost={setPost} setShowCommentModal={setShowCommentModal} />
	<Likes like={like}  post={post} />
	<Caption post={post} showFullCaption={showFullCaption} setShowFullCaption={setShowFullCaption} />
	<CommentsPreview comments={comments} setShowCommentModal={setShowCommentModal} />
	<CommentModal visible={showCommentModal} setVisible={setShowCommentModal} comments={comments} setComments={setComments} newComment={newComment} setNewComment={setNewComment} addComment={addComment} post={post} />
	{ comment &&
 	<PostComment
  newComment={newComment}
  setNewComment={setNewComment}
  addComment={addComment}
/>
	}
	<Text style={[styles.Texts, {fontWeight:'bold',color:'gray', padding:4}]} > {timeAgo} </Text>
     </View>
   );
}


const PostHeader = ({post, onEdit, onDelete}) => {
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [profileImg, setProfileImg] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = post.userId;
      const db = getFirestore();
      const postDoc = doc(db, 'users', user);
      try {
        const docSnap = await getDoc(postDoc);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setProfileImg(userData.profileImg);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [post.userId]);

  const handleEdit = () => {
    setShowOptionsModal(false);
    onEdit(post);
  };

  const handleDelete = () => {
    setShowOptionsModal(false);
    onDelete(post);
  };
  
  return(
    <View style={styles.header}>
      <View style={{flexDirection:'row',marginTop:3,}}>
        <TouchableOpacity>
          <Image
            style={styles.image}
            source={profileImg ? {uri: profileImg} : require('../../assets/no-profile.png')} />
        </TouchableOpacity>

        <View style={{flexDirection:'row', alignItems: 'center' }}>
          <Text style={styles.user}> {post.nick} </Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => setShowOptionsModal(true)}>
        <EllipsisVerticalIcon color='black' size={30} />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showOptionsModal}
        onRequestClose={() => setShowOptionsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalOption} onPress={handleEdit}>
              <PencilIcon color='#0095F6' size={24} />
              <Text style={[styles.modalOptionText, {color: '#0095F6'}]}>피드 수정</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={handleDelete}>
              <TrashIcon color='red' size={24} />
              <Text style={[styles.modalOptionText, {color: 'red'}]}>피드 삭제</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={() => setShowOptionsModal(false)}>
              <XMarkIcon color='black' size={24} />
              <Text style={styles.modalOptionText}>뒤로가기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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



const PostFooter = ({post, setPost, comment, setComment, setShowCommentModal}) => {
  const [localLikes, setLocalLikes] = useState(post.likes || []);
  const db = getFirestore();
  const user = useSelector(state => state.user.user);

  useEffect(() => {
    const postDoc = doc(db, 'feeds', post.folderId);
    const unsubscribe = onSnapshot(postDoc, (doc) => {
      if (doc.exists()) {
        const updatedPost = { ...post, ...doc.data() };
        setPost(updatedPost);
        setLocalLikes(updatedPost.likes || []);
      }
    });

    return () => unsubscribe();
  }, [post.folderId, setPost]);

  const likepress = async () => {
    const postDoc = doc(db, 'feeds', post.folderId);

    try {
      if (localLikes.includes(user.uid)) {
        // 좋아요 취소
        await updateDoc(postDoc, {
          likes: arrayRemove(user.uid)
        });
      } else {
        // 좋아요 추가
        await updateDoc(postDoc, {
          likes: arrayUnion(user.uid)
        });
      }
    } catch (error) {
      console.log('좋아요 업데이트 오류:', error);
    }
  }

  return (
    <View>
      <View style={styles.postFooter}>
        <View style={styles.postIcon}>
          <TouchableOpacity onPress={likepress} style={styles.icon}>
            {localLikes.includes(user.uid) ? <FillHeartIcon color='red' size={28} /> : <HeartIcon color='black' size={28} />}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowCommentModal(true)} style={styles.icon}>
            <ChatBubbleOvalLeftIcon color='black' size={28} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.icon}>
            <PaperAirplaneIcon color='black' size={28} style={{transform: [{rotate: '-45deg'}], marginTop: -5}} />
          </TouchableOpacity>
        </View>
        <View style={styles.likeSection}>
          <Text style={styles.likeText}>좋아요 {localLikes.length}개</Text>
        </View>
      </View>
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

const Caption = ({post, showFullCaption, setShowFullCaption}) => {
   const maxLength = 100;
   const isLongCaption = post.caption.length > maxLength;

   return(
    <View style={{marginLeft: 12, marginBottom: 5}}>
      <Text style={{color:'black'}}>
        <Text style={{fontWeight:'800' , fontSize: 16}}>{post.nick} </Text>
        <Text>
          {showFullCaption ? post.caption : post.caption.slice(0, maxLength)}
          {isLongCaption && !showFullCaption && '... '}
        </Text>
      </Text>
      {isLongCaption && (
        <TouchableOpacity onPress={() => setShowFullCaption(!showFullCaption)}>
          <Text style={{color: 'gray', marginTop: 2}}>
            {showFullCaption ? '접기' : '더 보기'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
   );
}

const CommentsPreview = ({comments, setShowCommentModal}) => {
  return (
    <View style={styles.commentsPreview}>
      {comments.length > 0 && (
        <TouchableOpacity onPress={() => setShowCommentModal(true)}>
          <Text style={styles.viewAllComments}>
            {comments.length === 1 ? '1개의 댓글 보기' : `${comments.length}개의 댓글 모두 보기`}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const CommentModal = ({visible, setVisible, comments, setComments, newComment, setNewComment, addComment, post}) => {
  const user = useSelector(state => state.user.user);

  

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={() => setVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setVisible(false)}>
            <XMarkIcon color='black' size={24} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>댓글</Text>
          <View style={{width: 24}} />
        </View>
        <ScrollView style={styles.commentsList}>
          {comments.map((comment, index) => (
            <View key={index} style={styles.commentItem}>
              <Image
                style={styles.commentAvatar}
                source={user.profileImg ? {uri: user.profileImg} : require('../../assets/no-profile.png')}
              />
              <View style={styles.commentContent}>
                <Text style={styles.commentUser}>{comment.user}</Text>
                <Text style={styles.commentText}>{comment.comment}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
        <View style={styles.commentInputContainer}>
          <Image
            style={styles.commentAvatar}
            source={user.profileImg ? {uri: user.profileImg} : require('../../assets/no-profile.png')}
          />
          <TextInput
            style={styles.commentInput}
            placeholder="댓글 추가..."
            value={newComment}
            onChangeText={setNewComment}
            onSubmitEditing={addComment}
          />
          <TouchableOpacity onPress={addComment}>
            <Text style={styles.postButton}>게시</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
  },
  user:{
   color: 'black',
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
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  postIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 15,
  },
  likeSection: {
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  likeText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: 'black',
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
  loadMoreButton: {
    alignItems: 'center',
    padding: 10,
  },
  loadMoreText: {
    color: 'gray',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    paddingTop: Platform.OS==='ios'? 50 : 0,
    paddingBottom : 20,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  commentsList: {
    flex: 1,
  },
  commentItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
  },
  commentUser: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  commentText: {
    color: '#262626',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
  postButton: {
    color: '#0095F6',
    fontWeight: 'bold',
  },
  commentsPreview: {
    padding: 10,
  },
  viewAllComments: {
    color: 'gray',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  modalOptionText: {
    marginLeft: 15,
    fontSize: 16,
  },
});

export default Post;