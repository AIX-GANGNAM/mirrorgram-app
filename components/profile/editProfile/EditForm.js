import React, { useState } from 'react';
import { StyleSheet, TextInput, Image, View, Text, TouchableOpacity, ScrollView } from 'react-native';

const EditForm = ({ name, userId, profileImg, birthdate, phone, mbti, personality, onSave }) => {
  const [newName, setNewName] = useState(name || '');
  const [newUserId, setNewUserId] = useState(userId || '');
  const [newProfileImg, setNewProfileImg] = useState(profileImg || '');
  const [newBirthdate, setNewBirthdate] = useState(birthdate || '');
  const [newPhone, setNewPhone] = useState(phone || '');
  const [newMbti, setNewMbti] = useState(mbti || '');
  const [newPersonality, setNewPersonality] = useState(personality || '');

  const handlePhoneChange = (text) => {
    const cleaned = text.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{0,4})(\d{0,4})$/);
    if (match) {
      setNewPhone(`${match[1]}${match[2] ? '-' : ''}${match[2]}${match[3] ? '-' : ''}${match[3]}`);
    } else {
      setNewPhone(cleaned);
    }
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
    setNewBirthdate(formatDate(text));
  };

  const handleSave = () => {
    const updatedProfile = {
      name: newName,
      userId: newUserId,
      profileImg: newProfileImg,
      birthdate: newBirthdate,
      phone: newPhone,
      mbti: newMbti,
      personality: newPersonality,
    };
    // console.log('Sending updated profile:', updatedProfile);
    onSave(updatedProfile);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileImageContainer}>
        <Image source={{ uri: newProfileImg || 'https://via.placeholder.com/150' }} style={styles.profileImage} />
        <TouchableOpacity style={styles.changePhotoButton}>
          <Text style={styles.changePhotoText}>프로필 사진 변경</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>이름</Text>
          <TextInput
            style={styles.input}
            value={newName}
            onChangeText={setNewName}
            placeholder="이름"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>사용자 ID</Text>
          <TextInput
            style={styles.input}
            value={newUserId}
            onChangeText={setNewUserId}
            placeholder="사용자 ID"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>생년월일</Text>
          <TextInput
            style={styles.input}
            value={newBirthdate}
            onChangeText={handleDateChange}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#999"
            keyboardType="numeric"
            maxLength={10}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>전화번호</Text>
          <TextInput
            style={styles.input}
            value={newPhone}
            onChangeText={handlePhoneChange}
            placeholder="전화번호"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>MBTI</Text>
          <TextInput
            style={styles.input}
            value={newMbti}
            onChangeText={setNewMbti}
            placeholder="MBTI"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>성격</Text>
          <TextInput
            style={styles.input}
            value={newPersonality}
            onChangeText={setNewPersonality}
            placeholder="성격"
            placeholderTextColor="#999"
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  profileImageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  changePhotoButton: {
    marginTop: 10,
  },
  changePhotoText: {
    color: '#3897f0',
    fontSize: 14,
    fontWeight: '600',
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#8e8e8e',
    marginBottom: 5,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#dbdbdb',
    paddingVertical: 10,
    fontSize: 16,
    color: '#262626',
  },
});

export default EditForm;
