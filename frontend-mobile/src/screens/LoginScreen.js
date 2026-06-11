import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Animated,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../theme/colors';
import AnimatedButton from '../components/AnimatedButton';

const TIERS = [
  { key: 'VIP', emoji: '👑', color: Colors.gold, label: 'VIP' },
  { key: 'Premium', emoji: '💎', color: Colors.secondary, label: 'Premium' },
  { key: 'Regular', emoji: '🎟️', color: Colors.info, label: 'Regular' },
];

export default function LoginScreen({ navigation }) {
  const [name, setName] = useState('');
  const [selectedTier, setSelectedTier] = useState('Regular');

  // Animations
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const formSlide = useRef(new Animated.Value(60)).current;
  const formFade = useRef(new Animated.Value(0)).current;
  const tiersFade = useRef(new Animated.Value(0)).current;
  const buttonFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // Logo entrance
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, friction: 4, tension: 100, useNativeDriver: true }),
        Animated.timing(logoRotate, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
      // Form entrance
      Animated.parallel([
        Animated.timing(formSlide, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(formFade, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      // Tiers entrance
      Animated.timing(tiersFade, { toValue: 1, duration: 400, useNativeDriver: true }),
      // Button entrance
      Animated.timing(buttonFade, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [logoScale, logoRotate, formSlide, formFade, tiersFade, buttonFade]);

  const handleEnter = () => {
    if (!name.trim()) return;
    navigation.replace('MainTabs', { userName: name.trim(), userTier: selectedTier });
  };

  const spinInterpolate = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <LinearGradient colors={[Colors.bg, '#0c0c18', Colors.bg]} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        {/* Logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [{ scale: logoScale }, { rotate: spinInterpolate }],
            },
          ]}
        >
          <LinearGradient colors={Colors.gradientPrimary} style={styles.logoGradient}>
            <Text style={styles.logoEmoji}>🎬</Text>
          </LinearGradient>
        </Animated.View>

        <Animated.View style={{ opacity: formFade, transform: [{ translateY: Animated.multiply(formSlide, new Animated.Value(0.5)) }] }}>
          <Text style={styles.title}>CinemaOS</Text>
          <Text style={styles.subtitle}>Your premium movie experience</Text>
        </Animated.View>

        {/* Name Input */}
        <Animated.View
          style={[
            styles.inputContainer,
            { opacity: formFade, transform: [{ translateY: formSlide }] },
          ]}
        >
          <Text style={styles.inputLabel}>YOUR NAME</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={(text) => setName(text.slice(0, 100))}
            placeholder="Enter your name"
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="words"
            autoCorrect={false}
          />
        </Animated.View>

        {/* Tier Selector */}
        <Animated.View style={[styles.tiersContainer, { opacity: tiersFade }]}>
          <Text style={styles.inputLabel}>SELECT YOUR TIER</Text>
          <View style={styles.tiersRow}>
            {TIERS.map((tier) => {
              const isSelected = selectedTier === tier.key;
              return (
                <Pressable
                  key={tier.key}
                  onPress={() => setSelectedTier(tier.key)}
                  style={[
                    styles.tierCard,
                    isSelected && { borderColor: tier.color, backgroundColor: `${tier.color}15` },
                  ]}
                >
                  <Text style={styles.tierEmoji}>{tier.emoji}</Text>
                  <Text style={[styles.tierLabel, isSelected && { color: tier.color }]}>
                    {tier.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        {/* Enter Button */}
        <Animated.View style={[styles.buttonContainer, { opacity: buttonFade }]}>
          <AnimatedButton
            title="Enter Cinema"
            onPress={handleEnter}
            disabled={!name.trim()}
            icon="🎥"
            gradient={selectedTier === 'VIP' ? Colors.gradientGold : Colors.gradientPrimary}
          />
        </Animated.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoGradient: {
    width: 100,
    height: 100,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoEmoji: {
    fontSize: 48,
  },
  title: {
    color: Colors.text,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1,
    textAlign: 'center',
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 32,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  inputLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.bgInput,
    borderRadius: 14,
    padding: 16,
    color: Colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tiersContainer: {
    width: '100%',
    marginBottom: 32,
  },
  tiersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  tierCard: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  tierEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  tierLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  buttonContainer: {
    width: '100%',
  },
});
