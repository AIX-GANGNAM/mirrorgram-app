import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ProgressBar from './ProgressBar';
import { commonStyles } from './commonStyles';

const UserVerificationStep1 = () => {
  const [username, setUsername] = useState('');
  const navigation = useNavigation();

  

  const handleNext = () => {
    if (username) {
      navigation.navigate('UserVerificationStep2', { username });
    } else {
      alert('사용자 ID를 입력해주세요.');
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/logo/mybot-log-color.png')}
        style={{width: 300, height: 300}}
      />
      <ProgressBar step={2} totalSteps={5} />
      <Text style={styles.title}>사용자 ID 입력</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.atSymbol}>@</Text>
        <TextInput
          style={styles.input}
          placeholder="사용자 ID"
          value={username}
          onChangeText={setUsername}
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>다음</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  ...commonStyles,
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 5,
    marginBottom: 15,
  },
  atSymbol: {
    fontSize: 16,
    color: '#262626',
    paddingLeft: 10,
  },
  input: {
    ...commonStyles.input,
    flex: 1,
    borderWidth: 0,
    marginBottom: 0,
  },
});

export default UserVerificationStep1;
