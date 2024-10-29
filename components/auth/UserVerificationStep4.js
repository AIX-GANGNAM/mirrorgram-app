import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, SafeAreaView, StyleSheet } from 'react-native';
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
    <SafeAreaView style={commonStyles.container}>
      <View style={commonStyles.innerContainer}>
        <ProgressBar step={5} totalSteps={5} />
        
        <View style={commonStyles.header}>
          <Text style={commonStyles.headerTitle}>전화번호를 입력해주세요</Text>
          <Text style={commonStyles.headerSubtitle}>
            이 단계는 선택사항입니다. 나중에 언제든 추가할 수 있습니다.
          </Text>
        </View>

        <View style={commonStyles.content}>
          <TextInput
            style={styles.input}
            placeholder="010-0000-0000"
            value={phone}
            onChangeText={handlePhoneChange}
            keyboardType="numeric"
            maxLength={13}
            placeholderTextColor="#657786"
          />
        </View>

        <TouchableOpacity style={commonStyles.button} onPress={handleNext}>
          <Text style={commonStyles.buttonText}>
            {phone ? '다음' : '건너뛰기'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#F5F8FA',
    borderWidth: 1,
    borderColor: '#E1E8ED',
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#14171A',
    textAlign: 'center',
  },
});

export default UserVerificationStep4;
