import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../theme/colors';

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const SEATS_PER_ROW = 10;

export default function SeatGrid({ selectedSeat, onSelectSeat, bookedSeats = [] }) {
  return (
    <View style={styles.container}>
      {/* Cinema Screen Visualization */}
      <View style={styles.screenContainer}>
        <LinearGradient
          colors={Colors.gradientScreen}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.screen}
        >
          <Text style={styles.screenText}>SCREEN</Text>
        </LinearGradient>
        <LinearGradient
          colors={['rgba(124,58,237,0.3)', 'transparent']}
          style={styles.screenGlow}
        />
      </View>

      {/* Seat Grid */}
      <ScrollView showsVerticalScrollIndicator={false} style={styles.gridScroll}>
        {ROWS.map((row) => (
          <View key={row} style={styles.row}>
            <Text style={styles.rowLabel}>{row}</Text>
            {Array.from({ length: SEATS_PER_ROW }, (_, i) => {
              const seatId = `${row}${i + 1}`;
              const isBooked = bookedSeats.includes(seatId);
              const isSelected = selectedSeat === seatId;
              const isVIPRow = row === 'D' || row === 'E';

              return (
                <SeatButton
                  key={seatId}
                  seatId={seatId}
                  isBooked={isBooked}
                  isSelected={isSelected}
                  isVIP={isVIPRow}
                  onSelect={onSelectSeat}
                />
              );
            })}
            <Text style={styles.rowLabel}>{row}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Legend */}
      <View style={styles.legend}>
        <LegendItem color={Colors.seatAvailable} label="Available" />
        <LegendItem color={Colors.seatSelected} label="Selected" />
        <LegendItem color={Colors.seatBooked} label="Booked" />
        <LegendItem color={Colors.seatVIP} label="VIP Row" />
      </View>
    </View>
  );
}

function SeatButton({ seatId, isBooked, isSelected, isVIP, onSelect }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (isBooked) return;
    // Bouncy scale animation
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.35,
        friction: 3,
        tension: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 200,
        useNativeDriver: true,
      }),
    ]).start();
    onSelect(seatId);
  };

  let bgColor = Colors.seatAvailable;
  if (isSelected) bgColor = Colors.seatSelected;
  else if (isBooked) bgColor = Colors.seatBooked;
  else if (isVIP) bgColor = 'rgba(251, 191, 36, 0.15)';

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={handlePress}
        style={[
          styles.seat,
          { backgroundColor: bgColor },
          isSelected && styles.seatSelectedBorder,
          isVIP && !isSelected && !isBooked && styles.seatVIPBorder,
        ]}
      >
        <Text style={[styles.seatText, isBooked && styles.seatBookedText]}>
          {isBooked ? '✕' : isSelected ? '✓' : ''}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

function LegendItem({ color, label }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  screenContainer: {
    width: '85%',
    alignItems: 'center',
    marginBottom: 24,
  },
  screen: {
    width: '100%',
    height: 32,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenText: {
    color: Colors.text,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 4,
  },
  screenGlow: {
    width: '110%',
    height: 30,
    marginTop: -4,
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100,
  },
  gridScroll: {
    maxHeight: 320,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  rowLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    width: 18,
    textAlign: 'center',
  },
  seat: {
    width: 28,
    height: 28,
    borderRadius: 6,
    margin: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seatSelectedBorder: {
    borderWidth: 2,
    borderColor: Colors.secondaryLight,
  },
  seatVIPBorder: {
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  seatText: {
    color: Colors.text,
    fontSize: 10,
    fontWeight: '700',
  },
  seatBookedText: {
    color: 'rgba(255,100,100,0.5)',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 3,
    marginRight: 5,
  },
  legendLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
  },
});
