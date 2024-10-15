import { ScrollView, Pressable, TextInput, StyleSheet, TouchableOpacity, View, Text, Image, ToastAndroid, Modal } from 'react-native';
import { Divider } from 'react-native-elements';
import { HeartIcon as FillHeartIcon, BookmarkIcon as FilledBookmarkIcon, EllipsisVerticalIcon, CheckBadgeIcon, XMarkIcon } from 'react-native-heroicons/solid';
import { HeartIcon, BookmarkIcon, ChatBubbleOvalLeftIcon, PaperAirplaneIcon, } from 'react-native-heroicons/outline';
import React, {useState, useEffect } from 'react';
import ImageViewer from 'react-native-image-zoom-viewer';
import {getFirestore, doc, updateDoc ,collection, query, where, getDocs, orderBy, getDoc , addDoc, setDoc, arrayUnion, arrayRemove} from 'firebase/firestore';
import {  PencilIcon, TrashIcon } from 'react-native-heroicons/outline';
import { useSelector } from 'react-redux';
import { getRandomBytes } from 'expo-random';
import { HeartIcon as HeartOutline } from 'react-native-heroicons/outline';
import { HeartIcon as HeartSolid } from 'react-native-heroicons/solid';
import { ChevronDownIcon, ChevronUpIcon } from 'react-native-heroicons/outline';




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
	  commentCount={comments.length}
	/>
	<Likes like={like} post={post} />
	<Caption post={post} showFullCaption={showFullCaption} setShowFullCaption={setShowFullCaption} />
	<CommentsPreview commentCount={comments.length} setShowCommentModal={setShowCommentModal} />
	<CommentModal visible={showCommentModal} setVisible={setShowCommentModal} newComment={newComment} setNewComment={setNewComment} addComment={addComment} post={post} />
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



const PostFooter = ({post, setShowCommentModal, commentCount}) => {
  const [bookmark, setBookmark] = useState(false);
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

      // 로컬 상태 업데이트
      setIsLiked(!isLiked);
      setLikeCount(updatedLikes.length);
    } catch (error) {
      console.error('좋아요 처리 중 류 발생:', error);
    }
  };

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

  return(
    <View>
      <View style={styles.postFooter}>
        <View style={styles.postIcon}>
          <TouchableOpacity onPress={handleLike} style={styles.icon}>
            {isLiked ? <FillHeartIcon color='red' size={28} /> : <HeartIcon color='black' size={28} />}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowCommentModal(true)} style={styles.icon}>
            <ChatBubbleOvalLeftIcon color='black' size={28} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.icon}>
            <PaperAirplaneIcon color='black' size={28} style={{transform: [{rotate: '-45deg'}], marginTop: -5}} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => setBookmark(!bookmark)} style={{marginRight: 10}}>
          <BookmarkIcon color={bookmark ? 'black' : 'black'} size={28} />
        </TouchableOpacity>
      </View>
      <View style={styles.likeSection}>
        <Text style={styles.likeText}>좋아요 {likeCount}개</Text>
      </View>
      
    </View>
  );
}

const Likes = ({post, like}) => {
  const likeCount = Array.isArray(post.likes) ? post.likes.length : 0;
  
  return(
    <View style={styles.likes}>
      <Text style={[styles.Texts,{opacity: 0.9}]}>
        {like ? 'Like by you and ' : 'Liked by '}
        {likeCount} {likeCount === 1 ? 'person' : 'people'}
      </Text>
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

const CommentsPreview = ({commentCount, setShowCommentModal}) => {
  return (
    <View style={styles.commentsPreview}>
      {commentCount > 0 && (
        <TouchableOpacity onPress={() => setShowCommentModal(true)}>
          <Text style={styles.viewAllComments}>
            {commentCount === 1 ? '1개의 댓글 보기' : `${commentCount}개의 댓글 모두 보기`}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const CommentModal = ({ visible, setVisible, post }) => {
  const user = useSelector(state => state.user.user);
  const db = getFirestore();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyToUser, setReplyToUser] = useState('');
  const [expandedComments, setExpandedComments] = useState({});

  useEffect(() => {
    if (visible) {
      fetchComments();
    }
  }, [visible]);

  const fetchComments = async () => {
    try {
      const postRef = doc(db, 'feeds', post.folderId);
      const docSnap = await getDoc(postRef);
      if (docSnap.exists()) {
        const postData = docSnap.data();
        setComments(postData.comments || []);
      }
    } catch (error) {
      console.error('댓글 불러오기 오류:', error);
    }
  };

  const handleAddComment = async () => {
    if (newComment.trim() === '') return;

    const commentData = {
      id: Date.now().toString(),
      userId: user.uid,
      nick: user.userId,
      content: newComment,
      profileImg: user.profileImg,
      createdAt: new Date().toISOString(),
      likes: [],
      replies: [],
    };

    try {
      const postRef = doc(db, 'feeds', post.folderId);
      let updatedComments;
      
      if (replyTo) {
        // 대댓글 추가
        updatedComments = addReplyToComment(comments, replyTo, commentData);
      } else {
        // 새 댓글 추가
        updatedComments = [...comments, commentData];
      }

      await updateDoc(postRef, { comments: updatedComments });

      setComments(updatedComments);
      setNewComment('');
      setReplyTo(null);
      setReplyToUser('');
    } catch (error) {
      console.error('댓글 추가 오류:', error);
    }
  };

  const addReplyToComment = (comments, replyToId, newReply) => {
    return comments.map(comment => {
      if (comment.id === replyToId) {
        return {
          ...comment,
          replies: [...comment.replies, newReply]
        };
      } else if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: addReplyToComment(comment.replies, replyToId, newReply)
        };
      }
      return comment;
    });
  };

  const toggleReplies = (commentId) => {
    setExpandedComments(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const RecursiveComment = ({ comment, depth = 0 }) => (
    <View style={[styles.commentItem, { marginLeft: depth * 20 }]}>
      <Image
        style={styles.commentAvatar}
        source={comment.profileImg ? { uri: comment.profileImg } : require('../../assets/no-profile.png')}
      />
      <View style={styles.commentContent}>
        <Text style={styles.commentUser}>{comment.nick}</Text>
        <Text style={styles.commentText}>{comment.content}</Text>
        <View style={styles.commentActions}>
          <TouchableOpacity onPress={() => handleLike(comment.id)}>
            {comment.likes && comment.likes.includes(user.uid) ? (
              <HeartSolid color="red" size={16} />
            ) : (
              <HeartOutline color="black" size={16} />
            )}
          </TouchableOpacity>
          <Text style={styles.likeCount}>{comment.likes ? comment.likes.length : 0}</Text>
          <TouchableOpacity onPress={() => {
            setReplyTo(comment.id);
            setReplyToUser(comment.nick);
          }}>
            <Text style={styles.replyButton}>답글 달기</Text>
          </TouchableOpacity>
        </View>
        {comment.replies && comment.replies.length > 0 && (
          <View>
            <TouchableOpacity onPress={() => toggleReplies(comment.id)} style={styles.showRepliesButton}>
              {expandedComments[comment.id] ? (
                <>
                  <Text style={styles.showRepliesText}>답글 숨기기</Text>
                  <ChevronUpIcon color="gray" size={16} />
                </>
              ) : (
                <>
                  <Text style={styles.showRepliesText}>{`답글 ${comment.replies.length}개 보기`}</Text>
                  <ChevronDownIcon color="gray" size={16} />
                </>
              )}
            </TouchableOpacity>
            {expandedComments[comment.id] && (
              <View>
                {comment.replies.map(reply => (
                  <RecursiveComment key={reply.id} comment={reply} depth={depth + 1} />
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={() => setVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => {
            setVisible(false);
            setReplyTo(null);
            setReplyToUser('');
          }}>
            <XMarkIcon color='black' size={24} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>댓글</Text>
          <View style={{ width: 24 }} />
        </View>
        <ScrollView style={styles.commentsList}>
          {comments.map(comment => (
            <RecursiveComment key={comment.id} comment={comment} />
          ))}
        </ScrollView>
        <View style={styles.commentInputContainer}>
          {replyTo && (
            <View style={styles.replyingTo}>
              <Text>답글 작성 중: {replyToUser}</Text>
              <TouchableOpacity onPress={() => {
                setReplyTo(null);
                setReplyToUser('');
              }}>
                <XMarkIcon color='black' size={16} />
              </TouchableOpacity>
            </View>
          )}
          <Image
            style={styles.commentAvatar}
            source={user.profileImg ? { uri: user.profileImg } : require('../../assets/no-profile.png')}
          />
          <TextInput
            style={styles.commentInput}
            placeholder={replyTo ? `${replyToUser}에게 답글 작성...` : "댓글 작성..."}
            value={newComment}
            onChangeText={setNewComment}
            onSubmitEditing={handleAddComment}
          />
          <TouchableOpacity onPress={handleAddComment}>
            <Text style={styles.postButton}>게시</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};



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
  replyItem: {
    marginLeft: 20,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  likeCount: {
    marginLeft: 5,
    marginRight: 10,
    fontSize: 12,
  },
  replyButton: {
    fontSize: 12,
    color: 'gray',
  },
  replyingTo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  showRepliesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  showRepliesText: {
    color: 'gray',
    fontSize: 12,
    marginRight: 5,
  },
  commentSection: {
    paddingHorizontal: 15,
    paddingBottom: 5,
  },
  commentText: {
    fontSize: 14,
    color: 'gray',
  },
});

export default Post;