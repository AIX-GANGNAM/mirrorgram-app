import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ProfileActions = ({ user }) => {
  const navigation = useNavigation();

  const handleEditProfile = () => {
    navigation.navigate('EditProfile', {
      name: user.name,
      userName: user.username,
      profileImg: user.profileImg,
      birthdate: user.birthdate,
      phone: user.phone,
      mbti: user.mbti,
      personality: user.personality,
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handleEditProfile}>
        <Text style={styles.buttonText}>프로필 편집</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
  },
  button: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 5,
    paddingVertical: 7,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontWeight: '600',
  },
});

export default ProfileActions;