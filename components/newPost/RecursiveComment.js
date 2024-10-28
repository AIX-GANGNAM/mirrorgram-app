import React from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const RecursiveComment = ({ comment, handleLike, toggleReplies, expandedComments, setReplyTo, setReplyToUser, user }) => {
  const isLiked = comment.likes && comment.likes.includes(user.uid);
  const likeCount = comment.likes ? comment.likes.length : 0;
  const replyCount = comment.replies ? comment.replies.length : 0;

  return (
    <View style={styles.commentItem}>
      <View style={styles.commentContainer}>
        {/* 왼쪽 프로필 컬럼 */}
        <View style={styles.leftColumn}>
          <Image
            style={styles.commentAvatar}
            source={comment.profileImg ? { uri: comment.profileImg } : require('../../assets/no-profile.png')}
          />
          {(comment.replies && comment.replies.length > 0) && (
            <View style={styles.replyLine} />
          )}
        </View>

        {/* 오른쪽 컨텐츠 컬럼 */}
        <View style={styles.rightColumn}>
          <View style={styles.commentHeader}>
            <Text style={styles.commentUser}>{comment.nick}</Text>
            <Text style={styles.commentTime}>· 2시간</Text>
          </View>

          <Text style={styles.commentText}>{comment.content}</Text>

          {/* 인터랙션 버튼 */}
          <View style={styles.interactionBar}>
            <TouchableOpacity 
              style={styles.interactionButton}
              onPress={() => handleLike(comment.id)}
            >
              <Ionicons 
                name={isLiked ? "heart" : "heart-outline"} 
                size={18} 
                color={isLiked ? "#F91880" : "#536471"} 
              />
              {likeCount > 0 && (
                <Text style={[
                  styles.interactionCount,
                  isLiked && styles.likedCount
                ]}>{likeCount}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.interactionButton}
              onPress={() => {
                setReplyTo(comment.id);
                setReplyToUser(comment.nick);
              }}
            >
              <Ionicons name="chatbubble-outline" size={18} color="#536471" />
            </TouchableOpacity>
          </View>

          {/* 답글 토글 버튼 */}
          {replyCount > 0 && (
            <TouchableOpacity 
              style={styles.showRepliesButton}
              onPress={() => toggleReplies(comment.id)}
            >
              <Text style={styles.showRepliesText}>
                {expandedComments[comment.id] 
                  ? '답글 숨기기' 
                  : `${replyCount}개의 답글`}
              </Text>
              <Ionicons 
                name={expandedComments[comment.id] ? "chevron-up" : "chevron-down"} 
                size={16} 
                color="#0095F6"
              />
            </TouchableOpacity>
          )}

          {/* 답글 목록 */}
          {expandedComments[comment.id] && comment.replies && (
            <View style={styles.repliesContainer}>
              {comment.replies.map(reply => (
                <RecursiveComment
                  key={reply.id}
                  comment={reply}
                  handleLike={handleLike}
                  toggleReplies={toggleReplies}
                  expandedComments={expandedComments}
                  setReplyTo={setReplyTo}
                  setReplyToUser={setReplyToUser}
                  user={user}
                />
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  commentItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  commentContainer: {
    flexDirection: 'row',
  },
  leftColumn: {
    marginRight: 12,
    alignItems: 'center',
  },
  replyLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#EFF3F4',
    marginTop: 4,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  rightColumn: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUser: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F1419',
    marginRight: 4,
  },
  commentTime: {
    fontSize: 15,
    color: '#536471',
  },
  commentText: {
    fontSize: 15,
    color: '#0F1419',
    lineHeight: 20,
    marginBottom: 8,
  },
  interactionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  interactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  interactionCount: {
    marginLeft: 4,
    fontSize: 13,
    color: '#536471',
  },
  likedCount: {
    color: '#F91880',
  },
  showRepliesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  showRepliesText: {
    fontSize: 14,
    color: '#0095F6',
    marginRight: 4,
  },
  repliesContainer: {
    marginTop: 4,
  },
});

export default RecursiveComment;
