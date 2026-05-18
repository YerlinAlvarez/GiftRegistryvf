import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../src/presentation/viewmodels/useAuthViewModel';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');

  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);
  const registerWithEmail = useAuthStore((s) => s.registerWithEmail);

  useEffect(() => {
    if (error) Alert.alert('Aviso', error, [{ text: 'OK', onPress: clearError }]);
  }, [error, clearError]);

  useEffect(() => {
    if (user) router.replace('/');
  }, [user]);

  const handleRegister = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Campos requeridos', 'Ingresa email y contraseña');
      return;
    }
    if (password !== password2) {
      Alert.alert('Contraseñas', 'Las contraseñas no coinciden');
      return;
    }
    await registerWithEmail(email, password);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Crear cuenta</Text>
        <Text style={styles.subtitle}>Registro para organizadora</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="correo@ejemplo.com"
          placeholderTextColor="#B4B2A9"
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            clearError();
          }}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
        />

        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="mínimo 6 caracteres"
          placeholderTextColor="#B4B2A9"
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            clearError();
          }}
          secureTextEntry
        />

        <Text style={styles.label}>Confirmar contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="repite tu contraseña"
          placeholderTextColor="#B4B2A9"
          value={password2}
          onChangeText={(t) => {
            setPassword2(t);
            clearError();
          }}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.btnPrimary, isLoading && styles.btnDisabled]}
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnPrimaryText}>Crear cuenta</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnLink} onPress={() => router.back()}>
          <Text style={styles.btnLinkText}>Ya tengo cuenta</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#F1EFE8',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C2C2A',
  },
  subtitle: {
    fontSize: 14,
    color: '#888780',
    marginTop: 6,
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#444441',
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D3D1C7',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: '#2C2C2A',
    backgroundColor: '#FAFAF8',
    marginBottom: 14,
  },
  btnPrimary: {
    backgroundColor: '#534AB7',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 6,
  },
  btnDisabled: { opacity: 0.6 },
  btnPrimaryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  btnLink: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  btnLinkText: {
    color: '#534AB7',
    fontWeight: '600',
  },
});

