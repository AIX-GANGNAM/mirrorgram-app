import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, Image, View, Text, TouchableOpacity, ScrollView } from 'react-native';

const EditForm = ({ name, userId, profileImg, birthdate, phone, mbti, personality, onSave, onImagePick }) => {
  const [formData, setFormData] = useState({
    name: name || '',
    userId: userId || '',
    profileImg: profileImg || '',
    birthdate: birthdate || '',
    phone: phone || '',
    mbti: mbti || '',
    personality: personality || '',
  });

  useEffect(() => {
    console.log('Current form data:', formData);
  }, [formData]);

  const handleChange = (field, value) => {
    setFormData(prevData => {
      const newData = { ...prevData, [field]: value };
      onSave(newData);
      return newData;
    });
  };

  const handlePhoneChange = (text) => {
    const cleaned = text.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{0,4})(\d{0,4})$/);
    if (match) {
      setFormData(prevData => {
        const newData = { ...prevData, phone: `${match[1]}${match[2] ? '-' : ''}${match[2]}${match[3] ? '-' : ''}${match[3]}` };
        onSave(newData);
        return newData;
      });
    } else {
      setFormData(prevData => {
        const newData = { ...prevData, phone: cleaned };
        onSave(newData);
        return newData;
      });
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
    setFormData(prevData => {
      const newData = { ...prevData, birthdate: formatDate(text) };
      onSave(newData);
      return newData;
    });
  };

  const handleImagePick = async () => {
    const newImageUri = await onImagePick();
    if (newImageUri) {
      handleChange('profileImg', newImageUri);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileImageContainer}>
        <Image source={{ uri: formData.profileImg || 'https://via.placeholder.com/150' }} style={styles.profileImage} />
        <TouchableOpacity style={styles.changePhotoButton} onPress={handleImagePick}>
          <Text style={styles.changePhotoText}>프로필 사진 변경</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>이름</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => handleChange('name', text)}
            placeholder="이름"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>사용자 ID</Text>
          <TextInput
            style={styles.input}
            value={formData.userId}
            onChangeText={(text) => handleChange('userId', text)}
            placeholder="사용자 ID"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>생년월일</Text>
          <TextInput
            style={styles.input}
            value={formData.birthdate}
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
            value={formData.phone}
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
            value={formData.mbti}
            onChangeText={(text) => handleChange('mbti', text)}
            placeholder="MBTI"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>성격</Text>
          <TextInput
            style={styles.input}
            value={formData.personality}
            onChangeText={(text) => handleChange('personality', text)}
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
