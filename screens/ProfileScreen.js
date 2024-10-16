import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileInfo from '../components/profile/ProfileInfo';
import ProfileActions from '../components/profile/ProfileActions';
import ProfileHighlights from '../components/profile/ProfileHighlights';
import ProfileGallery from '../components/profile/ProfileGallery';

// ProfileScreen.js
const ProfileScreen = ({ setIsAuthenticated }) => {
  const user = useSelector((state) => state.user.user);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <ProfileHeader username={user?.userId} setIsAuthenticated={setIsAuthenticated} />
        <ProfileInfo user={user} />
        <ProfileActions user={user} />
        <ProfileHighlights />
        <ProfileGallery user={user} />
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default ProfileScreen;
