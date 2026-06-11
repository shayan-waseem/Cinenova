import React, { useRef, useEffect } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../theme/colors';

export default function MovieCard({ movie, onPress, index = 0 }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, index]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      friction: 4,
      tension: 300,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 200,
      useNativeDriver: true,
    }).start();
  };

  const isComingSoon = movie.status === 'Coming Soon';

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      <Pressable
        onPress={() => onPress(movie)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <LinearGradient colors={Colors.gradientCard} style={styles.card}>
          {/* Poster Emoji */}
          <View style={styles.posterContainer}>
            <LinearGradient
              colors={isComingSoon ? ['#2a2a3a', '#1c1c28'] : Colors.gradientPrimary}
              style={styles.posterGradient}
            >
              <Text style={styles.posterEmoji}>{movie.poster}</Text>
            </LinearGradient>
          </View>

          {/* Movie Info */}
          <View style={styles.info}>
            <Text style={styles.title} numberOfLines={1}>{movie.title}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.genre}>{movie.genre}</Text>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.duration}>{movie.duration} min</Text>
            </View>
            <View style={styles.bottomRow}>
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingStar}>⭐</Text>
                <Text style={styles.rating}>{movie.rating}</Text>
              </View>
              <View style={[styles.statusBadge, isComingSoon && styles.comingSoonBadge]}>
                <Text style={[styles.statusText, isComingSoon && styles.comingSoonText]}>
                  {movie.status}
                </Text>
              </View>
            </View>
          </View>

          {/* Arrow */}
          <Text style={styles.arrow}>›</Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 20,
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  posterContainer: {
    marginRight: 14,
  },
  posterGradient: {
    width: 60,
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  posterEmoji: {
    fontSize: 30,
  },
  info: {
    flex: 1,
  },
  title: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  genre: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  dot: {
    color: Colors.textMuted,
    marginHorizontal: 6,
    fontSize: 10,
  },
  duration: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingStar: {
    fontSize: 12,
    marginRight: 4,
  },
  rating: {
    color: Colors.gold,
    fontSize: 14,
    fontWeight: '700',
  },
  statusBadge: {
    backgroundColor: 'rgba(229, 9, 20, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  statusText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  comingSoonBadge: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
  },
  comingSoonText: {
    color: Colors.secondary,
  },
  arrow: {
    color: Colors.textMuted,
    fontSize: 24,
    fontWeight: '300',
    marginLeft: 8,
  },
});
