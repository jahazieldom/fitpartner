import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Text, Animated, StyleSheet } from 'react-native';
import { colors, typography, components, spacing } from "@/styles";

export default function FilterTag({ label, active, onPress }) {
  const scaleAnim = useRef(new Animated.Value(active ? 1.2 : 1)).current;
  const colorAnim = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    // Animar escala y color cuando cambia active
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: active ? 1.05 : 1,
        useNativeDriver: false,
      }),
      Animated.timing(colorAnim, {
        toValue: active ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [active]);

  // Interpolación de color entre gris y verde
  const backgroundColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.muted, colors.primary],
  });

  const textColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#333', '#fff'],
  });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Animated.View
        style={[
          styles.tag,
          { backgroundColor, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Animated.Text style={[styles.tagText, { color: textColor }]}>
          {label}
        </Animated.Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tag: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 6,
    marginHorizontal: 10,
  },
  tagText: {
    fontSize: 14,
  },
});
