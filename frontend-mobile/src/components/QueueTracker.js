import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../theme/colors';

/**
 * QueueTracker — visual step progress showing the user's position in a
 * backend OS scheduling queue. Animates the active step with a pulsing glow.
 *
 * Props:
 *   steps: Array of { label: string, status: 'done' | 'active' | 'pending' }
 *   algorithmName: string (e.g. "FCFS", "SJF", "Priority")
 */
export default function QueueTracker({ steps = [], algorithmName }) {
  return (
    <View style={styles.container}>
      {algorithmName && (
        <View style={styles.algoHeader}>
          <Text style={styles.algoLabel}>Queue Algorithm</Text>
          <View style={styles.algoBadge}>
            <Text style={styles.algoText}>{algorithmName}</Text>
          </View>
        </View>
      )}
      <View style={styles.stepsRow}>
        {steps.map((step, idx) => (
          <React.Fragment key={idx}>
            <StepNode step={step} index={idx} />
            {idx < steps.length - 1 && (
              <View
                style={[
                  styles.connector,
                  step.status === 'done' && styles.connectorDone,
                ]}
              />
            )}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

function StepNode({ step, index }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entry animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 200,
      delay: index * 120,
      useNativeDriver: true,
    }).start();

    // Pulse active step
    if (step.status === 'active') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [step.status, index, pulseAnim, scaleAnim]);

  const isDone = step.status === 'done';
  const isActive = step.status === 'active';

  return (
    <Animated.View style={[styles.stepContainer, { transform: [{ scale: scaleAnim }] }]}>
      <Animated.View style={isActive ? { transform: [{ scale: pulseAnim }] } : undefined}>
        {isActive ? (
          <LinearGradient colors={Colors.gradientPrimary} style={styles.stepCircle}>
            <Text style={styles.stepIcon}>⏳</Text>
          </LinearGradient>
        ) : (
          <View
            style={[
              styles.stepCircle,
              isDone ? styles.stepDone : styles.stepPending,
            ]}
          >
            <Text style={styles.stepIcon}>
              {isDone ? '✓' : '○'}
            </Text>
          </View>
        )}
      </Animated.View>
      <Text
        style={[
          styles.stepLabel,
          isDone && styles.stepLabelDone,
          isActive && styles.stepLabelActive,
        ]}
        numberOfLines={2}
      >
        {step.label}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  algoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  algoLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  algoBadge: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  algoText: {
    color: Colors.secondary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  stepContainer: {
    alignItems: 'center',
    width: 64,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  stepDone: {
    backgroundColor: Colors.success,
  },
  stepPending: {
    backgroundColor: Colors.bgElevated,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  stepIcon: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  stepLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 13,
  },
  stepLabelDone: {
    color: Colors.success,
  },
  stepLabelActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  connector: {
    height: 2,
    flex: 1,
    backgroundColor: Colors.border,
    marginTop: 18,
    marginHorizontal: -4,
    borderRadius: 1,
  },
  connectorDone: {
    backgroundColor: Colors.success,
  },
});
