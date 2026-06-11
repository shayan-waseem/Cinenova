import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  TextInput,
  Animated,
  StatusBar,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../theme/colors';
import { setServerAddress, getServerAddress } from '../services/api';

export default function Header({ title, subtitle, userName, userTier, showBack, onBack }) {
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [hostInput, setHostInput] = useState('');
  const [portInput, setPortInput] = useState('');
  const [connected, setConnected] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Pulse the connection dot
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

  const handleTestConnection = async () => {
    const host = hostInput.trim() || 'localhost';
    const port = portInput.trim() || '3000';
    setServerAddress(host, port);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`http://${host}:${port}/api/movies`, { signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) {
        setConnected(true);
        setSettingsVisible(false);
      } else {
        setConnected(false);
      }
    } catch {
      setConnected(false);
    }
  };

  const openSettings = () => {
    const { host, port } = getServerAddress();
    setHostInput(host);
    setPortInput(port);
    setSettingsVisible(true);
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
      <LinearGradient colors={['#14141c', Colors.bg]} style={styles.container}>
        <View style={styles.topRow}>
          {showBack ? (
            <Pressable onPress={onBack} style={styles.backBtn}>
              <Text style={styles.backText}>← Back</Text>
            </Pressable>
          ) : (
            <View style={styles.userInfo}>
              {userName ? (
                <>
                  <Text style={styles.greeting}>Welcome,</Text>
                  <Text style={styles.userName}>{userName}</Text>
                  {userTier && (
                    <View style={[styles.tierBadge, { backgroundColor: userTier === 'VIP' ? Colors.gold : userTier === 'Premium' ? Colors.secondary : Colors.info }]}>
                      <Text style={styles.tierText}>{userTier}</Text>
                    </View>
                  )}
                </>
              ) : null}
            </View>
          )}
          <View style={styles.rightSection}>
            <Animated.View style={[styles.connectionDot, { backgroundColor: connected ? Colors.success : Colors.textMuted, opacity: pulseAnim }]} />
            <Pressable onPress={openSettings} style={styles.settingsBtn}>
              <Text style={styles.settingsIcon}>⚙️</Text>
            </Pressable>
          </View>
        </View>
        {title ? <Text style={styles.title}>{title}</Text> : null}
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </LinearGradient>

      {/* Server Settings Modal */}
      <Modal visible={settingsVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🖥️ Server Connection</Text>
            <Text style={styles.modalDesc}>
              Enter your computer's IP address to connect via Expo Go on a physical device.
            </Text>
            <Text style={styles.inputLabel}>Host / IP Address</Text>
            <TextInput
              style={styles.input}
              value={hostInput}
              onChangeText={setHostInput}
              placeholder="e.g. 192.168.1.50"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={styles.inputLabel}>Port</Text>
            <TextInput
              style={styles.input}
              value={portInput}
              onChangeText={setPortInput}
              placeholder="3000"
              placeholderTextColor={Colors.textMuted}
              keyboardType="number-pad"
            />
            <View style={styles.modalButtons}>
              <Pressable style={styles.modalCancelBtn} onPress={() => setSettingsVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalConnectBtn} onPress={handleTestConnection}>
                <LinearGradient colors={Colors.gradientPrimary} style={styles.modalConnectGrad}>
                  <Text style={styles.modalConnectText}>Test & Connect</Text>
                </LinearGradient>
              </Pressable>
            </View>
            {connected && <Text style={styles.connectedText}>✅ Connected successfully!</Text>}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  greeting: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginRight: 6,
  },
  userName: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  tierBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  tierText: {
    color: Colors.textInverse,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  settingsBtn: {
    padding: 4,
  },
  settingsIcon: {
    fontSize: 22,
  },
  backBtn: {
    paddingVertical: 4,
    paddingRight: 12,
  },
  backText: {
    color: Colors.secondary,
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    color: Colors.text,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: 4,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 2,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.bgOverlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: Colors.bgElevated,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  modalDesc: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 20,
  },
  inputLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: Colors.bgInput,
    borderRadius: 12,
    padding: 14,
    color: Colors.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  modalCancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalCancelText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  modalConnectBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalConnectGrad: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  modalConnectText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  connectedText: {
    color: Colors.success,
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '600',
  },
});
