import React from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { HeartIcon as HeartSolid } from 'react-native-heroicons/solid';
import { HeartIcon as HeartOutline, ChevronUpIcon, ChevronDownIcon } from 'react-native-heroicons/outline';

const RecursiveComment = ({ comment, handleLike, toggleReplies, expandedComments, setReplyTo, setReplyToUser, user }) => (
  <View style={styles.commentItem}>
    <View style={styles.commentHeader}>
      <Image
        style={styles.commentAvatar}
        source={comment.profileImg ? { uri: comment.profileImg } : require('../../assets/no-profile.png')}
      />
      <View style={styles.commentContent}>
        <Text style={styles.commentUser}>{comment.nick}</Text>
        <Text style={styles.commentText}>{comment.content}</Text>
      </View>
    </View>
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
      <View style={styles.repliesContainer}>
        <TouchableOpacity onPress={() => toggleReplies(comment.id)} style={styles.showRepliesButton}>
          {expandedComments[comment.id] ? (
            <>
              <Text style={styles.showRepliesText}>답글 숨기기</Text>
              <ChevronUpIcon color="gray" size={16} />
            </>
          ) : (
            <>
              <Text style={styles.showRepliesText}>{`${comment.replies.length}개의 답글 보기`}</Text>
              <ChevronDownIcon color="gray" size={16} />
            </>
          )}
        </TouchableOpacity>
        {expandedComments[comment.id] && comment.replies.map(reply => (
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
);

const styles = StyleSheet.create({
  commentItem: {
    marginBottom: 10,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  commentText: {
    fontSize: 14,
    color: 'black',
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    marginLeft: 42,
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
  repliesContainer: {
    marginLeft: 42,
    marginTop: 5,
  },
  showRepliesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  showRepliesText: {
    fontSize: 12,
    color: 'gray',
    marginRight: 5,
  },
});

export default RecursiveComment;
