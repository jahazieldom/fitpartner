import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather'; // puedes usar cualquier set

const StatusButton = ({ title, status = 'idle', onPress, style }) => {
  let content = null;

  switch (status) {
    case 'loading':
      content = (
        <>
          <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.text}>{title}...</Text>
        </>
      );
      break;
    case 'success':
      content = (
        <>
          <Icon name="check" size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.text}>{title}</Text>
        </>
      );
      break;
    case 'error':
      content = (
        <>
          <Icon name="x" size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.text}>{title}</Text>
        </>
      );
      break;
    case 'idle':
    default:
      content = (
        <>
          <Icon name="check" size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.text}>{title}</Text>
        </>
      );
      break;
  }

  return (
    <TouchableOpacity
      style={[styles.button, style, status === 'loading' && styles.buttonDisabled]}
      onPress={onPress}
      disabled={status === 'loading'}
    >
      <View style={styles.content}>{content}</View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default StatusButton;
