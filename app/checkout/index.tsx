import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useCart } from '../../store/cart';
import { useAuth } from '../../store/auth';
import { Colors } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

const PAYMENT_OPTIONS = [
  { value: 'cod', label: 'Cash on Delivery', icon: 'cash-outline', desc: 'Pay when your order arrives' },
  { value: 'gcash', label: 'GCash', icon: 'phone-portrait-outline', desc: 'Pay via GCash mobile wallet' },
  { value: 'bank', label: 'Bank Transfer', icon: 'business-outline', desc: 'Pay via online banking' },
];

export default function CheckoutScreen() {
  const router = useRouter();
  const { items, subtotal, deliveryFee, total, clearCart } = useCart();
  const { user, profile } = useAuth();
  const [form, setForm] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
    address: '',
    notes: '',
    payment: 'cod',
  });
  const [placing, setPlacing] = useState(false);

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const placeOrder = async () => {
    if (!form.name || !form.phone || !form.address) {
      Alert.alert('Missing Info', 'Please fill in your name, phone, and delivery address.');
      return;
    }
    setPlacing(true);
    try {
      const ref = await addDoc(collection(db, 'orders'), {
        userId: user?.uid,
        userName: form.name,
        userPhone: form.phone,
        userEmail: user?.email,
        address: form.address,
        notes: form.notes,
        payment: form.payment,
        items: items.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty, image: i.image || '' })),
        subtotal,
        deliveryFee,
        total,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      clearCart();
      router.replace('/orders');
      setTimeout(() => Alert.alert('Order Placed! 🎉', `Order #${ref.id.slice(-8).toUpperCase()} confirmed!\n\nWe'll prepare your food right away.`), 300);
    } catch (e: any) {
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Checkout</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Delivery Details */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              <Ionicons name="location-outline" size={16} color={Colors.primary} /> Delivery Details
            </Text>
            <View style={styles.fieldRow}>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Full Name *</Text>
                <TextInput style={styles.input} value={form.name} onChangeText={v => set('name', v)} placeholder="Juan Dela Cruz" placeholderTextColor={Colors.text3} />
              </View>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Phone *</Text>
                <TextInput style={styles.input} value={form.phone} onChangeText={v => set('phone', v)} placeholder="+63..." placeholderTextColor={Colors.text3} keyboardType="phone-pad" />
              </View>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Delivery Address *</Text>
              <TextInput style={styles.input} value={form.address} onChangeText={v => set('address', v)} placeholder="Street, Barangay, City" placeholderTextColor={Colors.text3} />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Special Instructions</Text>
              <TextInput style={[styles.input, styles.textArea]} value={form.notes} onChangeText={v => set('notes', v)} placeholder="Allergy info, extra spicy, no onions..." placeholderTextColor={Colors.text3} multiline numberOfLines={3} />
            </View>
          </View>

          {/* Payment */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              <Ionicons name="card-outline" size={16} color={Colors.primary} /> Payment Method
            </Text>
            {PAYMENT_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.payOpt, form.payment === opt.value && styles.payOptActive]}
                onPress={() => set('payment', opt.value)}
              >
                <View style={[styles.payIcon, form.payment === opt.value && styles.payIconActive]}>
                  <Ionicons name={opt.icon as any} size={18} color={form.payment === opt.value ? Colors.primary : Colors.text3} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.payLabel, form.payment === opt.value && styles.payLabelActive]}>{opt.label}</Text>
                  <Text style={styles.payDesc}>{opt.desc}</Text>
                </View>
                {form.payment === opt.value && <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>

          {/* Order Summary */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              <Ionicons name="receipt-outline" size={16} color={Colors.primary} /> Order Summary
            </Text>
            {items.map(item => (
              <View key={item.id} style={styles.summaryItem}>
                <Image source={{ uri: item.image || `https://placehold.co/48x48/1E1E1E/E8462A?text=${encodeURIComponent(item.name[0])}` }} style={styles.summaryImg} />
                <Text style={styles.summaryName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.summaryQty}>x{item.qty}</Text>
                <Text style={styles.summaryPrice}>₱{(item.price * item.qty).toFixed(2)}</Text>
              </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.priceRow}><Text style={styles.priceLabel}>Subtotal</Text><Text style={styles.priceVal}>₱{subtotal.toFixed(2)}</Text></View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Delivery Fee</Text>
              {deliveryFee === 0 ? <Text style={styles.free}>✨ FREE</Text> : <Text style={styles.priceVal}>₱{deliveryFee}</Text>}
            </View>
            <View style={styles.divider} />
            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalVal}>₱{total.toFixed(2)}</Text>
            </View>
          </View>

          <TouchableOpacity style={[styles.placeBtn, placing && styles.placeBtnDisabled]} onPress={placeOrder} disabled={placing || items.length === 0}>
            {placing ? <ActivityIndicator color="#fff" /> : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                <Text style={styles.placeBtnText}>Place Order · ₱{total.toFixed(2)}</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.secureNote}>🔒 Your order is secure and encrypted</Text>
          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  pageTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: Colors.text },

  scroll: { padding: 16, gap: 14 },

  card: { backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, padding: 16, gap: 12 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 4 },

  fieldRow: { flexDirection: 'row', gap: 10 },
  field: { gap: 5 },
  label: { fontSize: 12, fontWeight: '600', color: Colors.text2 },
  input: { backgroundColor: Colors.bg2, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: Colors.text, fontSize: 14 },
  textArea: { height: 70, textAlignVertical: 'top' },

  payOpt: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bg2 },
  payOptActive: { borderColor: Colors.primary, backgroundColor: 'rgba(232,70,42,0.08)' },
  payIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center' },
  payIconActive: { backgroundColor: 'rgba(232,70,42,0.15)' },
  payLabel: { fontSize: 14, fontWeight: '600', color: Colors.text },
  payLabelActive: { color: Colors.primary },
  payDesc: { fontSize: 11, color: Colors.text3, marginTop: 2 },

  summaryItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  summaryImg: { width: 40, height: 40, borderRadius: 8 },
  summaryName: { flex: 1, fontSize: 13, color: Colors.text },
  summaryQty: { fontSize: 13, color: Colors.text2, minWidth: 28 },
  summaryPrice: { fontSize: 13, fontWeight: '600', color: Colors.text },
  divider: { height: 1, backgroundColor: Colors.border },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between' },
  priceLabel: { fontSize: 13, color: Colors.text2 },
  priceVal: { fontSize: 13, color: Colors.text, fontWeight: '600' },
  free: { fontSize: 13, color: Colors.success, fontWeight: '700' },
  totalLabel: { fontSize: 15, fontWeight: '700', color: Colors.text },
  totalVal: { fontSize: 17, fontWeight: '800', color: Colors.primary },

  placeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 14 },
  placeBtnDisabled: { opacity: 0.6 },
  placeBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  secureNote: { textAlign: 'center', fontSize: 11, color: Colors.text3 },
});
