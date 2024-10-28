import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TextInput, 
  TouchableOpacity, 
  Modal, 
  ScrollView, 
  StyleSheet, 
  Platform 
} from 'react-native';
import { useSelector } from 'react-redux';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons'; // Ionicons import 추가
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
          {/* 헤더 */}
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setVisible(false)}
            >
              <Ionicons name="close" size={24} color="#0F1419" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>댓글</Text>
            <View style={styles.headerRight} />
          </View>

          {/* 원본 포스트 미리보기 */}
          <View style={styles.originalPost}>
            <View style={styles.postPreview}>
              <Image
                source={post.profileImg ? { uri: post.profileImg } : require('../../assets/no-profile.png')}
                style={styles.postAvatar}
              />
              <View style={styles.postContent}>
                <Text style={styles.postAuthor}>{post.nick}</Text>
                <Text style={styles.postText} numberOfLines={2}>
                  {post.caption}
                </Text>
              </View>
            </View>
          </View>

          {/* 댓글 목록 */}
          <ScrollView 
            style={styles.commentsList}
            showsVerticalScrollIndicator={false}
          >
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

          {/* 댓글 입력 영역 */}
          <View style={styles.commentInputContainer}>
            <Image
              style={styles.commentAvatar}
              source={user.profileImg ? { uri: user.profileImg } : require('../../assets/no-profile.png')}
            />
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.commentInput}
                placeholder={replyTo ? `@${replyToUser}에게 답글 작성...` : "댓글을 입력하세요..."}
                value={newComment}
                onChangeText={setNewComment}
                multiline
                maxLength={300}
                placeholderTextColor="#536471"
              />
              <TouchableOpacity 
                style={[
                  styles.postButton,
                  !newComment.trim() && styles.postButtonDisabled
                ]}
                onPress={handleAddComment}
                disabled={!newComment.trim()}
              >
                <Text style={[
                  styles.postButtonText,
                  !newComment.trim() && styles.postButtonTextDisabled
                ]}>답글</Text>
              </TouchableOpacity>
            </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EFF3F4',
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F1419',
  },
  headerRight: {
    width: 40,
  },
  originalPost: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EFF3F4',
  },
  postPreview: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  postAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  postContent: {
    flex: 1,
  },
  postAuthor: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F1419',
    marginBottom: 4,
  },
  postText: {
    fontSize: 15,
    color: '#536471',
    lineHeight: 20,
  },
  commentsList: {
    flex: 1,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EFF3F4',
    backgroundColor: 'white',
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F7F9F9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  commentInput: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    color: '#0F1419',
    paddingTop: 8,
    paddingBottom: 8,
  },
  postButton: {
    marginLeft: 12,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#0095F6',
  },
  postButtonDisabled: {
    backgroundColor: '#0095F6',
    opacity: 0.5,
  },
  postButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  postButtonTextDisabled: {
    opacity: 0.5,
  },
});

export default CommentModal;
