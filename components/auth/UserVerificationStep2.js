import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ProgressBar from './ProgressBar';
import { commonStyles } from './commonStyles';

const UserVerificationStep2 = () => {
  const [name, setName] = useState('');
  const navigation = useNavigation();
  const route = useRoute();
  const { username } = route.params;

  const handleNext = () => {
    if (name) {
      navigation.navigate('UserVerificationStep3', { username, name });
    } else {
      alert('이름을 입력해주세요.');
    }
  };

  return (
    <View style={styles.container}>
      <ProgressBar step={3} totalSteps={5} />
      <Text style={styles.title}>이름 입력</Text>
      <TextInput
        style={styles.input}
        placeholder="이름"
        value={name}
        onChangeText={setName}
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

export default UserVerificationStep2;
