import React from 'react';
import { ScrollView, View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ProfileHighlights = () => {
  const highlights = [
    { id: 1, title: '기쁜놈', image: 'https://img1.daumcdn.net/thumb/R1280x0/?fname=http://t1.daumcdn.net/brunch/service/user/gI8/image/nl4J4OCc7QyIoC8rBK8Fn1kYVCc.jpg' },
    { id: 2, title: '화남놈', image: 'https://pds.joongang.co.kr/news/component/htmlphoto_mmdata/201506/28/htm_20150628083828504.jpg' },
    { id: 3, title: '까칠이', image: 'https://inabooth.io/_next/image?url=https%3A%2F%2Fd19bi7owzxc0m2.cloudfront.net%2Fprod%2Fcharacter_files%2F19dec92d-10be-4f5a-aad9-c68846c3d4b7.jpeg&w=3840&q=75' },
    { id: 4, title: '슬픔', image: 'https://d3ihz389yobwks.cloudfront.net/1597427709625898634218810800.jpg' },
    { id: 5, title: '선비', image: 'https://img.newspim.com/news/2017/01/31/1701311632536400.jpg' },
  ];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
      <TouchableOpacity style={styles.highlightItem}>
        <View style={styles.addButton}>
          <Ionicons name="add" size={24} color="#fff" />
        </View>
        <Text style={styles.highlightText}>New</Text>
      </TouchableOpacity>
      {highlights.map((highlight) => (
        <TouchableOpacity key={highlight.id} style={styles.highlightItem}>
          <View style={styles.highlightImageContainer}>
            <Image source={{ uri: highlight.image }} style={styles.highlightImage} />
          </View>
          <Text style={styles.highlightText} numberOfLines={1}>{highlight.title}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 15,
    backgroundColor: '#fff', // 배경색을 흰색으로 변경
  },
  highlightItem: {
    alignItems: 'center',
    marginRight: 15,
    width: 70,
  },
  addButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f0f0f0', // 배경색을 밝은 회색으로 변경
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dbdbdb', // 테두리 색상을 연한 회색으로 변경
  },
  highlightImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#dbdbdb', // 테두리 색상을 연한 회색으로 변경
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  highlightImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  highlightText: {
    color: '#262626', // 텍스트 색상을 어두운 회색으로 변경
    marginTop: 5,
    fontSize: 12,
    textAlign: 'center',
    width: '100%',
  },
});

export default ProfileHighlights;
