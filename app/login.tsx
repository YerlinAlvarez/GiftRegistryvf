import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../src/presentation/viewmodels/useAuthViewModel';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);
  const loginWithEmail = useAuthStore((s) => s.loginWithEmail);

  useEffect(() => {
    if (error) Alert.alert('Aviso', error, [{ text: 'OK', onPress: clearError }]);
  }, [error, clearError]);

  useEffect(() => {
    if (user) router.replace('/');
  }, [user]);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Campos requeridos', 'Ingresa email y contraseña');
      return;
    }
    await loginWithEmail(email, password);
  };

  const handleGoogle = () => {
    Alert.alert('Google', 'Iniciando sesión con Google...');
  };

  const handleGitHub = () => {
    Alert.alert('GitHub', 'Iniciando sesión con GitHub...');
  };

  const handleApple = () => {
    Alert.alert('Apple', 'Iniciando sesión con Apple...');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Organizadora</Text>
        <Text style={styles.subtitle}>
          Inicia sesión para crear listas y administrar regalos
        </Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="correo@ejemplo.com"
          placeholderTextColor="#B4B2A9"
          value={email}
          onChangeText={(t) => { setEmail(t); clearError(); }}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
        />

        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="#B4B2A9"
          value={password}
          onChangeText={(t) => { setPassword(t); clearError(); }}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.btnPrimary, isLoading && styles.btnDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnPrimaryText}>Entrar</Text>
          )}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>o continúa con</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity style={styles.btnGoogle} onPress={handleGoogle}>
          <Text style={styles.btnGoogleText}>🔴  Continuar con Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnGitHub} onPress={handleGitHub}>
          <Text style={styles.btnGitHubText}>🐙  Continuar con GitHub</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnApple} onPress={handleApple}>
          <Text style={styles.btnAppleText}>🍎  Continuar con Apple</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnLink} onPress={() => router.push('./register')}>
          <Text style={styles.btnLinkText}>Crear cuenta</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#F1EFE8' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  title: { fontSize: 20, fontWeight: '700', color: '#2C2C2A' },
  subtitle: { fontSize: 14, color: '#888780', marginTop: 6, marginBottom: 18, lineHeight: 20 },
  label: { fontSize: 14, fontWeight: '500', color: '#444441', marginBottom: 8, marginTop: 4 },
  input: {
    borderWidth: 1, borderColor: '#D3D1C7', borderRadius: 10,
    padding: 14, fontSize: 15, color: '#2C2C2A',
    backgroundColor: '#FAFAF8', marginBottom: 14,
  },
  btnPrimary: { backgroundColor: '#534AB7', borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 6 },
  btnDisabled: { opacity: 0.6 },
  btnPrimaryText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#D3D1C7' },
  dividerText: { color: '#888780', fontSize: 13, marginHorizontal: 10 },
  btnGoogle: {
    borderWidth: 1.5, borderColor: '#D3D1C7', borderRadius: 10,
    padding: 14, alignItems: 'center', marginBottom: 10, backgroundColor: '#fff',
  },
  btnGoogleText: { fontSize: 15, fontWeight: '600', color: '#2C2C2A' },
  btnGitHub: {
    borderWidth: 1.5, borderColor: '#24292e', borderRadius: 10,
    padding: 14, alignItems: 'center', marginBottom: 10, backgroundColor: '#24292e',
  },
  btnGitHubText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  btnApple: {
    borderWidth: 1.5, borderColor: '#000', borderRadius: 10,
    padding: 14, alignItems: 'center', marginBottom: 10, backgroundColor: '#000',
  },
  btnAppleText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  btnLink: { alignItems: 'center', paddingVertical: 14 },
  btnLinkText: { color: '#534AB7', fontWeight: '600' },
});