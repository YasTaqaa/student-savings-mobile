// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import useStore from '../store/useStore';
import * as AuthService from '../services/authService';
import { common, colors, container, button, input } from '../styles/utils';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'teacher'>('admin');
  const [loading, setLoading] = useState(false);

  const login = useStore((state) => state.login);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Email dan password harus diisi');
      return;
    }

    setLoading(true);
    try {
      const response = await AuthService.login({ email, password, role });
      if (response.success && response.user) {
        await login(response.user);
      } else {
        Alert.alert('Login Gagal', response.message || 'Terjadi kesalahan');
      }
    } catch (error) {
      Alert.alert('Error', 'Terjadi kesalahan, silakan coba lagi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={container.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[container.screen, common.p5, { justifyContent: 'center' }]}>
        <Text style={[common.text2xl, common.fontBold, common.mb3, common.textBlack]}>
          Sistem Tabungan Siswa
        </Text>

        <Text style={input.label}>Email</Text>
        <TextInput
          style={input.base}
          placeholder="Masukkan email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={input.label}>Password</Text>
        <TextInput
          style={input.base}
          placeholder="Masukkan password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Text style={[input.label, { marginTop: 16 }]}>Masuk sebagai</Text>
        <View style={[common.flexRow, common.mt1]}>
          <TouchableOpacity
            style={[
              button.secondary,
              common.mr2,
              {
                flex: 1,
                borderWidth: role === 'admin' ? 2 : 1,
                borderColor: role === 'admin' ? colors.primary : colors.gray[100],
              },
            ]}
            onPress={() => setRole('admin')}
          >
            <Text style={role === 'admin' ? common.textPrimary : common.textBlack}>
              Admin
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              button.secondary,
              {
                flex: 1,
                borderWidth: role === 'teacher' ? 2 : 1,
                borderColor: role === 'teacher' ? colors.primary : colors.gray[100],
              },
            ]}
            onPress={() => setRole('teacher')}
          >
            <Text style={role === 'teacher' ? common.textPrimary : common.textBlack}>
              Guru
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[button.primary, common.mt4]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={button.textWhite}>Login</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
