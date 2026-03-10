import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../store/auth';
import { Colors } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AccountScreen() {
  const router = useRouter();
  const { isLoggedIn, user, profile, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => { await logout(); } },
    ]);
  };

  const MenuItem = ({ icon, label, onPress, danger }: any) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={[styles.menuIcon, danger && styles.menuIconDanger]}>
        <Ionicons name={icon} size={18} color={danger ? Colors.error : Colors.primary} />
      </View>
      <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={Colors.text3} />
    </TouchableOpacity>
  );

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.topBar}>
          <Text style={styles.pageTitle}>Account</Text>
        </View>
        <View style={styles.guestWrap}>
          {/* Replaced 👤 emoji with Ionicons */}
          <View style={styles.guestIconWrap}>
            <Ionicons name="person-outline" size={48} color={Colors.text3} />
          </View>
          <Text style={styles.guestTitle}>Welcome to Paluto!</Text>
          <Text style={styles.guestSub}>
            Login to track orders, save addresses, and enjoy a personalized experience.
          </Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/auth/login')}>
            <Text style={styles.loginBtnText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.registerBtn} onPress={() => router.push('/auth/register')}>
            <Text style={styles.registerBtnText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Text style={styles.pageTitle}>Account</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(profile?.name || user?.email || 'U')[0].toUpperCase()}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile?.name || 'User'}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            {profile?.phone && <Text style={styles.profilePhone}>{profile.phone}</Text>}
          </View>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{profile?.role || 'customer'}</Text>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>My Account</Text>
          <View style={styles.menuCard}>
            <MenuItem icon="receipt-outline"  label="My Orders"       onPress={() => router.push('/orders')} />
            <View style={styles.menuDivider} />
            <MenuItem icon="person-outline"   label="Edit Profile"    onPress={() => router.push('/profile')} />
            <View style={styles.menuDivider} />
            <MenuItem icon="location-outline" label="Saved Addresses" onPress={() => router.push('/profile')} />
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Support</Text>
          <View style={styles.menuCard}>
            <MenuItem icon="help-circle-outline"        label="Help & Support" onPress={() => {}} />
            <View style={styles.menuDivider} />
            <MenuItem icon="information-circle-outline" label="About Paluto"   onPress={() => {}} />
          </View>
        </View>

        <View style={styles.menuSection}>
          <View style={styles.menuCard}>
            <MenuItem icon="log-out-outline" label="Logout" onPress={handleLogout} danger />
          </View>
        </View>

        {/* Replaced ❤️ emoji with Ionicons heart */}
        <View style={styles.versionRow}>
          <Text style={styles.version}>Paluto v1.0.0 · Made with </Text>
          <Ionicons name="heart" size={11} color={Colors.error} />
          <Text style={styles.version}> in the Philippines</Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },

  topBar: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12 },
  pageTitle: { fontSize: 22, fontWeight: '800', color: Colors.text },

  guestWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 60 },
  guestIconWrap: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  guestTitle: { fontSize: 22, fontWeight: '800', color: Colors.text, marginBottom: 10 },
  guestSub: { fontSize: 14, color: Colors.text2, textAlign: 'center', lineHeight: 20, marginBottom: 28 },
  loginBtn: { width: '100%', backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  loginBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  registerBtn: { width: '100%', backgroundColor: Colors.card, paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  registerBtnText: { color: Colors.text, fontWeight: '700', fontSize: 16 },

  profileCard: { margin: 16, backgroundColor: Colors.card, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, borderColor: Colors.border },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 22, fontWeight: '800', color: '#fff' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 3 },
  profileEmail: { fontSize: 12, color: Colors.text2, marginBottom: 2 },
  profilePhone: { fontSize: 12, color: Colors.text3 },
  roleBadge: { backgroundColor: 'rgba(232,70,42,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  roleText: { fontSize: 11, color: Colors.primary, fontWeight: '700', textTransform: 'capitalize' },

  menuSection: { marginHorizontal: 16, marginBottom: 12 },
  menuSectionTitle: { fontSize: 12, fontWeight: '700', color: Colors.text3, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginLeft: 4 },
  menuCard: { backgroundColor: Colors.card, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  menuIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(232,70,42,0.1)', alignItems: 'center', justifyContent: 'center' },
  menuIconDanger: { backgroundColor: 'rgba(239,68,68,0.1)' },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.text },
  menuLabelDanger: { color: Colors.error },
  menuDivider: { height: 1, backgroundColor: Colors.border, marginLeft: 60 },

  versionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8, marginBottom: 8 },
  version: { textAlign: 'center', fontSize: 11, color: Colors.text3 },
});