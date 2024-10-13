import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ProfileHeader = ({ username }) => {
  return (
    <View style={styles.header}>
      <Text style={styles.username}>@ {username}</Text>
      <TouchableOpacity>
        <Ionicons name="menu-outline" size={24} color="#000" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#dbdbdb',
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileHeader;
