import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Modal,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../theme/colors';
import Header from '../components/Header';
import SeatGrid from '../components/SeatGrid';
import AnimatedButton from '../components/AnimatedButton';
import { fetchShows, createBooking, MOCK_SHOWS } from '../services/api';

export default function BookingScreen({ navigation, route }) {
  const { movie, userName, userTier } = route.params || {};
  const [shows, setShows] = useState([]);
  const [selectedShow, setSelectedShow] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [ticketModal, setTicketModal] = useState(false);
  const [bookedTicket, setBookedTicket] = useState(null);
  const [booking, setBooking] = useState(false);

  // Animations
  const ticketSlide = useRef(new Animated.Value(400)).current;
  const ticketFade = useRef(new Animated.Value(0)).current;

  const loadShows = useCallback(async () => {
    try {
      const data = await fetchShows();
      setShows(data.filter((s) => s.movieId === movie.movieId));
    } catch {
      setShows(MOCK_SHOWS.filter((s) => s.movieId === movie.movieId));
    }
  }, [movie.movieId]);

  useEffect(() => {
    loadShows();
  }, [loadShows]);

  const generateBookedSeats = () => {
    // Generate pseudo-random booked seats for demo
    const booked = [];
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    for (let i = 0; i < 15; i++) {
      const row = rows[Math.floor(Math.random() * rows.length)];
      const seat = Math.floor(Math.random() * 10) + 1;
      booked.push(`${row}${seat}`);
    }
    return [...new Set(booked)];
  };

  const handleBook = async () => {
    if (!selectedShow || !selectedSeat || booking) return;
    setBooking(true);

    try {
      const result = await createBooking({
        userName,
        showId: selectedShow.showId,
        seatNumber: selectedSeat,
        bookingType: userTier,
      });
      setBookedTicket(result);
    } catch {
      // Offline fallback: simulate a ticket
      setBookedTicket({
        bookingId: 'B' + String(Math.floor(Math.random() * 900) + 100),
        userName,
        movieTitle: movie.title,
        seatNumber: selectedSeat,
        bookingType: userTier,
        time: new Date().toLocaleTimeString(),
      });
    }

    setBooking(false);
    setTicketModal(true);

    // Animate ticket slide up
    Animated.parallel([
      Animated.spring(ticketSlide, { toValue: 0, friction: 6, tension: 80, useNativeDriver: true }),
      Animated.timing(ticketFade, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const closeTicket = () => {
    Animated.parallel([
      Animated.timing(ticketSlide, { toValue: 400, duration: 300, useNativeDriver: true }),
      Animated.timing(ticketFade, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setTicketModal(false);
      ticketSlide.setValue(400);
      ticketFade.setValue(0);
    });
  };

  return (
    <View style={styles.container}>
      <Header
        title={movie.title}
        subtitle={`${movie.genre} • ${movie.duration} min • ⭐ ${movie.rating}`}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Movie Hero */}
        <View style={styles.heroContainer}>
          <LinearGradient colors={Colors.gradientPrimary} style={styles.heroPoster}>
            <Text style={styles.heroEmoji}>{movie.poster}</Text>
          </LinearGradient>
        </View>

        {/* Show Times */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🕐 Select Showtime</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.showsScroll}>
            {shows.length === 0 ? (
              <Text style={styles.noShows}>No shows available</Text>
            ) : (
              shows.map((show) => {
                const isSelected = selectedShow?.showId === show.showId;
                return (
                  <Pressable
                    key={show.showId}
                    onPress={() => {
                      setSelectedShow(show);
                      setSelectedSeat(null);
                    }}
                    style={[styles.showCard, isSelected && styles.showCardSelected]}
                  >
                    <Text style={[styles.showTime, isSelected && styles.showTimeSelected]}>
                      {show.time}
                    </Text>
                    <Text style={styles.showHall}>{show.hallName || 'Hall'}</Text>
                    <Text style={styles.showDate}>{show.date}</Text>
                    <View style={styles.showAvailability}>
                      <View
                        style={[
                          styles.availDot,
                          { backgroundColor: show.bookedSeats < 70 ? Colors.success : Colors.warning },
                        ]}
                      />
                      <Text style={styles.showAvailText}>
                        {show.totalCapacity ? `${show.totalCapacity - show.bookedSeats} left` : 'Available'}
                      </Text>
                    </View>
                  </Pressable>
                );
              })
            )}
          </ScrollView>
        </View>

        {/* Seat Selection */}
        {selectedShow && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💺 Select Your Seat</Text>
            <SeatGrid
              selectedSeat={selectedSeat}
              onSelectSeat={setSelectedSeat}
              bookedSeats={generateBookedSeats()}
            />
          </View>
        )}

        {/* Booking Summary */}
        {selectedSeat && (
          <View style={styles.section}>
            <LinearGradient colors={Colors.gradientCard} style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Booking Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Movie</Text>
                <Text style={styles.summaryValue}>{movie.title}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Showtime</Text>
                <Text style={styles.summaryValue}>{selectedShow.time}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Seat</Text>
                <Text style={styles.summaryValue}>{selectedSeat}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tier</Text>
                <View style={[styles.tierBadge, { backgroundColor: userTier === 'VIP' ? Colors.gold : userTier === 'Premium' ? Colors.secondary : Colors.info }]}>
                  <Text style={styles.tierBadgeText}>{userTier}</Text>
                </View>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Queue Priority</Text>
                <Text style={[styles.summaryValue, { color: Colors.secondary }]}>
                  {userTier === 'VIP' ? '🔥 Highest (P1)' : userTier === 'Premium' ? '⚡ High (P2)' : '📋 Normal (P3)'}
                </Text>
              </View>
              <AnimatedButton
                title={booking ? 'Booking...' : 'Confirm Booking'}
                onPress={handleBook}
                disabled={booking}
                icon="🎫"
                style={styles.bookButton}
                gradient={userTier === 'VIP' ? Colors.gradientGold : Colors.gradientPrimary}
              />
            </LinearGradient>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Ticket Confirmation Modal */}
      <Modal visible={ticketModal} transparent animationType="none">
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.ticketContainer,
              { opacity: ticketFade, transform: [{ translateY: ticketSlide }] },
            ]}
          >
            <LinearGradient colors={['#1c1c28', '#14141c']} style={styles.ticket}>
              <View style={styles.ticketTop}>
                <Text style={styles.ticketEmoji}>🎫</Text>
                <Text style={styles.ticketTitle}>Booking Confirmed!</Text>
                <Text style={styles.ticketSubtitle}>Your ticket has entered the queue</Text>
              </View>
              <View style={styles.ticketDashedLine}>
                {Array.from({ length: 20 }).map((_, i) => (
                  <View key={i} style={styles.dash} />
                ))}
              </View>
              <View style={styles.ticketDetails}>
                <TicketRow label="Movie" value={bookedTicket?.movieTitle || movie.title} />
                <TicketRow label="Seat" value={bookedTicket?.seatNumber || selectedSeat} />
                <TicketRow label="Type" value={bookedTicket?.bookingType || userTier} />
                <TicketRow label="ID" value={bookedTicket?.bookingId ? `***${bookedTicket.bookingId.slice(-3)}` : '---'} />
                <TicketRow label="Time" value={bookedTicket?.time || '--'} />
              </View>
              <View style={styles.ticketQueueInfo}>
                <LinearGradient colors={Colors.gradientPrimary} style={styles.queueBadge}>
                  <Text style={styles.queueBadgeText}>
                    Scheduling: {userTier === 'VIP' ? 'Priority → FCFS' : 'FCFS → Round Robin'}
                  </Text>
                </LinearGradient>
              </View>
              <AnimatedButton
                title="Done"
                onPress={closeTicket}
                gradient={['#2a2a3a', '#1c1c28']}
                style={styles.doneButton}
              />
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

function TicketRow({ label, value }) {
  return (
    <View style={styles.ticketRow}>
      <Text style={styles.ticketLabel}>{label}</Text>
      <Text style={styles.ticketValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  heroContainer: { alignItems: 'center', paddingVertical: 20 },
  heroPoster: {
    width: 120,
    height: 160,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroEmoji: { fontSize: 56 },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
  },
  showsScroll: { marginHorizontal: -20, paddingHorizontal: 20 },
  showCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    padding: 14,
    marginRight: 10,
    minWidth: 130,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  showCardSelected: {
    borderColor: Colors.secondary,
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
  },
  showTime: { color: Colors.text, fontSize: 18, fontWeight: '800', marginBottom: 4 },
  showTimeSelected: { color: Colors.secondary },
  showHall: { color: Colors.textSecondary, fontSize: 12, marginBottom: 2 },
  showDate: { color: Colors.textMuted, fontSize: 11, marginBottom: 8 },
  showAvailability: { flexDirection: 'row', alignItems: 'center' },
  availDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  showAvailText: { color: Colors.textSecondary, fontSize: 11 },
  noShows: { color: Colors.textMuted, fontSize: 14, padding: 20 },
  summaryCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryTitle: { color: Colors.text, fontSize: 18, fontWeight: '800', marginBottom: 16 },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: { color: Colors.textSecondary, fontSize: 14 },
  summaryValue: { color: Colors.text, fontSize: 14, fontWeight: '700' },
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  tierBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  tierBadgeText: { color: Colors.textInverse, fontSize: 11, fontWeight: '800' },
  bookButton: { marginTop: 16 },
  bottomPadding: { height: 100 },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.bgOverlay,
    justifyContent: 'flex-end',
  },
  ticketContainer: { padding: 20 },
  ticket: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ticketTop: { alignItems: 'center', paddingTop: 28, paddingBottom: 20 },
  ticketEmoji: { fontSize: 40, marginBottom: 8 },
  ticketTitle: { color: Colors.text, fontSize: 22, fontWeight: '800' },
  ticketSubtitle: { color: Colors.textSecondary, fontSize: 13, marginTop: 4 },
  ticketDashedLine: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 6,
  },
  dash: {
    width: 8,
    height: 2,
    backgroundColor: Colors.border,
    borderRadius: 1,
  },
  ticketDetails: { padding: 20 },
  ticketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  ticketLabel: { color: Colors.textSecondary, fontSize: 14 },
  ticketValue: { color: Colors.text, fontSize: 14, fontWeight: '700' },
  ticketQueueInfo: { paddingHorizontal: 20, marginBottom: 16, alignItems: 'center' },
  queueBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  queueBadgeText: { color: Colors.text, fontSize: 12, fontWeight: '700' },
  doneButton: { margin: 20, marginTop: 0 },
});
