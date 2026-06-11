import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../theme/colors';

export default function AnimatedButton({
  title,
  onPress,
  gradient = Colors.gradientPrimary,
  style,
  textStyle,
  disabled = false,
  icon,
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.93,
      friction: 4,
      tension: 300,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      tension: 200,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        onPress={disabled ? undefined : onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.pressable}
      >
        <LinearGradient
          colors={disabled ? ['#3a3a4e', '#2a2a3a'] : gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text style={[styles.text, disabled && styles.disabledText, textStyle]}>
            {title}
          </Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 28,
    borderRadius: 14,
  },
  icon: {
    fontSize: 18,
    marginRight: 8,
  },
  text: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  disabledText: {
    color: Colors.textMuted,
  },
});
