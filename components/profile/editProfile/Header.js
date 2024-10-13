import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Header = ({ name, navigation, onSave }) => {
  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={handleBack}>
        <Ionicons name="close-outline" size={30} color="#000" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>프로필 수정</Text>
      <TouchableOpacity onPress={onSave}>
        {/* 저장 버튼 */}
        <Ionicons name="checkmark" size={28} color="#3897f0" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#dbdbdb',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#262626',
  },
});

export default Header;
