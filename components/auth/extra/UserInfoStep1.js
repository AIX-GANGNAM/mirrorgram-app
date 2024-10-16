import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ProgressBar from './ProgressBar.js';

const MBTI_TYPES = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP'
];

const UserInfoStep1 = ({ navigation }) => {
  const [selectedMbti, setSelectedMbti] = useState('');

  const handleNext = () => {
    if (selectedMbti) {
      navigation.navigate('UserInfoStep2', { mbti: selectedMbti });
    } else {
      alert('MBTI를 선택해주세요.');
    }
  };

  const renderMbtiItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.mbtiItem, selectedMbti === item && styles.selectedMbtiItem]}
      onPress={() => setSelectedMbti(item)}
    >
      <Text style={[styles.mbtiText, selectedMbti === item && styles.selectedMbtiText]}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#FF9A8B', '#FF6A88', '#FF99AC']} style={styles.container}>
      <ProgressBar step={1} totalSteps={4} />
      <Text style={styles.title}>당신의 MBTI는 무엇인가요?</Text>
      <FlatList
        data={MBTI_TYPES}
        renderItem={renderMbtiItem}
        keyExtractor={(item) => item}
        numColumns={4}
        contentContainerStyle={styles.mbtiList}
      />
      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>다음</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
  },
  mbtiList: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  mbtiItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 15,
    padding: 15,
    margin: 8,
    width: 80,
    alignItems: 'center',
  },
  selectedMbtiItem: {
    backgroundColor: '#fff',
  },
  mbtiText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  selectedMbtiText: {
    color: '#FF6A88',
  },
  button: {
    backgroundColor: '#3897f0',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default UserInfoStep1;
