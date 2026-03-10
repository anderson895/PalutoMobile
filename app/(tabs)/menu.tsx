import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Image, ActivityIndicator, FlatList,
  useWindowDimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useCart } from '../../store/cart';
import { Colors } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';

const COLUMN_GAP = 10;
const H_PADDING = 16;

const getNumColumns = (width: number) => {
  if (width >= 900) return 4;
  if (width >= 600) return 3;
  return 2;
};

const getCardWidth = (width: number) => {
  const cols = getNumColumns(width);
  return (width - H_PADDING * 2 - COLUMN_GAP * (cols - 1)) / cols;
};

const CATEGORY_ICONS: Record<string, { name: any; color: string }> = {
  'All':        { name: 'grid-outline',       color: Colors.primary },
  'Rice Meals': { name: 'fast-food-outline',  color: '#F59E0B' },
  'Soups':      { name: 'water-outline',      color: '#3B82F6' },
  'Grilled':    { name: 'flame-outline',      color: '#EF4444' },
  'Fried':      { name: 'restaurant-outline', color: '#F97316' },
  'Desserts':   { name: 'ice-cream-outline',  color: '#EC4899' },
  'Drinks':     { name: 'cafe-outline',       color: '#06B6D4' },
  'Snacks':     { name: 'pizza-outline',      color: '#84CC16' },
  'Seafood':    { name: 'fish-outline',       color: '#0EA5E9' },
};
const DEFAULT_ICON = { name: 'storefront-outline' as any, color: Colors.primary };

const SORT_OPTIONS: [string, string][] = [
  ['', 'Default'],
  ['price-asc', 'Price ↑'],
  ['price-desc', 'Price ↓'],
  ['name', 'A–Z'],
];

export default function MenuScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { addItem } = useCart();
  const { width } = useWindowDimensions();

  const numColumns = getNumColumns(width);
  const cardWidth = getCardWidth(width);
  const imgHeight = Math.round(cardWidth * 0.65);
  const isLarge = width >= 600;

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState((params.category as string) || '');
  const [sortBy, setSortBy] = useState('');

  useEffect(() => {
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
      }
    };
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    let list = products.filter(p => p.available !== false);
    if (search) list = list.filter(p =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
    );
    if (activeCategory) list = list.filter(p => p.category === activeCategory);
    if (sortBy === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    else if (sortBy === 'name') list = [...list].sort((a, b) => a.name?.localeCompare(b.name));
    return list;
  }, [products, search, activeCategory, sortBy]);

  const allCats = useMemo(() => [{ id: 'all', name: 'All' }, ...categories], [categories]);

  const getCatIcon = (name: string) => CATEGORY_ICONS[name] || DEFAULT_ICON;

  // ─── ListHeaderComponent — rendered once, never causes pill reflow ───────────
  // Putting the header INSIDE the FlatList means it shares the same scroll
  // container as the cards. Nothing outside competes for layout space, so
  // pills are 100% stable regardless of filter/search changes.
  const ListHeader = useCallback(() => (
    <View>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={[styles.pageTitle, isLarge && { fontSize: 26 }]}>
          Our <Text style={{ color: Colors.primary }}>Menu</Text>
        </Text>
        <Text style={styles.resultsCount}>{filtered.length} items</Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={Colors.text3} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search dishes..."
          placeholderTextColor={Colors.text3}
          value={search}
          onChangeText={setSearch}
        />
        {!!search && (
          <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={18} color={Colors.text3} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.pillsScroll}
        contentContainerStyle={styles.pillsRow}
        keyboardShouldPersistTaps="handled"
      >
        {allCats.map(cat => {
          const icon = getCatIcon(cat.name);
          const active =
            (cat.name === 'All' && activeCategory === '') ||
            (cat.name !== 'All' && activeCategory === cat.name);
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.catPill, {
                backgroundColor: active ? icon.color + '22' : Colors.card,
                borderColor:     active ? icon.color       : Colors.border,
              }]}
              onPress={() => setActiveCategory(cat.name === 'All' ? '' : cat.name)}
              activeOpacity={0.75}
            >
              <Ionicons name={icon.name} size={14} color={active ? icon.color : Colors.text3} />
              <Text style={[styles.catPillText, { color: active ? icon.color : Colors.text2 }]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Sort pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.pillsScroll}
        contentContainerStyle={[styles.pillsRow, { marginBottom: 12 }]}
        keyboardShouldPersistTaps="handled"
      >
        {SORT_OPTIONS.map(([val, label]) => {
          const active = sortBy === val;
          return (
            <TouchableOpacity
              key={val}
              style={[styles.sortPill, {
                backgroundColor: active ? Colors.primary : Colors.card,
                borderColor:     active ? Colors.primary : Colors.border,
              }]}
              onPress={() => setSortBy(val)}
              activeOpacity={0.75}
            >
              <Text style={[styles.sortPillText, { color: active ? '#fff' : Colors.text2 }]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Loading / Empty states live here so they scroll with the header */}
      {loading && (
        <View style={styles.stateWrap}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      )}
      {!loading && filtered.length === 0 && (
        <View style={styles.stateWrap}>
          <Ionicons name="restaurant-outline" size={56} color={Colors.text3} style={{ marginBottom: 12 }} />
          <Text style={styles.emptyTitle}>No dishes found</Text>
          <Text style={styles.emptySub}>Try a different search or category</Text>
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => { setSearch(''); setActiveCategory(''); }}
          >
            <Text style={styles.clearBtnText}>Clear Filters</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [search, activeCategory, sortBy, allCats, filtered.length, isLarge, loading]);

  const renderProduct = useCallback(({ item: p, index }: { item: any; index: number }) => {
    const marginLeft = (index % numColumns) > 0 ? COLUMN_GAP : 0;
    return (
      <TouchableOpacity
        style={[styles.productCard, { width: cardWidth, marginLeft }]}
        onPress={() => router.push({ pathname: '/product/[id]', params: { id: p.id } })}
        activeOpacity={0.85}
      >
        <View style={[styles.productImgWrap, { height: imgHeight }]}>
          <Image
            source={{ uri: p.image || `https://placehold.co/300x200/1E1E1E/E8462A?text=${encodeURIComponent(p.name)}` }}
            style={styles.productImg}
          />
          {p.isBestseller && <View style={styles.badge}><Text style={styles.badgeText}>⭐ Best</Text></View>}
          {p.isNew && <View style={[styles.badge, styles.badgeNew]}><Text style={styles.badgeText}>✨ NEW</Text></View>}
          <TouchableOpacity style={styles.addBtn} onPress={() => addItem(p)}>
            <Ionicons name="add" size={isLarge ? 22 : 18} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.productBody}>
          <Text style={[styles.productCat, isLarge && { fontSize: 11 }]}>{p.category}</Text>
          <Text style={[styles.productName, isLarge && { fontSize: 16 }]} numberOfLines={1}>{p.name}</Text>
          <Text style={[styles.productDesc, isLarge && { fontSize: 12 }]} numberOfLines={2}>{p.description}</Text>
          <View style={styles.productFooter}>
            <Text style={[styles.productPrice, isLarge && { fontSize: 17 }]}>₱{p.price?.toFixed(2)}</Text>
            {p.prepTime && <Text style={[styles.productTime, isLarge && { fontSize: 11 }]}>🕐 {p.prepTime}min</Text>}
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [numColumns, cardWidth, imgHeight, isLarge, addItem, router]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        // Only remount when column count changes (rotation/resize), NOT on filter changes
        key={`grid-${numColumns}`}
        data={filtered}
        keyExtractor={p => p.id}
        renderItem={renderProduct}
        numColumns={numColumns}
        // Header contains search + pills — lives inside FlatList, zero layout competition
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        removeClippedSubviews={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },

  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: H_PADDING, paddingTop: 12, paddingBottom: 8,
  },
  pageTitle: { fontSize: 22, fontWeight: '800', color: Colors.text },
  resultsCount: { fontSize: 12, color: Colors.text2 },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: H_PADDING, marginBottom: 12,
    backgroundColor: Colors.card, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 12, paddingVertical: 10,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: Colors.text, fontSize: 14 },

  // Shared scroll wrapper for both pill rows — fixed-height, never reflowing
  pillsScroll: { flexGrow: 0, marginBottom: 8 },
  pillsRow: {
    paddingHorizontal: H_PADDING,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',   // stops pills stretching vertically
  },

  catPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7,
    borderWidth: 1,
    alignSelf: 'center',    // intrinsic size only — never stretches
    flexShrink: 0,
  },
  catPillText: { fontSize: 12, fontWeight: '600' },

  sortPill: {
    borderRadius: 16, paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1,
    alignSelf: 'center',
    flexShrink: 0,
  },
  sortPillText: { fontSize: 11, fontWeight: '600' },

  stateWrap: { alignItems: 'center', justifyContent: 'center', padding: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 6 },
  emptySub: { fontSize: 13, color: Colors.text2, marginBottom: 20 },
  clearBtn: {
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10,
  },
  clearBtnText: { color: Colors.text, fontWeight: '600' },

  listContent: { paddingHorizontal: H_PADDING, paddingBottom: 24 },

  productCard: {
    backgroundColor: Colors.card, borderRadius: 14,
    overflow: 'hidden', borderWidth: 1, borderColor: Colors.border,
    marginBottom: COLUMN_GAP,
  },
  productImgWrap: { position: 'relative' },
  productImg: { width: '100%', height: '100%' },
  badge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: Colors.gold, borderRadius: 6,
    paddingHorizontal: 5, paddingVertical: 2,
  },
  badgeNew: { backgroundColor: Colors.primary },
  badgeText: { fontSize: 9, fontWeight: '700', color: '#fff' },
  addBtn: {
    position: 'absolute', bottom: 8, right: 8,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  productBody: { padding: 10 },
  productCat: {
    fontSize: 10, fontWeight: '700', color: Colors.primary,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3,
  },
  productName: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  productDesc: { fontSize: 11, color: Colors.text2, lineHeight: 15, marginBottom: 8 },
  productFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productPrice: { fontSize: 15, fontWeight: '700', color: Colors.text },
  productTime: { fontSize: 10, color: Colors.text2 },
});