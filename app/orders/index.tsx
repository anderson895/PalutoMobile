import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../store/auth';
import { Colors, STATUS_COLORS, STATUS_LABELS } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OrdersScreen() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, 'orders'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [user]);

  const formatDate = (iso: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const StatusBadge = ({ status }: { status: string }) => (
    <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[status] + '22', borderColor: STATUS_COLORS[status] + '55' }]}>
      <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[status] }]} />
      <Text style={[styles.statusText, { color: STATUS_COLORS[status] }]}>{STATUS_LABELS[status] || status}</Text>
    </View>
  );

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>My Orders</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>🔐</Text>
          <Text style={styles.emptyTitle}>Login Required</Text>
          <Text style={styles.emptySub}>Please login to view your orders</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/auth/login')}>
            <Text style={styles.loginBtnText}>Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>My Orders</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>📋</Text>
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptySub}>Start browsing our menu and place your first order!</Text>
          <TouchableOpacity style={styles.browseBtn} onPress={() => router.push('/(tabs)/menu')}>
            <Text style={styles.browseBtnText}>Browse Menu</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders(); }} tintColor={Colors.primary} />}
        >
          {orders.map(order => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.orderId}>#{order.id.slice(-8).toUpperCase()}</Text>
                  <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
                </View>
                <StatusBadge status={order.status} />
              </View>

              <View style={styles.orderItems}>
                {order.items?.slice(0, 3).map((item: any) => (
                  <View key={item.id} style={styles.orderItem}>
                    <Image source={{ uri: item.image || `https://placehold.co/40x40/1E1E1E/E8462A?text=F` }} style={styles.itemImg} />
                    <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.itemQty}>x{item.qty}</Text>
                    <Text style={styles.itemPrice}>₱{(item.price * item.qty).toFixed(2)}</Text>
                  </View>
                ))}
                {order.items?.length > 3 && (
                  <Text style={styles.moreItems}>+{order.items.length - 3} more items</Text>
                )}
              </View>

              <View style={styles.orderFooter}>
                <View style={styles.orderMeta}>
                  <Ionicons name="location-outline" size={12} color={Colors.text3} />
                  <Text style={styles.orderAddress} numberOfLines={1}>{order.address}</Text>
                </View>
                <Text style={styles.orderTotal}>Total: <Text style={styles.orderTotalAmt}>₱{order.total?.toFixed(2)}</Text></Text>
              </View>

              {order.notes && (
                <View style={styles.notesRow}>
                  <Ionicons name="chatbubble-outline" size={12} color={Colors.text3} />
                  <Text style={styles.notesText}>{order.notes}</Text>
                </View>
              )}

              <View style={styles.paymentRow}>
                <Ionicons name="card-outline" size={12} color={Colors.text3} />
                <Text style={styles.paymentText}>{order.payment === 'cod' ? 'Cash on Delivery' : order.payment === 'gcash' ? 'GCash' : 'Bank Transfer'}</Text>
              </View>
            </View>
          ))}
          <View style={{ height: 24 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  pageTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: Colors.text },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyEmoji: { fontSize: 56, marginBottom: 14 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  emptySub: { fontSize: 14, color: Colors.text2, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  loginBtn: { backgroundColor: Colors.primary, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12 },
  loginBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  browseBtn: { backgroundColor: Colors.primary, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12 },
  browseBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  scroll: { padding: 16, gap: 12 },

  orderCard: { backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, padding: 14, gap: 12 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderId: { fontSize: 15, fontWeight: '800', color: Colors.text, marginBottom: 3 },
  orderDate: { fontSize: 11, color: Colors.text3 },

  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '700' },

  orderItems: { gap: 8 },
  orderItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  itemImg: { width: 36, height: 36, borderRadius: 8 },
  itemName: { flex: 1, fontSize: 13, color: Colors.text },
  itemQty: { fontSize: 12, color: Colors.text2 },
  itemPrice: { fontSize: 13, fontWeight: '600', color: Colors.text, minWidth: 60, textAlign: 'right' },
  moreItems: { fontSize: 11, color: Colors.text3, marginLeft: 46 },

  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, flex: 1 },
  orderAddress: { fontSize: 11, color: Colors.text3, flex: 1 },
  orderTotal: { fontSize: 13, color: Colors.text2 },
  orderTotalAmt: { fontSize: 14, fontWeight: '800', color: Colors.primary },

  notesRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  notesText: { fontSize: 11, color: Colors.text3, flex: 1 },
  paymentRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  paymentText: { fontSize: 11, color: Colors.text3 },
});
