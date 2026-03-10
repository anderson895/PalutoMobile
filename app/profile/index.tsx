import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db, auth } from '../../lib/firebase';
import { useAuth } from '../../store/auth';
import { Colors } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [name, setName] = useState(profile?.name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name.trim()) { Alert.alert('Error', 'Name is required'); return; }
    setSaving(true);
    try {
      if (user) {
        await updateProfile(user, { displayName: name.trim() });
        await updateDoc(doc(db, 'users', user.uid), { name: name.trim(), phone: phone.trim() });
      }
      Alert.alert('Saved!', 'Your profile has been updated.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Edit Profile</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Avatar */}
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(name || 'U')[0].toUpperCase()}</Text>
            </View>
            <Text style={styles.avatarName}>{name || 'Your Name'}</Text>
            <Text style={styles.avatarEmail}>{user?.email}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Personal Information</Text>
            <View style={styles.field}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="person-outline" size={16} color={Colors.text3} style={styles.inputIcon} />
                <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your full name" placeholderTextColor={Colors.text3} autoCapitalize="words" />
              </View>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="call-outline" size={16} color={Colors.text3} style={styles.inputIcon} />
                <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="+63 912 345 6789" placeholderTextColor={Colors.text3} keyboardType="phone-pad" />
              </View>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Email (cannot change)</Text>
              <View style={[styles.inputWrap, styles.inputDisabled]}>
                <Ionicons name="mail-outline" size={16} color={Colors.text3} style={styles.inputIcon} />
                <Text style={styles.inputText}>{user?.email}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={[styles.saveBtn, saving && styles.saveBtnDisabled]} onPress={save} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : (
              <>
                <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
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

  scroll: { padding: 16, gap: 16 },

  avatarSection: { alignItems: 'center', paddingVertical: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#fff' },
  avatarName: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  avatarEmail: { fontSize: 13, color: Colors.text2 },

  card: { backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, padding: 16, gap: 14 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 2 },

  field: { gap: 6 },
  label: { fontSize: 12, fontWeight: '600', color: Colors.text2 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bg2, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 11 },
  inputDisabled: { opacity: 0.5 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: Colors.text, fontSize: 14 },
  inputText: { flex: 1, color: Colors.text2, fontSize: 14 },

  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, paddingVertical: 15, borderRadius: 14 },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
