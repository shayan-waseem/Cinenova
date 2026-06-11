import React, { useState, useCallback, useRef, useEffect } from 'react';
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
import QueueTracker from '../components/QueueTracker';
import { fetchBookings, fetchFoodOrders, fetchComplaints } from '../services/api';

export default function WalletScreen({ route }) {
  const { userName, userTier } = route.params || {};
  const [bookings, setBookings] = useState([]);
  const [foodOrders, setFoodOrders] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSection, setActiveSection] = useState('tickets');

  const loadData = useCallback(async () => {
    try {
      const [bData, fData, cData] = await Promise.all([
        fetchBookings().catch(() => []),
        fetchFoodOrders().catch(() => []),
        fetchComplaints().catch(() => []),
      ]);
      // Filter by userName or show all (backend doesn't filter by user in this demo)
      setBookings(bData);
      setFoodOrders(fData);
      setComplaints(cData);
    } catch {
      // Offline — keep empty
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // Build queue tracker steps based on live data
  const buildBookingSteps = () => {
    if (bookings.length === 0) return [];
    return bookings.slice(0, 5).map((b, i) => ({
      label: b.userName?.split(' ')[0] || `B${i}`,
      status: i === 0 ? 'done' : i === 1 ? 'active' : 'pending',
    }));
  };

  const buildFoodSteps = () => {
    if (foodOrders.length === 0) return [];
    return foodOrders.slice(0, 5).map((f) => ({
      label: f.items?.split(' ')[0] || 'Order',
      status: f.status === 'Completed' ? 'done' : f.status === 'Processing' ? 'active' : 'pending',
    }));
  };

  const buildComplaintSteps = () => {
    if (complaints.length === 0) return [];
    return complaints.slice(0, 5).map((c) => ({
      label: c.complaintType?.split(' ')[0] || 'Ticket',
      status: c.status === 'Resolved' ? 'done' : c.status === 'In Progress' ? 'active' : 'pending',
    }));
  };

  const sections = [
    { key: 'tickets', emoji: '🎫', label: 'Tickets' },
    { key: 'food', emoji: '🍿', label: 'Food' },
    { key: 'support', emoji: '🎧', label: 'Support' },
  ];

  return (
    <View style={styles.container}>
      <Header
        title="💼 My Wallet"
        subtitle="Track your bookings, orders & queue positions"
        userName={userName}
        userTier={userTier}
      />

      {/* Section Tabs */}
      <View style={styles.tabRow}>
        {sections.map((sec) => (
          <Pressable
            key={sec.key}
            onPress={() => setActiveSection(sec.key)}
            style={[styles.tabBtn, activeSection === sec.key && styles.tabBtnActive]}
          >
            <Text style={styles.tabEmoji}>{sec.emoji}</Text>
            <Text style={[styles.tabLabel, activeSection === sec.key && styles.tabLabelActive]}>
              {sec.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
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
        {/* ========== TICKETS SECTION ========== */}
        {activeSection === 'tickets' && (
          <>
            {/* Queue Tracker */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📊 Booking Queue — Live Status</Text>
              <QueueTracker steps={buildBookingSteps()} algorithmName="FCFS + Priority" />
            </View>

            {/* Booking Cards */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎫 Your Tickets</Text>
              {bookings.length === 0 ? (
                <EmptyState emoji="🎬" text="No bookings yet" />
              ) : (
                bookings.map((b, idx) => (
                  <AnimatedCard key={b.bookingId || idx} index={idx}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardEmoji}>🎬</Text>
                      <View style={styles.cardHeaderInfo}>
                        <Text style={styles.cardTitle}>{b.movieTitle}</Text>
                        <Text style={styles.cardSub}>Seat {b.seatNumber} • {b.time}</Text>
                      </View>
                      <TypeBadge type={b.bookingType} />
                    </View>
                    <View style={styles.cardFooter}>
                      <Text style={styles.cardId}>ID: ***{b.bookingId?.slice(-3) || '---'}</Text>
                      <Text style={styles.cardOrder}>Queue #{b.arrivalOrder}</Text>
                    </View>
                  </AnimatedCard>
                ))
              )}
            </View>
          </>
        )}

        {/* ========== FOOD SECTION ========== */}
        {activeSection === 'food' && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📊 Kitchen Queue — Live Status</Text>
              <QueueTracker steps={buildFoodSteps()} algorithmName="SJF (Shortest Job First)" />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🍿 Your Orders</Text>
              {foodOrders.length === 0 ? (
                <EmptyState emoji="🍕" text="No food orders yet" />
              ) : (
                foodOrders.map((f, idx) => (
                  <AnimatedCard key={f.orderId || idx} index={idx}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardEmoji}>🍿</Text>
                      <View style={styles.cardHeaderInfo}>
                        <Text style={styles.cardTitle}>{f.items}</Text>
                        <Text style={styles.cardSub}>Prep: {f.preparationTime} min</Text>
                      </View>
                      <StatusBadge status={f.status} />
                    </View>
                    <View style={styles.cardFooter}>
                      <Text style={styles.cardId}>ID: ***{f.orderId?.slice(-3) || '---'}</Text>
                      <TypeBadge type={f.priorityLabel} />
                    </View>
                  </AnimatedCard>
                ))
              )}
            </View>
          </>
        )}

        {/* ========== SUPPORT SECTION ========== */}
        {activeSection === 'support' && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📊 Support Queue — Live Status</Text>
              <QueueTracker steps={buildComplaintSteps()} algorithmName="Priority Scheduling" />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎧 Your Tickets</Text>
              {complaints.length === 0 ? (
                <EmptyState emoji="🎧" text="No support tickets yet" />
              ) : (
                complaints.map((c, idx) => (
                  <AnimatedCard key={c.complaintId || idx} index={idx}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardEmoji}>🎧</Text>
                      <View style={styles.cardHeaderInfo}>
                        <Text style={styles.cardTitle}>{c.complaintType}</Text>
                        <Text style={styles.cardSub}>{c.userName} • {c.submittedAt}</Text>
                      </View>
                      <StatusBadge status={c.status} />
                    </View>
                    <View style={styles.cardFooter}>
                      <Text style={styles.cardId}>ID: ***{c.complaintId?.slice(-3) || '---'}</Text>
                      <PriorityBadge priority={c.priority} />
                    </View>
                  </AnimatedCard>
                ))
              )}
            </View>
          </>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

// ---- Sub-components ----

function AnimatedCard({ children, index }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(25)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay: index * 80, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, delay: index * 80, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim, index]);

  return (
    <Animated.View
      style={[
        styles.card,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {children}
    </Animated.View>
  );
}

function TypeBadge({ type }) {
  const color = type === 'VIP' ? Colors.gold : type === 'Premium' ? Colors.secondary : Colors.info;
  return (
    <View style={[styles.badge, { backgroundColor: `${color}20` }]}>
      <Text style={[styles.badgeText, { color }]}>{type}</Text>
    </View>
  );
}

function StatusBadge({ status }) {
  const color = status === 'Completed' || status === 'Resolved' ? Colors.success
    : status === 'Processing' || status === 'In Progress' ? Colors.warning
    : Colors.textMuted;
  return (
    <View style={[styles.badge, { backgroundColor: `${color}20` }]}>
      <Text style={[styles.badgeText, { color }]}>{status}</Text>
    </View>
  );
}

function PriorityBadge({ priority }) {
  const label = priority === 1 ? 'Critical' : priority === 2 ? 'Medium' : 'Low';
  const color = priority === 1 ? Colors.priorityCritical : priority === 2 ? Colors.priorityMedium : Colors.priorityLow;
  return (
    <View style={[styles.badge, { backgroundColor: `${color}20` }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

function EmptyState({ emoji, text }) {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>{emoji}</Text>
      <Text style={styles.emptyText}>{text}</Text>
      <Text style={styles.emptyHint}>Pull down to refresh</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 10,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgCard,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  tabBtnActive: {
    borderColor: Colors.secondary,
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
  },
  tabEmoji: { fontSize: 16 },
  tabLabel: { color: Colors.textMuted, fontSize: 13, fontWeight: '700' },
  tabLabelActive: { color: Colors.text },
  section: { paddingHorizontal: 20, marginTop: 16 },
  sectionTitle: { color: Colors.text, fontSize: 18, fontWeight: '800', marginBottom: 14 },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cardEmoji: { fontSize: 28, marginRight: 12 },
  cardHeaderInfo: { flex: 1 },
  cardTitle: { color: Colors.text, fontSize: 15, fontWeight: '700' },
  cardSub: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardId: { color: Colors.textMuted, fontSize: 11, fontWeight: '600' },
  cardOrder: { color: Colors.textMuted, fontSize: 11 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  emptyContainer: { alignItems: 'center', paddingVertical: 40 },
  emptyEmoji: { fontSize: 40, marginBottom: 10 },
  emptyText: { color: Colors.textMuted, fontSize: 15, fontWeight: '600' },
  emptyHint: { color: Colors.textMuted, fontSize: 12, marginTop: 4 },
  bottomPadding: { height: 120 },
});
