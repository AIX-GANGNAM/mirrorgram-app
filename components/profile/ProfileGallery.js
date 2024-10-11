import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';

const ProfileGallery = ({ user }) => {
  // 여기서는 예시로 더미 데이터를 사용합니다. 실제로는 user.posts 등에서 데이터를 가져와야 합니다.
  const dummyPosts = Array(9).fill(null).map((_, i) => `https://picsum.photos/200/200?random=${i}`);

  return (
    <View style={styles.container}>
      {dummyPosts.map((post, index) => (
        <Image key={index} source={{ uri: post }} style={styles.image} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  image: {
    width: Dimensions.get('window').width / 3 - 2,
    height: Dimensions.get('window').width / 3 - 2,
    margin: 1,
  },
});

export default ProfileGallery;