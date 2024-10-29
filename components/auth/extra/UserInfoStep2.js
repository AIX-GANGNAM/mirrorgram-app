import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProgressBar from './ProgressBar';
import { extraCommonStyles } from './commonStyles';

const UserInfoStep2 = ({ navigation, route }) => {
  const [gender, setGender] = useState('');

  const handleNext = () => {
    if (gender) {
      navigation.navigate('UserInfoStep3', { ...route.params, gender });
    }
  };

  return (
    <SafeAreaView style={extraCommonStyles.container}>
      <View style={extraCommonStyles.innerContainer}>
        <ProgressBar step={2} totalSteps={4} />
        <Text style={extraCommonStyles.title}>성별을 선택해주세요</Text>
        <Text style={extraCommonStyles.subtitle}>
          더 나은 매칭을 위해 필요해요
        </Text>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[styles.genderOption, gender === 'male' && styles.selectedOption]}
            onPress={() => setGender('male')}
          >
            <Ionicons 
              name="male" 
              size={24} 
              color={gender === 'male' ? '#fff' : '#657786'} 
            />
            <Text style={[styles.optionText, gender === 'male' && styles.selectedText]}>
              남성
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.genderOption, gender === 'female' && styles.selectedOption]}
            onPress={() => setGender('female')}
          >
            <Ionicons 
              name="female" 
              size={24} 
              color={gender === 'female' ? '#fff' : '#657786'} 
            />
            <Text style={[styles.optionText, gender === 'female' && styles.selectedText]}>
              여성
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[
            extraCommonStyles.button,
            !gender && extraCommonStyles.disabledButton
          ]}
          onPress={handleNext}
          disabled={!gender}
        >
          <Text style={extraCommonStyles.buttonText}>다음</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  optionsContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F8FA',
    borderWidth: 1,
    borderColor: '#E1E8ED',
    borderRadius: 25,
    padding: 20,
    marginBottom: 15,
  },
  selectedOption: {
    backgroundColor: '#5271ff',
    borderColor: '#5271ff',
  },
  optionText: {
    fontSize: 16,
    color: '#14171A',
    marginLeft: 15,
    fontWeight: '500',
  },
  selectedText: {
    color: '#fff',
  },
});

export default UserInfoStep2;
