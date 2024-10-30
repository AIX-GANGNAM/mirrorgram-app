import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import FriendHeader from '../components/profile/FriendHeader';
import FriendsList from '../components/profile/FriendsList';
import FriendSearch from '../components/profile/FriendSearch';

const FriendScreen = () => {
  const [activeTab, setActiveTab] = useState('friends');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <View style={styles.container}>
      <FriendHeader 
        onTabChange={handleTabChange} 
        activeTab={activeTab}
      />
      {activeTab === 'friends' ? (
        <FriendsList />
      ) : (
        <FriendSearch />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});

export default FriendScreen;