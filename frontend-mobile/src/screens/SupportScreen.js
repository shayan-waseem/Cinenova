import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../theme/colors';
import Header from '../components/Header';
import AnimatedButton from '../components/AnimatedButton';
import { createComplaint } from '../services/api';

const COMPLAINT_TYPES = [
  { key: 'Payment Failure', emoji: '💳', priority: 'Critical' },
  { key: 'Ticket Cancellation', emoji: '🎟️', priority: 'Critical' },
  { key: 'Refund Request', emoji: '💰', priority: 'Critical' },
  { key: 'Seat Issue', emoji: '💺', priority: 'Medium' },
  { key: 'App Bug', emoji: '🐛', priority: 'Medium' },
  { key: 'Food Quality', emoji: '🍔', priority: 'Medium' },
  { key: 'General Inquiry', emoji: '❓', priority: 'Low' },
  { key: 'Feedback', emoji: '📝', priority: 'Low' },
];

export default function SupportScreen({ route }) {
  const { userName, userTier } = route.params || {};
  const [selectedType, setSelectedType] = useState(null);
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submittedTickets, setSubmittedTickets] = useState([]);
  const successAnim = useRef(new Animated.Value(0)).current;

  const handleSubmit = async () => {
    if (!selectedType) return;

    const complaintItem = COMPLAINT_TYPES.find((c) => c.key === selectedType);
    const priorityText = complaintItem ? complaintItem.priority : 'Low';

    let result;
    try {
      result = await createComplaint({
        userName,
        complaintType: selectedType,
        priorityText,
      });
    } catch {
      result = {
        complaintId: 'C' + String(Math.floor(Math.random() * 900) + 100),
        complaintType: selectedType,
        priority: priorityText === 'Critical' ? 1 : priorityText === 'Medium' ? 2 : 3,
        status: 'Open',
        submittedAt: new Date().toLocaleTimeString(),
      };
    }

    setSubmittedTickets((prev) => [result, ...prev]);
    setSelectedType(null);
    setDescription('');
    setSubmitted(true);

    Animated.sequence([
      Animated.spring(successAnim, { toValue: 1, friction: 4, tension: 100, useNativeDriver: true }),
      Animated.delay(3000),
      Animated.timing(successAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setSubmitted(false));
  };

  return (
    <View style={styles.container}>
      <Header
        title="🎧 Support"
        subtitle="Submit tickets — Priority scheduling"
        userName={userName}
        userTier={userTier}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Complaint Type Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Issue Type</Text>
            <View style={styles.typeGrid}>
              {COMPLAINT_TYPES.map((type) => {
                const isSelected = selectedType === type.key;
                const priorityColor =
                  type.priority === 'Critical' ? Colors.priorityCritical :
                  type.priority === 'Medium' ? Colors.priorityMedium : Colors.priorityLow;
                return (
                  <Pressable
                    key={type.key}
                    onPress={() => setSelectedType(type.key)}
                    style={[
                      styles.typeCard,
                      isSelected && { borderColor: priorityColor, backgroundColor: `${priorityColor}10` },
                    ]}
                  >
                    <Text style={styles.typeEmoji}>{type.emoji}</Text>
                    <Text style={[styles.typeLabel, isSelected && { color: Colors.text }]}>
                      {type.key}
                    </Text>
                    <View style={[styles.priorityDot, { backgroundColor: priorityColor }]}>
                      <Text style={styles.priorityDotText}>{type.priority[0]}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Description */}
          {selectedType && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Additional Details (Optional)</Text>
              <TextInput
                style={styles.textArea}
                value={description}
                onChangeText={(text) => setDescription(text.slice(0, 500))}
                placeholder="Describe your issue..."
                placeholderTextColor={Colors.textMuted}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <View style={styles.queueInfoRow}>
                <Text style={styles.queueInfoLabel}>Queue Algorithm:</Text>
                <Text style={styles.queueInfoValue}>
                  {COMPLAINT_TYPES.find((c) => c.key === selectedType)?.priority === 'Critical'
                    ? 'Priority Scheduling (P1)'
                    : 'FCFS + Priority'}
                </Text>
              </View>
              <AnimatedButton
                title="Submit Ticket"
                onPress={handleSubmit}
                icon="📨"
                gradient={Colors.gradientPrimary}
                style={styles.submitBtn}
              />
            </View>
          )}

          {/* Success Banner */}
          {submitted && (
            <Animated.View
              style={[
                styles.successBanner,
                { opacity: successAnim, transform: [{ scale: successAnim }] },
              ]}
            >
              <LinearGradient colors={['#065f46', '#064e3b']} style={styles.successGrad}>
                <Text style={styles.successEmoji}>✅</Text>
                <Text style={styles.successText}>Ticket submitted! Entering support queue...</Text>
              </LinearGradient>
            </Animated.View>
          )}

          {/* Submitted Tickets */}
          {submittedTickets.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📋 Your Tickets</Text>
              {submittedTickets.map((ticket, idx) => {
                const priorityLabel =
                  ticket.priority === 1 ? 'Critical' : ticket.priority === 2 ? 'Medium' : 'Low';
                const priorityColor =
                  ticket.priority === 1 ? Colors.priorityCritical :
                  ticket.priority === 2 ? Colors.priorityMedium : Colors.priorityLow;
                return (
                  <View key={idx} style={styles.ticketCard}>
                    <View style={styles.ticketHeader}>
                      <Text style={styles.ticketId}>***{ticket.complaintId?.slice(-3) || '---'}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: ticket.status === 'Open' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)' }]}>
                        <Text style={[styles.statusText, { color: ticket.status === 'Open' ? Colors.warning : Colors.success }]}>
                          {ticket.status}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.ticketType}>{ticket.complaintType}</Text>
                    <View style={styles.ticketMeta}>
                      <View style={[styles.priorityBadge, { backgroundColor: `${priorityColor}20` }]}>
                        <Text style={[styles.priorityBadgeText, { color: priorityColor }]}>
                          {priorityLabel}
                        </Text>
                      </View>
                      <Text style={styles.ticketTime}>{ticket.submittedAt}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  flex: { flex: 1 },
  scroll: { flex: 1 },
  section: { paddingHorizontal: 20, marginBottom: 16 },
  sectionTitle: { color: Colors.text, fontSize: 18, fontWeight: '800', marginBottom: 14 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typeCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    padding: 14,
    width: '47%',
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    position: 'relative',
  },
  typeEmoji: { fontSize: 28, marginBottom: 6 },
  typeLabel: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600', textAlign: 'center' },
  priorityDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priorityDotText: { color: Colors.text, fontSize: 9, fontWeight: '800' },
  textArea: {
    backgroundColor: Colors.bgInput,
    borderRadius: 14,
    padding: 14,
    color: Colors.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 100,
    marginBottom: 12,
  },
  queueInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  queueInfoLabel: { color: Colors.textMuted, fontSize: 12 },
  queueInfoValue: { color: Colors.secondary, fontSize: 12, fontWeight: '700' },
  submitBtn: { marginTop: 4 },
  // Success
  successBanner: { marginHorizontal: 20, marginBottom: 16 },
  successGrad: { borderRadius: 14, padding: 20, alignItems: 'center' },
  successEmoji: { fontSize: 32, marginBottom: 6 },
  successText: { color: Colors.success, fontSize: 15, fontWeight: '700', textAlign: 'center' },
  // Tickets
  ticketCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  ticketId: { color: Colors.textMuted, fontSize: 12, fontWeight: '600' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '700' },
  ticketType: { color: Colors.text, fontSize: 15, fontWeight: '700', marginBottom: 8 },
  ticketMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priorityBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  priorityBadgeText: { fontSize: 11, fontWeight: '700' },
  ticketTime: { color: Colors.textMuted, fontSize: 11 },
  bottomPadding: { height: 120 },
});
