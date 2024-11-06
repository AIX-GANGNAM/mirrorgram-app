import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

export const DialogueBox = ({ dialogue, isVisible }) => {
  if (!isVisible || !dialogue) return null;

  return (
    <View style={styles.dialogueContainer}>
      <View style={styles.dialogueBox}>
        <Text style={styles.dialogueText}>{dialogue}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dialogueContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  dialogueBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 15,
    borderRadius: 10,
    maxWidth: '100%',
  },
  dialogueText: {
    color: 'white',
    fontSize: 16,
  },
});
