import { useState, useEffect } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { HeartSolid, HeartOutline, ChevronUpIcon, ChevronDownIcon, XMarkIcon } from 'react-native-heroicons/solid'; 
import RecursiveComment from './RecursiveComment';

const CommentModal = ({ visible, setVisible, post, setCommentCount }) => {
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
          updatedComments = addReplyToComment(comments, replyTo, commentData);
        } else {
          updatedComments = [...comments, commentData];
        }
  
        await updateDoc(postRef, { comments: updatedComments });
  
        setComments(updatedComments);
        setCommentCount(updatedComments.length); // 여기서 댓글 수를 업데이트합니다
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
  
    const handleLike = async (commentId) => {
      try {
        const postRef = doc(db, 'feeds', post.folderId);
        const updatedComments = comments.map(comment => {
          if (comment.id === commentId) {
            const likes = comment.likes || [];
            const userIndex = likes.indexOf(user.uid);
            if (userIndex > -1) {
              likes.splice(userIndex, 1);
            } else {
              likes.push(user.uid);
            }
            return { ...comment, likes };
          }
          return comment;
        });

        await updateDoc(postRef, { comments: updatedComments });
        setComments(updatedComments);
      } catch (error) {
        console.error('댓글 좋아요 처리 중 오류 발생:', error);
      }
    };
  
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
            <View style={{ width: 24 }} />
          </View>
          <ScrollView style={styles.commentsList}>
            {comments.map(comment => (
              <RecursiveComment 
                key={comment.id} 
                comment={comment} 
                handleLike={handleLike}
                toggleReplies={toggleReplies}
                expandedComments={expandedComments}
                setReplyTo={setReplyTo}
                setReplyToUser={setReplyToUser}
                user={user}
              />
            ))}
          </ScrollView>
          <View style={styles.commentInputContainer}>
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
      commentInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: '#EFEFEF',
      },
      commentAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 10,
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
});

export default CommentModal;
