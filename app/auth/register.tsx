import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/theme";
import { useAuth } from "../../store/auth";

// ✅ ILABAS ang Field component — hindi na mag-remount every keystroke
const Field = ({ label, icon, value, onChangeText, ...props }: any) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputWrap}>
      <Ionicons
        name={icon}
        size={18}
        color={Colors.text3}
        style={styles.inputIcon}
      />
      <TextInput
        style={[styles.input, { flex: 1 }]}
        placeholderTextColor={Colors.text3}
        value={value}
        onChangeText={onChangeText}
        {...props}
      />
    </View>
  </View>
);

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (key: string, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }
    if (form.password !== form.confirm) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await register(
        form.email.trim(),
        form.password,
        form.name.trim(),
        form.phone.trim(),
      );
      router.back();
    } catch (e: any) {
      Alert.alert("Registration Failed", e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
        >
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={22} color={Colors.text} />
          </TouchableOpacity>
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.sub}>Join us for authentic Filipino food!</Text>
          </View>
          <View style={styles.form}>
            <Field
              label="Full Name *"
              icon="person-outline"
              value={form.name}
              onChangeText={(v: string) => set("name", v)}
              placeholder="Juan Dela Cruz"
              autoCapitalize="words"
            />
            <Field
              label="Email *"
              icon="mail-outline"
              value={form.email}
              onChangeText={(v: string) => set("email", v)}
              placeholder="your@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Field
              label="Phone Number"
              icon="call-outline"
              value={form.phone}
              onChangeText={(v: string) => set("phone", v)}
              placeholder="+63 912 345 6789"
              keyboardType="phone-pad"
            />
            <View style={styles.field}>
              <Text style={styles.label}>Password *</Text>
              <View style={styles.inputWrap}>
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={Colors.text3}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Min. 6 characters"
                  placeholderTextColor={Colors.text3}
                  value={form.password}
                  onChangeText={(v) => set("password", v)}
                  secureTextEntry={!showPass}
                />
                <TouchableOpacity
                  onPress={() => setShowPass((v) => !v)}
                  style={styles.eyeBtn}
                >
                  <Ionicons
                    name={showPass ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color={Colors.text3}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Confirm Password *</Text>
              <View style={styles.inputWrap}>
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={Colors.text3}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Repeat your password"
                  placeholderTextColor={Colors.text3}
                  value={form.confirm}
                  onChangeText={(v) => set("confirm", v)}
                  secureTextEntry={!showPass}
                />
              </View>
            </View>
            <TouchableOpacity
              style={styles.registerBtn}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.registerBtnText}>Create Account</Text>
              )}
            </TouchableOpacity>
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>already have an account?</Text>
              <View style={styles.dividerLine} />
            </View>
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={() => router.replace("/auth/login")}
            >
              <Text style={styles.loginBtnText}>Login Instead</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.secureRow}>
            <Ionicons
              name="shield-checkmark-outline"
              size={12}
              color={Colors.text3}
              style={{ marginRight: 5 }}
            />
            <Text style={styles.secureText}>
              Secured with Firebase Authentication
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: 24, flexGrow: 1 },
  closeBtn: {
    alignSelf: "flex-end",
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
  },
  header: { alignItems: "center", marginBottom: 32 },
  logoWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  logoText: { fontSize: 28, fontWeight: "800", color: Colors.text },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 6,
  },
  sub: { fontSize: 14, color: Colors.text2 },
  form: { gap: 14 },
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: "600", color: Colors.text2 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputIcon: { marginRight: 10 },
  input: { color: Colors.text, fontSize: 15 },
  eyeBtn: { padding: 4 },
  registerBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
  },
  registerBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontSize: 11, color: Colors.text3 },
  loginBtn: {
    backgroundColor: Colors.card,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  loginBtnText: { color: Colors.text, fontWeight: "700", fontSize: 15 },
  secureRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  secureText: { fontSize: 11, color: Colors.text3 },
});
