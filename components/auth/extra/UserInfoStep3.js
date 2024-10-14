import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ProgressBar from './ProgressBar.js';

const educationLevels = [
  { label: '고등학교 졸업', value: 'high_school', icon: 'school-outline' },
  { label: '대학교 재학', value: 'university_enrolled', icon: 'book-outline' },
  { label: '대학교 졸업', value: 'university_graduate', icon: 'school-outline' },
  { label: '대학원 재학', value: 'graduate_school_enrolled', icon: 'library-outline' },
  { label: '대학원 졸업', value: 'graduate_school_graduate', icon: 'school-outline' },
];

const UserInfoStep3 = ({ navigation, route }) => {
  const [education, setEducation] = useState('');
  const [university, setUniversity] = useState('');
  const [major, setMajor] = useState('');

  const handleNext = () => {
    if (education) {
      const educationInfo = {
        level: education,
        university: university,
        major: major,
      };
      navigation.navigate('UserInfoStep4', { ...route.params, education: educationInfo });
    } else {
      alert('학력을 선택해주세요.');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <LinearGradient colors={['#FF9A8B', '#FF6A88', '#FF99AC']} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <ProgressBar step={3} totalSteps={4} />
          <Text style={styles.title}>당신의 최종 학력은 무엇인가요?</Text>
          {educationLevels.map((level) => (
            <TouchableOpacity
              key={level.value}
              style={[styles.educationButton, education === level.value && styles.selectedEducation]}
              onPress={() => setEducation(level.value)}
            >
              <Ionicons name={level.icon} size={24} color={education === level.value ? "#FF6A88" : "#fff"} />
              <Text style={[styles.educationText, education === level.value && styles.selectedEducationText]}>
                {level.label}
              </Text>
            </TouchableOpacity>
          ))}
          {(education === 'university_enrolled' || education === 'university_graduate' ||
            education === 'graduate_school_enrolled' || education === 'graduate_school_graduate') && (
            <View style={styles.additionalInfoContainer}>
              <TextInput
                style={styles.input}
                placeholder="학명"
                value={university}
                onChangeText={setUniversity}
                placeholderTextColor="#999"
              />
              <TextInput
                style={styles.input}
                placeholder="학과"
                value={major}
                onChangeText={setMajor}
                placeholderTextColor="#999"
              />
            </View>
          )}
          <TouchableOpacity 
            style={[styles.button, !education && styles.disabledButton]} 
            onPress={handleNext}
            disabled={!education}
          >
            <Text style={styles.buttonText}>다음</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#fff',
    textAlign: 'center',
  },
  educationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
  },
  selectedEducation: {
    backgroundColor: '#fff',
  },
  educationText: {
    fontSize: 18,
    color: '#fff',
    marginLeft: 15,
  },
  selectedEducationText: {
    color: '#FF6A88',
    fontWeight: 'bold',
  },
  additionalInfoContainer: {
    marginTop: 30,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 18,
    color: '#333',
  },
  button: {
    backgroundColor: '#3897f0',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
  },
  disabledButton: {
    backgroundColor: '#b2dffc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default UserInfoStep3;
