import React, { useState } from 'react';
import { View, TouchableOpacity, Text, TextInput, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ProgressBar from './ProgressBar';
import { commonStyles } from './commonStyles';

const UserVerificationStep3 = () => {
  const [birthdate, setBirthdate] = useState('');
  const navigation = useNavigation();
  const route = useRoute();
  const { username, name } = route.params;

  const handleNext = () => {
    if (isValidDate(birthdate)) {
      navigation.navigate('UserVerificationStep4', { username, name, birthdate });
    } else {
      alert('올바른 생년월일 형식을 입력해주세요. (예: 1990-01-01)');
    }
  };

  const isValidDate = (dateString) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;

    const parts = dateString.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);

    if (year < 1900 || year > new Date().getFullYear()) return false;
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;

    return true;
  };

  const formatDate = (text) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    let formatted = '';
    if (cleaned.length > 0) {
      formatted += cleaned.substr(0, 4);
      if (cleaned.length > 4) {
        formatted += '-' + cleaned.substr(4, 2);
        if (cleaned.length > 6) {
          formatted += '-' + cleaned.substr(6, 2);
        }
      }
    }
    return formatted;
  };

  const handleDateChange = (text) => {
    setBirthdate(formatDate(text));
  };

  return (
    <View style={styles.container}>
      <ProgressBar step={4} totalSteps={5} />
      <Text style={styles.title}>생년월일 입력</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        value={birthdate}
        onChangeText={handleDateChange}
        keyboardType="numeric"
        maxLength={10}
      />
      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>다음</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  ...commonStyles,
  input: {
    ...commonStyles.input,
    textAlign: 'center',
  },
});

export default UserVerificationStep3;
