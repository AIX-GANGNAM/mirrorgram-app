import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const Header = () => {
  console.log("home > Header.js > 호출됨");
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <Image 
          style={styles.logo} 
          source={require('../../assets/logo/logo-color.png')}
        />
      </View>

      <View style={styles.rightSection}>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => navigation.navigate('CreatePersona')}
        >
          <Ionicons name="add-circle-outline" size={26} color="#1A1A1A" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => navigation.navigate('Activity')}
        >
          <Ionicons name="heart-outline" size={26} color="#1A1A1A" />
          {/* 알림이 있을 때만 배지 표시 */}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>12</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => navigation.navigate('ChatList')}
        >
          <Ionicons name="chatbubble-outline" size={24} color="#1A1A1A" />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>5</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default Header;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    height: 32,
    width: 100,
    resizeMode: 'contain',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    padding: 6,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginRight: 10,
  },
  badge: {
    position: 'absolute',
    backgroundColor: '#FF3250',
    borderRadius: 100,
    left: 20,
    bottom: 22,
    height: 22,
    width: 22,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  badgeText: {
    color: 'white',
    fontWeight: '900',
    fontSize: 10,
  },
});
