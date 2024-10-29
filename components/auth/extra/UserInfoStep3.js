import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  SafeAreaView,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProgressBar from './ProgressBar';
import { extraCommonStyles } from './commonStyles';

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
    }
  };

  return (
    <SafeAreaView style={extraCommonStyles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView style={extraCommonStyles.innerContainer}>
          <ProgressBar step={3} totalSteps={4} />
          <Text style={extraCommonStyles.title}>학력을 선택해주세요</Text>
          <Text style={extraCommonStyles.subtitle}>
            비슷한 교육 배경을 가진 사람들과 매칭됩니다
          </Text>

          <View style={styles.optionsContainer}>
            {educationLevels.map((level) => (
              <TouchableOpacity
                key={level.value}
                style={[
                  styles.educationOption,
                  education === level.value && styles.selectedOption
                ]}
                onPress={() => setEducation(level.value)}
              >
                <Ionicons 
                  name={level.icon} 
                  size={24} 
                  color={education === level.value ? '#fff' : '#657786'} 
                />
                <Text style={[
                  styles.optionText,
                  education === level.value && styles.selectedText
                ]}>
                  {level.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {(education?.includes('university') || education?.includes('graduate')) && (
            <View style={styles.additionalFields}>
              <Text style={styles.fieldLabel}>학교 정보를 입력해주세요</Text>
              
              <View style={styles.inputContainer}>
                <Ionicons name="school-outline" size={20} color="#657786" />
                <TextInput
                  style={styles.input}
                  placeholder="학교명"
                  placeholderTextColor="#657786"
                  value={university}
                  onChangeText={setUniversity}
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="book-outline" size={20} color="#657786" />
                <TextInput
                  style={styles.input}
                  placeholder="전공"
                  placeholderTextColor="#657786"
                  value={major}
                  onChangeText={setMajor}
                />
              </View>

              <Text style={styles.helperText}>
                * 학교명과 전공은 선택사항입니다
              </Text>
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[
              extraCommonStyles.button,
              !education && extraCommonStyles.disabledButton
            ]}
            onPress={handleNext}
            disabled={!education}
          >
            <Text style={extraCommonStyles.buttonText}>다음</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  optionsContainer: {
    paddingHorizontal: 20,
  },
  educationOption: {
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
  additionalFields: {
    paddingHorizontal: 20,
    marginTop: 30,
    backgroundColor: '#F8FAFD',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#14171A',
    marginBottom: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E8ED',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 15,
    height: 50,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#14171A',
  },
  helperText: {
    fontSize: 14,
    color: '#657786',
    marginTop: 5,
    fontStyle: 'italic',
  },
  buttonContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E1E8ED',
  },
});

export default UserInfoStep3;
