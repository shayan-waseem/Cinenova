import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Animated,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../theme/colors';
import Header from '../components/Header';
import MovieCard from '../components/MovieCard';
import { fetchMovies, MOCK_MOVIES } from '../services/api';

export default function HomeScreen({ navigation, route }) {
  const { userName, userTier } = route.params || {};
  const [movies, setMovies] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('now');
  const tabIndicator = useRef(new Animated.Value(0)).current;

  const loadMovies = useCallback(async () => {
    try {
      const data = await fetchMovies();
      setMovies(data);
    } catch {
      setMovies(MOCK_MOVIES);
    }
  }, []);

  useEffect(() => {
    loadMovies();
  }, [loadMovies]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMovies();
    setRefreshing(false);
  }, [loadMovies]);

  const switchTab = (tab) => {
    setActiveTab(tab);
    Animated.spring(tabIndicator, {
      toValue: tab === 'now' ? 0 : 1,
      friction: 6,
      tension: 300,
      useNativeDriver: true,
    }).start();
  };

  const filteredMovies = movies.filter((m) =>
    activeTab === 'now' ? m.status === 'Now Showing' : m.status === 'Coming Soon'
  );

  const indicatorTranslate = tabIndicator.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 160],
  });

  const handleMoviePress = (movie) => {
    navigation.navigate('Booking', { movie, userName, userTier });
  };

  return (
    <View style={styles.container}>
      <Header
        title="🎬 Movies"
        subtitle="Browse and book your favorite films"
        userName={userName}
        userTier={userTier}
      />

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <View style={styles.tabBar}>
          <Animated.View
            style={[
              styles.tabIndicator,
              { transform: [{ translateX: indicatorTranslate }] },
            ]}
          >
            <LinearGradient colors={Colors.gradientPrimary} style={styles.tabIndicatorGrad} />
          </Animated.View>
          <Pressable style={styles.tab} onPress={() => switchTab('now')}>
            <Text style={[styles.tabText, activeTab === 'now' && styles.tabTextActive]}>
              🔴 Now Showing
            </Text>
          </Pressable>
          <Pressable style={styles.tab} onPress={() => switchTab('soon')}>
            <Text style={[styles.tabText, activeTab === 'soon' && styles.tabTextActive]}>
              🟣 Coming Soon
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Movie List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {filteredMovies.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>{activeTab === 'now' ? '🎬' : '⏰'}</Text>
            <Text style={styles.emptyText}>
              {activeTab === 'now' ? 'No movies showing right now' : 'No upcoming movies'}
            </Text>
          </View>
        ) : (
          filteredMovies.map((movie, index) => (
            <MovieCard
              key={movie.movieId}
              movie={movie}
              index={index}
              onPress={handleMoviePress}
            />
          ))
        )}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  tabContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    padding: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 160,
    height: '100%',
    borderRadius: 10,
    overflow: 'hidden',
  },
  tabIndicatorGrad: {
    flex: 1,
    borderRadius: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    zIndex: 1,
  },
  tabText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  tabTextActive: {
    color: Colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 15,
  },
  bottomPadding: {
    height: 100,
  },
});
