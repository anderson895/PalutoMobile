import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Image, ActivityIndicator, Dimensions, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../store/auth';
import { useCart } from '../../store/cart';
import { Colors } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const CARD_W = (width - 48) / 2;

// Ionicons para sa categories — works sa Expo
const CATEGORY_ICONS: Record<string, { name: any; color: string }> = {
  'Rice Meals': { name: 'fast-food-outline',     color: '#F59E0B' },
  'Soups':      { name: 'water-outline',          color: '#3B82F6' },
  'Grilled':    { name: 'flame-outline',          color: '#EF4444' },
  'Fried':      { name: 'restaurant-outline',     color: '#F97316' },
  'Desserts':   { name: 'ice-cream-outline',      color: '#EC4899' },
  'Drinks':     { name: 'cafe-outline',           color: '#06B6D4' },
  'Snacks':     { name: 'pizza-outline',          color: '#84CC16' },
  'Seafood':    { name: 'fish-outline',           color: '#0EA5E9' },
};

const DEFAULT_ICON = { name: 'storefront-outline', color: Colors.primary };

export default function HomeScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const { addItem, totalItems } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [prodSnap, catSnap] = await Promise.all([
        getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc'))),
        getDocs(collection(db, 'categories')),
      ]);
      setProducts(prodSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setCategories(catSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const featured = products.filter(p => p.isBestseller || p.available).slice(0, 6);
  const displayCats = categories.length ? categories.slice(0, 8) : [
    { name: 'Rice Meals' }, { name: 'Soups' }, { name: 'Grilled' }, { name: 'Fried' },
    { name: 'Desserts' }, { name: 'Drinks' }, { name: 'Snacks' }, { name: 'Seafood' },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchData(); }}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {profile ? `Hello, ${profile.name.split(' ')[0]} 👋` : 'Hello, there 👋'}
            </Text>
            <Text style={styles.subGreeting}>What are you craving today?</Text>
          </View>
          <TouchableOpacity style={styles.cartBtn} onPress={() => router.push('/(tabs)/cart')}>
            <Ionicons name="bag-outline" size={22} color={Colors.text} />
            {totalItems > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{totalItems}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Hero Banner */}
        <View style={styles.hero}>
          <View style={styles.heroBadge}>
            <Ionicons name="flame" size={13} color={Colors.primaryLight} />
            <Text style={styles.heroBadgeText}>Now Delivering</Text>
          </View>
          <Text style={styles.heroTitle}>
            Authentic{'\n'}<Text style={styles.heroAccent}>Filipino</Text>{'\n'}Flavors
          </Text>
          <Text style={styles.heroSub}>
            Handcrafted cuisine delivered to your doorstep
          </Text>
          <TouchableOpacity style={styles.heroBtn} onPress={() => router.push('/(tabs)/menu')}>
            <Text style={styles.heroBtnText}>Order Now</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </TouchableOpacity>
          <View style={styles.heroStats}>
            <View style={styles.stat}>
              <Text style={styles.statNum}>500+</Text>
              <Text style={styles.statLabel}>Menu Items</Text>
            </View>
            <View style={styles.statDiv} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>30min</Text>
              <Text style={styles.statLabel}>Avg. Delivery</Text>
            </View>
            <View style={styles.statDiv} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>4.9 ⭐</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Browse by Category</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/menu')}>
              <Text style={styles.sectionLink}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catsRow}>
            {displayCats.map((cat: any) => {
              const iconInfo = CATEGORY_ICONS[cat.name] || DEFAULT_ICON;
              return (
                <TouchableOpacity
                  key={cat.id || cat.name}
                  style={styles.catCard}
                  onPress={() => router.push({ pathname: '/(tabs)/menu', params: { category: cat.name } })}
                >
                  <View style={[styles.catIcon, { backgroundColor: iconInfo.color + '22', borderColor: iconInfo.color + '44' }]}>
                    <Ionicons name={iconInfo.name} size={26} color={iconInfo.color} />
                  </View>
                  <Text style={styles.catName}>{cat.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Best Sellers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Today's <Text style={styles.accent}>Best Sellers</Text>
            </Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/menu')}>
              <Text style={styles.sectionLink}>See All</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <ActivityIndicator color={Colors.primary} style={{ marginTop: 20 }} />
          ) : (
            <View style={styles.productsGrid}>
              {featured.map((p: any) => (
                <TouchableOpacity
                  key={p.id}
                  style={styles.productCard}
                  onPress={() => router.push({ pathname: '/product/[id]', params: { id: p.id } })}
                  activeOpacity={0.85}
                >
                  <View style={styles.productImgWrap}>
                    <Image
                      source={{ uri: p.image || `https://placehold.co/300x200/1E1E1E/E8462A?text=${encodeURIComponent(p.name)}` }}
                      style={styles.productImg}
                    />
                    {p.isBestseller && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>⭐ Best</Text>
                      </View>
                    )}
                    {p.isNew && (
                      <View style={[styles.badge, styles.badgeNew]}>
                        <Text style={styles.badgeText}>✨ NEW</Text>
                      </View>
                    )}
                    <TouchableOpacity
                      style={styles.addBtn}
                      onPress={() => addItem(p)}
                      disabled={!p.available}
                    >
                      <Ionicons name="add" size={18} color="#fff" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.productBody}>
                    <Text style={styles.productCat}>{p.category}</Text>
                    <Text style={styles.productName} numberOfLines={1}>{p.name}</Text>
                    <Text style={styles.productDesc} numberOfLines={2}>{p.description}</Text>
                    <View style={styles.productFooter}>
                      <Text style={styles.productPrice}>₱{p.price?.toFixed(2)}</Text>
                      {p.prepTime && <Text style={styles.productTime}>🕐 {p.prepTime}min</Text>}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Why Paluto */}
        <View style={[styles.section, styles.whySection]}>
          <Text style={styles.whyTitle}>Why Choose <Text style={styles.accent}>Paluto?</Text></Text>
          <View style={styles.featuresRow}>
            {[
              { icon: 'rocket-outline',       color: '#8B5CF6', title: 'Fast Delivery',     desc: 'Hot meals in 30 min' },
              { icon: 'checkmark-circle-outline', color: '#22C55E', title: 'Fresh Ingredients', desc: 'Sourced daily' },
              { icon: 'people-outline',        color: '#F59E0B', title: 'Expert Chefs',      desc: 'Authentic recipes' },
              { icon: 'card-outline',          color: '#3B82F6', title: 'Easy Payment',      desc: 'Multiple options' },
            ].map((f: any) => (
              <View key={f.title} style={styles.featureCard}>
                <View style={[styles.featureIconWrap, { backgroundColor: f.color + '22' }]}>
                  <Ionicons name={f.icon} size={22} color={f.color} />
                </View>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Free delivery CTA */}
        <View style={styles.ctaBanner}>
          <Ionicons name="car-outline" size={18} color={Colors.primary} />
          <Text style={styles.ctaText}>Free delivery on orders above ₱500</Text>
          <TouchableOpacity style={styles.ctaBtn} onPress={() => router.push('/(tabs)/menu')}>
            <Text style={styles.ctaBtnText}>Order Now</Text>
            <Ionicons name="arrow-forward" size={14} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  container: { flex: 1, backgroundColor: Colors.bg },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  greeting: { fontSize: 18, fontWeight: '700', color: Colors.text },
  subGreeting: { fontSize: 13, color: Colors.text2, marginTop: 2 },
  cartBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  cartBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: Colors.primary, borderRadius: 8, width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  cartBadgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },

  // Hero
  hero: { margin: 16, borderRadius: 20, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, padding: 24 },
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: 'rgba(232,70,42,0.12)', borderWidth: 1, borderColor: 'rgba(232,70,42,0.25)', borderRadius: 100, paddingHorizontal: 12, paddingVertical: 5, marginBottom: 14 },
  heroBadgeText: { color: Colors.primaryLight, fontSize: 12, fontWeight: '600' },
  heroTitle: { fontSize: 36, fontWeight: '900', color: Colors.text, lineHeight: 42, marginBottom: 10 },
  heroAccent: { color: Colors.primary, fontStyle: 'italic' },
  heroSub: { fontSize: 14, color: Colors.text2, lineHeight: 20, marginBottom: 18 },
  heroBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, alignSelf: 'flex-start', marginBottom: 20 },
  heroBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  heroStats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.border },
  stat: { alignItems: 'center' },
  statNum: { fontSize: 15, fontWeight: '700', color: Colors.text },
  statLabel: { fontSize: 10, color: Colors.text2, marginTop: 2 },
  statDiv: { width: 1, height: 28, backgroundColor: Colors.border },

  // Sections
  section: { paddingHorizontal: 16, paddingTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  sectionLink: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  accent: { color: Colors.primary },

  // Categories
  catsRow: { paddingRight: 16, gap: 10 },
  catCard: { alignItems: 'center', gap: 8, width: 76 },
  catIcon: { width: 56, height: 56, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  catName: { fontSize: 11, fontWeight: '600', color: Colors.text2, textAlign: 'center' },

  // Products
  productsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  productCard: { width: CARD_W, backgroundColor: Colors.card, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  productImgWrap: { height: 130, position: 'relative' },
  productImg: { width: '100%', height: '100%' },
  badge: { position: 'absolute', top: 8, left: 8, backgroundColor: Colors.gold, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  badgeNew: { backgroundColor: Colors.primary },
  badgeText: { fontSize: 9, fontWeight: '700', color: '#fff' },
  addBtn: { position: 'absolute', bottom: 8, right: 8, width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  productBody: { padding: 10 },
  productCat: { fontSize: 10, fontWeight: '700', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  productName: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  productDesc: { fontSize: 11, color: Colors.text2, lineHeight: 15, marginBottom: 8 },
  productFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productPrice: { fontSize: 15, fontWeight: '700', color: Colors.text },
  productTime: { fontSize: 10, color: Colors.text2 },

  // Why Paluto
  whySection: { backgroundColor: Colors.bg2, marginTop: 24, paddingBottom: 24, paddingHorizontal: 16 },
  whyTitle: { fontSize: 20, fontWeight: '700', color: Colors.text, marginBottom: 16 },
  featuresRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  featureCard: { width: (width - 52) / 2, backgroundColor: Colors.card, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: Colors.border },
  featureIconWrap: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  featureTitle: { fontSize: 13, fontWeight: '700', color: Colors.text, marginBottom: 3 },
  featureDesc: { fontSize: 11, color: Colors.text2 },

  // CTA
  ctaBanner: { margin: 16, borderRadius: 14, backgroundColor: 'rgba(232,70,42,0.10)', borderWidth: 1, borderColor: 'rgba(232,70,42,0.22)', padding: 16, flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  ctaText: { flex: 1, fontSize: 13, color: Colors.text, fontWeight: '600' },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 10 },
  ctaBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});