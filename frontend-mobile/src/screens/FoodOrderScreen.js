import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../theme/colors';
import Header from '../components/Header';
import AnimatedButton from '../components/AnimatedButton';
import { createFoodOrder, FOOD_MENU } from '../services/api';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function FoodOrderScreen({ route }) {
  const { userName, userTier } = route.params || {};
  const [cart, setCart] = useState({});
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const successAnim = useRef(new Animated.Value(0)).current;

  const addToCart = (item) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    setCart((prev) => ({
      ...prev,
      [item.name]: (prev[item.name] || 0) + 1,
    }));
  };

  const removeFromCart = (item) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[item.name] > 1) {
        newCart[item.name] -= 1;
      } else {
        delete newCart[item.name];
      }
      return newCart;
    });
  };

  const cartItems = Object.entries(cart);
  const totalItems = cartItems.reduce((sum, [, qty]) => sum + qty, 0);
  const totalPrice = cartItems.reduce((sum, [name, qty]) => {
    const menuItem = FOOD_MENU.find((m) => m.name === name);
    return sum + (menuItem ? menuItem.price * qty : 0);
  }, 0);
  const totalPrepTime = cartItems.reduce((max, [name]) => {
    const menuItem = FOOD_MENU.find((m) => m.name === name);
    return Math.max(max, menuItem ? menuItem.preparationTime : 0);
  }, 0);

  const handleOrder = async () => {
    if (totalItems === 0) return;

    const itemsStr = cartItems.map(([name, qty]) => `${qty}x ${name}`).join(', ');
    try {
      const result = await createFoodOrder({
        userName,
        items: itemsStr,
        preparationTime: totalPrepTime,
        priorityLabel: userTier,
      });
      setLastOrder(result);
    } catch {
      setLastOrder({
        orderId: 'F' + String(Math.floor(Math.random() * 900) + 100),
        items: itemsStr,
        preparationTime: totalPrepTime,
        priorityLabel: userTier,
        status: 'Pending',
      });
    }

    setOrderPlaced(true);
    setCart({});

    Animated.sequence([
      Animated.spring(successAnim, { toValue: 1, friction: 4, tension: 100, useNativeDriver: true }),
      Animated.delay(3000),
      Animated.timing(successAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setOrderPlaced(false));
  };

  return (
    <View style={styles.container}>
      <Header
        title="🍿 Snack Bar"
        subtitle="Order food — SJF scheduling by prep time"
        userName={userName}
        userTier={userTier}
      />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Menu Grid */}
        <View style={styles.menuGrid}>
          {FOOD_MENU.map((item, index) => (
            <FoodCard
              key={item.name}
              item={item}
              quantity={cart[item.name] || 0}
              onAdd={() => addToCart(item)}
              onRemove={() => removeFromCart(item)}
              index={index}
            />
          ))}
        </View>

        {/* Cart Summary */}
        {totalItems > 0 && (
          <View style={styles.cartSection}>
            <LinearGradient colors={Colors.gradientCard} style={styles.cartCard}>
              <Text style={styles.cartTitle}>🛒 Your Order</Text>
              {cartItems.map(([name, qty]) => {
                const menuItem = FOOD_MENU.find((m) => m.name === name);
                return (
                  <View key={name} style={styles.cartRow}>
                    <Text style={styles.cartItemName}>
                      {menuItem?.emoji} {name} × {qty}
                    </Text>
                    <Text style={styles.cartItemPrice}>Rs. {menuItem ? menuItem.price * qty : 0}</Text>
                  </View>
                );
              })}
              <View style={styles.cartDivider} />
              <View style={styles.cartRow}>
                <Text style={styles.cartTotalLabel}>Total</Text>
                <Text style={styles.cartTotalValue}>Rs. {totalPrice}</Text>
              </View>
              <View style={styles.cartRow}>
                <Text style={styles.cartPrepLabel}>Max Prep Time (SJF)</Text>
                <Text style={styles.cartPrepValue}>{totalPrepTime} min</Text>
              </View>
              <View style={styles.cartRow}>
                <Text style={styles.cartPrepLabel}>Queue Priority</Text>
                <Text style={[styles.cartPrepValue, { color: Colors.secondary }]}>
                  {userTier} — P{userTier === 'VIP' ? '1' : userTier === 'Premium' ? '2' : '3'}
                </Text>
              </View>
              <AnimatedButton
                title="Place Order"
                onPress={handleOrder}
                icon="✅"
                style={styles.orderButton}
                gradient={Colors.gradientPrimary}
              />
            </LinearGradient>
          </View>
        )}

        {/* Success Banner */}
        {orderPlaced && (
          <Animated.View
            style={[
              styles.successBanner,
              { opacity: successAnim, transform: [{ scale: successAnim }] },
            ]}
          >
            <LinearGradient colors={['#065f46', '#064e3b']} style={styles.successGrad}>
              <Text style={styles.successEmoji}>✅</Text>
              <Text style={styles.successText}>Order placed! Entering SJF kitchen queue...</Text>
              <Text style={styles.successSub}>
                ID: ***{lastOrder?.orderId?.slice(-3) || '---'}
              </Text>
            </LinearGradient>
          </Animated.View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

function FoodCard({ item, quantity, onAdd, onRemove, index }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, index]);

  return (
    <Animated.View
      style={[
        styles.foodCard,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        quantity > 0 && styles.foodCardActive,
      ]}
    >
      <Text style={styles.foodEmoji}>{item.emoji}</Text>
      <Text style={styles.foodName}>{item.name}</Text>
      <View style={styles.foodMeta}>
        <Text style={styles.foodPrep}>⏱ {item.preparationTime} min</Text>
        <Text style={styles.foodPrice}>Rs. {item.price}</Text>
      </View>
      <View style={styles.qtyRow}>
        {quantity > 0 && (
          <Pressable onPress={onRemove} style={styles.qtyBtn}>
            <Text style={styles.qtyBtnText}>−</Text>
          </Pressable>
        )}
        {quantity > 0 && <Text style={styles.qtyText}>{quantity}</Text>}
        <Pressable onPress={onAdd} style={[styles.qtyBtn, styles.qtyBtnAdd]}>
          <Text style={styles.qtyBtnText}>+</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    paddingTop: 8,
  },
  foodCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 14,
    margin: 6,
    width: '46%',
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  foodCardActive: {
    borderColor: Colors.secondary,
    backgroundColor: 'rgba(124, 58, 237, 0.06)',
  },
  foodEmoji: { fontSize: 36, marginBottom: 8 },
  foodName: { color: Colors.text, fontSize: 14, fontWeight: '700', textAlign: 'center', marginBottom: 6 },
  foodMeta: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  foodPrep: { color: Colors.textMuted, fontSize: 11 },
  foodPrice: { color: Colors.gold, fontSize: 11, fontWeight: '700' },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  qtyBtnAdd: {
    backgroundColor: 'rgba(229, 9, 20, 0.15)',
    borderColor: Colors.primary,
  },
  qtyBtnText: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  qtyText: { color: Colors.text, fontSize: 16, fontWeight: '800', minWidth: 20, textAlign: 'center' },
  // Cart
  cartSection: { paddingHorizontal: 20, marginTop: 8 },
  cartCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cartTitle: { color: Colors.text, fontSize: 18, fontWeight: '800', marginBottom: 14 },
  cartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cartItemName: { color: Colors.textSecondary, fontSize: 14 },
  cartItemPrice: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  cartDivider: { height: 1, backgroundColor: Colors.border, marginVertical: 10 },
  cartTotalLabel: { color: Colors.text, fontSize: 16, fontWeight: '800' },
  cartTotalValue: { color: Colors.gold, fontSize: 18, fontWeight: '800' },
  cartPrepLabel: { color: Colors.textMuted, fontSize: 12 },
  cartPrepValue: { color: Colors.text, fontSize: 12, fontWeight: '700' },
  orderButton: { marginTop: 16 },
  // Success
  successBanner: { marginHorizontal: 20, marginTop: 16 },
  successGrad: {
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
  },
  successEmoji: { fontSize: 32, marginBottom: 6 },
  successText: { color: Colors.success, fontSize: 15, fontWeight: '700', textAlign: 'center' },
  successSub: { color: Colors.textSecondary, fontSize: 12, marginTop: 4 },
  bottomPadding: { height: 120 },
});
