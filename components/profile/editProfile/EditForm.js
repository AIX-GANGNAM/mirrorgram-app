import React, { useState } from 'react';
import { StyleSheet, TextInput, Image, View, Text, TouchableOpacity, ScrollView, Platform, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

const EditForm = ({ name, userName, profileImg, birthdate, phone, mbti, personality, onSave }) => {
  const [newName, setNewName] = useState(name || '');
  const [newUserName, setNewUserName] = useState(userName || '');
  const [newProfileImg, setNewProfileImg] = useState(profileImg || '');
  const [newBirthdate, setNewBirthdate] = useState(birthdate ? new Date(birthdate) : new Date());
  const [newPhone, setNewPhone] = useState(phone || '');
  const [newMbti, setNewMbti] = useState(mbti || '');
  const [newPersonality, setNewPersonality] = useState(personality || '');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date(newBirthdate));

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || tempDate;
    setTempDate(currentDate);
  };

  const confirmDate = () => {
    setNewBirthdate(tempDate);
    setShowDatePicker(false);
  };

  const handlePhoneChange = (text) => {
    const cleaned = text.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{0,4})(\d{0,4})$/);
    if (match) {
      setNewPhone(`${match[1]}${match[2] ? '-' : ''}${match[2]}${match[3] ? '-' : ''}${match[3]}`);
    } else {
      setNewPhone(cleaned);
    }
  };

  const handleSave = () => {
    onSave({
      name: newName,
      userName: newUserName,
      profileImg: newProfileImg,
      birthdate: newBirthdate.toISOString(),
      phone: newPhone,
      mbti: newMbti,
      personality: newPersonality,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {}}>
          <Ionicons name="close-outline" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>프로필 수정</Text>
        <TouchableOpacity onPress={handleSave}>
          <Ionicons name="checkmark" size={28} color="#3897f0" />
        </TouchableOpacity>
      </View>

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
          <Text style={styles.label}>사용자 이름</Text>
          <TextInput
            style={styles.input}
            value={newUserName}
            onChangeText={setNewUserName}
            placeholder="사용자 이름"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>생년월일</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
            <Text style={styles.dateText}>
              {newBirthdate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </Text>
          </TouchableOpacity>
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

      <Modal
        animationType="slide"
        transparent={true}
        visible={showDatePicker}
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>생년월일 선택</Text>
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="spinner"
              onChange={handleDateChange}
              style={styles.datePicker}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setShowDatePicker(false)} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmDate} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#dbdbdb',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
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
  },
  dateText: {
    fontSize: 16,
    color: '#262626',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  datePicker: {
    height: 200,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    padding: 10,
  },
  modalButtonText: {
    color: '#3897f0',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditForm;