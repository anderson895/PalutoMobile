import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../store/cart';
import { useAuth } from '../../store/auth';
import { Colors } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CartScreen() {
  const router = useRouter();
  const { items, totalItems, subtotal, deliveryFee, total, removeItem, updateQty, clearCart } = useCart();
  const { isLoggedIn } = useAuth();

  const handleCheckout = () => {
    if (!isLoggedIn) {
      Alert.alert('Login Required', 'Please log in to place an order.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => router.push('/auth/login') },
      ]);
      return;
    }
    router.push('/checkout');
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.topBar}>
          <Text style={styles.pageTitle}>My Cart</Text>
        </View>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySub}>Add some delicious Filipino dishes!</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => router.push('/(tabs)/menu')}>
            <Text style={styles.shopBtnText}>Browse Menu</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <Text style={styles.pageTitle}>My Cart <Text style={styles.countText}>({totalItems})</Text></Text>
        <TouchableOpacity onPress={() => Alert.alert('Clear Cart', 'Remove all items?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Clear', style: 'destructive', onPress: clearCart },
        ])}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Cart Items */}
        <View style={styles.itemsCard}>
          {items.map((item, idx) => (
            <View key={item.id}>
              <View style={styles.cartItem}>
                <Image
                  source={{ uri: item.image || `https://placehold.co/80x80/1E1E1E/E8462A?text=${encodeURIComponent(item.name)}` }}
                  style={styles.itemImg}
                />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.itemCat}>{item.category}</Text>
                  <Text style={styles.itemPrice}>₱{(item.price * item.qty).toFixed(2)}</Text>
                </View>
                <View style={styles.qtyControls}>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.id, item.qty - 1)}>
                    <Ionicons name={item.qty === 1 ? 'trash-outline' : 'remove'} size={14} color={item.qty === 1 ? Colors.error : Colors.text} />
                  </TouchableOpacity>
                  <Text style={styles.qtyNum}>{item.qty}</Text>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.id, item.qty + 1)}>
                    <Ionicons name="add" size={14} color={Colors.text} />
                  </TouchableOpacity>
                </View>
              </View>
              {idx < items.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {/* Order Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₱{subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            {deliveryFee === 0 ? (
              <Text style={styles.freeDelivery}>✨ FREE</Text>
            ) : (
              <Text style={styles.summaryValue}>₱{deliveryFee}</Text>
            )}
          </View>
          {deliveryFee > 0 && (
            <View style={styles.freeDeliveryNote}>
              <Text style={styles.freeDeliveryNoteText}>
                Add ₱{(500 - subtotal).toFixed(2)} more for free delivery
              </Text>
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₱{total.toFixed(2)}</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Checkout Button */}
      <View style={styles.checkoutBar}>
        <View style={styles.checkoutInfo}>
          <Text style={styles.checkoutTotal}>₱{total.toFixed(2)}</Text>
          <Text style={styles.checkoutItems}>{totalItems} item{totalItems !== 1 ? 's' : ''}</Text>
        </View>
        <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
          <Text style={styles.checkoutBtnText}>Checkout</Text>
          <Ionicons name="arrow-forward" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12 },
  pageTitle: { fontSize: 22, fontWeight: '800', color: Colors.text },
  countText: { color: Colors.text2, fontWeight: '600' },
  clearText: { fontSize: 13, color: Colors.error, fontWeight: '600' },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  emptySub: { fontSize: 14, color: Colors.text2, marginBottom: 24 },
  shopBtn: { backgroundColor: Colors.primary, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12 },
  shopBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  scroll: { flex: 1 },
  itemsCard: { margin: 16, backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  cartItem: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  itemImg: { width: 64, height: 64, borderRadius: 10 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 3 },
  itemCat: { fontSize: 11, color: Colors.primary, fontWeight: '600', marginBottom: 4 },
  itemPrice: { fontSize: 14, fontWeight: '700', color: Colors.text },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtyBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: Colors.bg2, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  qtyNum: { fontSize: 14, fontWeight: '700', color: Colors.text, minWidth: 20, textAlign: 'center' },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 14 },

  summaryCard: { marginHorizontal: 16, backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, padding: 16, gap: 10 },
  summaryTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 14, color: Colors.text2 },
  summaryValue: { fontSize: 14, color: Colors.text, fontWeight: '600' },
  freeDelivery: { fontSize: 14, color: Colors.success, fontWeight: '700' },
  freeDeliveryNote: { backgroundColor: 'rgba(34,197,94,0.08)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  freeDeliveryNoteText: { fontSize: 12, color: Colors.success },
  totalLabel: { fontSize: 16, fontWeight: '700', color: Colors.text },
  totalValue: { fontSize: 18, fontWeight: '800', color: Colors.primary },

  checkoutBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.card, borderTopWidth: 1, borderTopColor: Colors.border, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  checkoutInfo: {},
  checkoutTotal: { fontSize: 18, fontWeight: '800', color: Colors.text },
  checkoutItems: { fontSize: 12, color: Colors.text2 },
  checkoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  checkoutBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
