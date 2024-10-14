import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ProgressBar from './ProgressBar.js';

const UserInfoStep2 = ({ navigation, route }) => {
  const [gender, setGender] = useState('');

  const handleNext = () => {
    if (gender) {
      navigation.navigate('UserInfoStep3', { ...route.params, gender });
    } else {
      alert('성별을 선택해주세요.');
    }
  };

  return (
    <LinearGradient colors={['#FF9A8B', '#FF6A88', '#FF99AC']} style={styles.container}>
      <ProgressBar step={2} totalSteps={4} />
      <Text style={styles.title}>당신의 성별은 무엇인가요?</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.genderButton, gender === 'male' && styles.selectedMaleButton]}
          onPress={() => setGender('male')}
        >
          <Ionicons name="male" size={30} color={gender === 'male' ? '#fff' : '#3897f0'} />
          <Text style={[styles.genderButtonText, gender === 'male' && styles.selectedButtonText]}>남성</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.genderButton, gender === 'female' && styles.selectedFemaleButton]}
          onPress={() => setGender('female')}
        >
          <Ionicons name="female" size={30} color={gender === 'female' ? '#fff' : '#FF69B4'} />
          <Text style={[styles.genderButtonText, gender === 'female' && styles.selectedButtonText]}>여성</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity 
        style={[styles.button, !gender && styles.disabledButton]} 
        onPress={handleNext}
        disabled={!gender}
      >
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
    marginBottom: 30,
    textAlign: 'center',
    color: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  genderButton: {
    flex: 1,
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    marginHorizontal: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  selectedMaleButton: {
    backgroundColor: '#3897f0',
    borderColor: '#3897f0',
  },
  selectedFemaleButton: {
    backgroundColor: '#FF69B4',
    borderColor: '#FF69B4',
  },
  genderButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  selectedButtonText: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#3897f0',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
  },
  disabledButton: {
    backgroundColor: 'rgba(56, 151, 240, 0.5)',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default UserInfoStep2;
