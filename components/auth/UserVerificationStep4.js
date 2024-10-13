import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ProgressBar from './ProgressBar';
import { commonStyles } from './commonStyles';

const UserVerificationStep4 = () => {
  const [phone, setPhone] = useState('');
  const navigation = useNavigation();
  const route = useRoute();
  const { username, name, birthdate } = route.params;

  const handleNext = () => {
    navigation.navigate('UserVerificationSummary', { username, name, birthdate, phone });
  };

  const autoHyphen = (value) => {
    return value
      .replace(/[^0-9]/g, '')
      .replace(/^(\d{0,3})(\d{0,4})(\d{0,4})$/g, "$1-$2-$3")
      .replace(/(\-{1,2})$/g, "");
  };

  const handlePhoneChange = (text) => {
    setPhone(autoHyphen(text));
  };

  return (
    <View style={styles.container}>
      <ProgressBar step={4} totalSteps={4} />
      <Text style={styles.title}>전화번호 입력 (선택사항)</Text>
      <TextInput
        style={styles.input}
        placeholder="전화번호"
        value={phone}
        onChangeText={handlePhoneChange}
        keyboardType="numeric"
        maxLength={13}
      />
      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>다음</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  ...commonStyles,
});

export default UserVerificationStep4;
