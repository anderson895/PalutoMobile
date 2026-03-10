import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useCart } from '../../store/cart';
import { Colors } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { addItem, items } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const snap = await getDoc(doc(db, 'products', id));
        if (snap.exists()) setProduct({ id: snap.id, ...snap.data() });
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const cartItem = items.find(i => i.id === id);

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addItem(product);
    Alert.alert('Added to Cart! 🛒', `${qty}x ${product.name} added.`, [
      { text: 'Keep Browsing', style: 'cancel' },
      { text: 'View Cart', onPress: () => router.push('/(tabs)/cart') },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadWrap}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.loadWrap}>
          <Text style={styles.errorText}>Product not found</Text>
          <TouchableOpacity onPress={() => router.back()}><Text style={styles.backLink}>Go Back</Text></TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image */}
        <View style={styles.imgWrap}>
          <Image
            source={{ uri: product.image || `https://placehold.co/400x300/1E1E1E/E8462A?text=${encodeURIComponent(product.name)}` }}
            style={styles.img}
          />
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={Colors.text} />
          </TouchableOpacity>
          <View style={styles.badges}>
            {product.isNew && <View style={[styles.badge, styles.badgeNew]}><Text style={styles.badgeText}>✨ NEW</Text></View>}
            {product.isBestseller && <View style={[styles.badge, styles.badgeGold]}><Text style={styles.badgeText}>⭐ Bestseller</Text></View>}
            {!product.available && <View style={[styles.badge, styles.badgeGray]}><Text style={styles.badgeText}>Unavailable</Text></View>}
          </View>
        </View>

        <View style={styles.body}>
          {/* Category tag */}
          <View style={styles.catTag}>
            <Ionicons name="pricetag-outline" size={12} color={Colors.primary} />
            <Text style={styles.catTagText}>{product.category}</Text>
          </View>

          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.description}>{product.description}</Text>

          {/* Meta */}
          <View style={styles.metaRow}>
            {product.prepTime && (
              <View style={styles.metaPill}>
                <Ionicons name="time-outline" size={13} color={Colors.text2} />
                <Text style={styles.metaText}>{product.prepTime} min prep</Text>
              </View>
            )}
            {product.calories && (
              <View style={styles.metaPill}>
                <Ionicons name="flame-outline" size={13} color={Colors.text2} />
                <Text style={styles.metaText}>{product.calories} cal</Text>
              </View>
            )}
            {product.servings && (
              <View style={styles.metaPill}>
                <Ionicons name="people-outline" size={13} color={Colors.text2} />
                <Text style={styles.metaText}>Serves {product.servings}</Text>
              </View>
            )}
          </View>

          {/* Price */}
          <View style={styles.priceSection}>
            <Text style={styles.priceLabel}>Price</Text>
            <Text style={styles.price}>₱{product.price?.toFixed(2)}</Text>
          </View>

          {/* Qty + Cart button */}
          {product.available !== false && (
            <>
              <View style={styles.divider} />
              <View style={styles.qtySection}>
                <View style={styles.qtyControls}>
                  <TouchableOpacity
                    style={[styles.qtyBtn, qty <= 1 && styles.qtyBtnDisabled]}
                    onPress={() => qty > 1 && setQty(q => q - 1)}
                    disabled={qty <= 1}
                  >
                    <Ionicons name="remove" size={18} color={qty <= 1 ? Colors.text3 : Colors.text} />
                  </TouchableOpacity>
                  <Text style={styles.qtyNum}>{qty}</Text>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(q => q + 1)}>
                    <Ionicons name="add" size={18} color={Colors.text} />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.addBtn} onPress={handleAddToCart}>
                  <Ionicons name="bag-add-outline" size={18} color="#fff" />
                  <Text style={styles.addBtnText}>Add to Cart · ₱{(product.price * qty).toFixed(2)}</Text>
                </TouchableOpacity>
              </View>
              {cartItem && (
                <View style={styles.inCartNote}>
                  <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
                  <Text style={styles.inCartText}>You have {cartItem.qty}x in your cart</Text>
                  <TouchableOpacity onPress={() => router.push('/(tabs)/cart')}>
                    <Text style={styles.viewCartLink}>View Cart</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}

          {!product.available && (
            <View style={styles.unavailableBanner}>
              <Ionicons name="close-circle-outline" size={18} color={Colors.text2} />
              <Text style={styles.unavailableText}>This item is currently unavailable</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  loadWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bg },
  errorText: { fontSize: 16, color: Colors.text2, marginBottom: 12 },
  backLink: { color: Colors.primary, fontWeight: '600' },

  imgWrap: { height: 300, position: 'relative' },
  img: { width: '100%', height: '100%' },
  backBtn: { position: 'absolute', top: 16, left: 16, width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  badges: { position: 'absolute', top: 16, right: 16, gap: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeNew: { backgroundColor: Colors.primary },
  badgeGold: { backgroundColor: Colors.gold },
  badgeGray: { backgroundColor: Colors.border },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#fff' },

  body: { padding: 20 },
  catTag: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 10 },
  catTagText: { fontSize: 12, fontWeight: '700', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
  name: { fontSize: 26, fontWeight: '800', color: Colors.text, marginBottom: 10, lineHeight: 32 },
  description: { fontSize: 14, color: Colors.text2, lineHeight: 22, marginBottom: 16 },

  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  metaPill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  metaText: { fontSize: 12, color: Colors.text2 },

  priceSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: Colors.border, marginBottom: 20 },
  priceLabel: { fontSize: 14, color: Colors.text2, fontWeight: '600' },
  price: { fontSize: 28, fontWeight: '800', color: Colors.primary },

  divider: { height: 1, backgroundColor: Colors.border, marginBottom: 20 },

  qtySection: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  qtyBtn: { width: 30, height: 30, borderRadius: 8, backgroundColor: Colors.bg2, alignItems: 'center', justifyContent: 'center' },
  qtyBtnDisabled: { opacity: 0.4 },
  qtyNum: { fontSize: 18, fontWeight: '700', color: Colors.text, minWidth: 24, textAlign: 'center' },
  addBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: 12 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  inCartNote: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  inCartText: { fontSize: 12, color: Colors.success, flex: 1 },
  viewCartLink: { fontSize: 12, color: Colors.primary, fontWeight: '700' },

  unavailableBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.card, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: Colors.border },
  unavailableText: { fontSize: 14, color: Colors.text2 },
});
