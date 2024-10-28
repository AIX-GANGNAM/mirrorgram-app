import { Alert } from 'react-native';
import { updateDoc, deleteDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Ionicons, KeyboardAvoidingView } from 'react-native';
import { doc, arrayUnion, arrayRemove } from 'firebase/firestore';

const PostDetail = ({ route }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    if (Array.isArray(post.likes)) {
      setIsLiked(post.likes.includes(currentUser.uid));
      setLikeCount(post.likes.length);
    }
  }, [post.likes, currentUser.uid]);

  const handleLike = async () => {
    try {
      const postRef = doc(db, 'feeds', post.folderId);
      let updatedLikes = Array.isArray(post.likes) ? [...post.likes] : [];

      if (isLiked) {
        updatedLikes = updatedLikes.filter(id => id !== currentUser.uid);
      } else {
        updatedLikes.push(currentUser.uid);
      }

      await updateDoc(postRef, { likes: updatedLikes });
      setIsLiked(!isLiked);
      setLikeCount(updatedLikes.length);
    } catch (error) {
      console.error('좋아요 처리 중 오류:', error);
    }
  };

  const handleEdit = () => {
    setShowOptions(false);
    navigation.navigate('EditPost', { post });
  };

  const handleDelete = async () => {
    Alert.alert(
      '게시물 삭제',
      '정말로 이 게시물을 삭제하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'feeds', post.folderId));
              navigation.goBack();
              // 삭제 완료 메시지
              Alert.alert('삭제 완료', '게시물이 삭제되었습니다.');
            } catch (error) {
              console.error('게시물 삭제 중 오류:', error);
              Alert.alert('오류', '게시물 삭제에 실패했습니다.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>게시물</Text>
        {currentUser.uid === post.userId && (
          <TouchableOpacity onPress={() => setShowOptions(!showOptions)}>
            <Ionicons name="ellipsis-horizontal" size={24} color="#1A1A1A" />
          </TouchableOpacity>
        )}
      </View>

      {/* 옵션 모달 */}
      {showOptions && (
        <View style={styles.optionsModal}>
          <TouchableOpacity 
            style={styles.optionItem} 
            onPress={handleEdit}
          >
            <Ionicons name="create-outline" size={20} color="#1A1A1A" />
            <Text style={styles.optionText}>수정하기</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.optionItem, styles.deleteOption]} 
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            <Text style={styles.deleteText}>삭제하기</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ... 기존 ScrollView 내용 ... */}

      {/* 상호작용 섹션 수정 */}
      <View style={styles.interactionBar}>
        <View style={styles.interactionStats}>
          <TouchableOpacity 
            style={styles.statItem}
            onPress={handleLike}
          >
            <Ionicons 
              name={isLiked ? "heart" : "heart-outline"} 
              size={24} 
              color={isLiked ? "#F91880" : "#1A1A1A"} 
            />
            <Text style={[
              styles.statText,
              isLiked && styles.likedText
            ]}>
              {likeCount}
            </Text>
          </TouchableOpacity>
          <View style={styles.statItem}>
            <Ionicons name="chatbubble-outline" size={24} color="#1A1A1A" />
            <Text style={styles.statText}>
              {comments.length}
            </Text>
          </View>
        </View>
      </View>

      {/* ... 나머지 컴포넌트 ... */}
    </KeyboardAvoidingView>
  );
};

// 기존 스타일에 추가
const styles = StyleSheet.create({
  // ... 기존 스타일 유지
  optionsModal: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  optionText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#1A1A1A',
  },
  deleteOption: {
    borderTopWidth: 1,
    borderTopColor: '#F2F2F2',
  },
  deleteText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#FF3B30',
  },
  likedText: {
    color: '#F91880',
  },
  // ... 기존 스타일 유지
});

export default PostDetail;
