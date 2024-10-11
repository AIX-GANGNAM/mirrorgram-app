import React from 'react';
import { ScrollView, View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ProfileHighlights = () => {
  const highlights = [
    { id: 1, title: '여행', image: 'https://via.placeholder.com/150' },
    { id: 2, title: '음식', image: 'https://via.placeholder.com/150' },
    { id: 3, title: '취미', image: 'https://via.placeholder.com/150' },
    { id: 4, title: '일상', image: 'https://via.placeholder.com/150' },
    { id: 5, title: '운동', image: 'https://via.placeholder.com/150' },
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
          <Image source={{ uri: highlight.image }} style={styles.highlightImage} />
          <Text style={styles.highlightText}>{highlight.title}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  highlightItem: {
    alignItems: 'center',
    marginRight: 15,
  },
  addButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#262626',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  highlightImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#fff',
  },
  highlightText: {
    color: '#fff',
    marginTop: 5,
    fontSize: 12,
  },
});

export default ProfileHighlights;
