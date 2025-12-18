import React, { useState } from 'react';
import {View,Text,TextInput,Image,TouchableOpacity,Alert,KeyboardAvoidingView,Platform,ActivityIndicator,} from 'react-native';
import useStore from '../store/useStore';
import * as AuthService from '../services/authService';
import { common, colors, container, button, input } from '../styles/utils';
import { Ionicons } from '@expo/vector-icons';


export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const Logo = require('../../assets/Logo.png');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'admin' | 'teacher'>('admin');
  const [loading, setLoading] = useState(false);

  const login = useStore((state) => state.login);

  const handleLogin = async () => {
  if (!email.trim() || !password.trim()) {
    Alert.alert('Error', 'Username dan password harus diisi');
    return;
  }

  let mappedEmail: string | null = null;

  if (email === 'sdn3linggasariadmin') {
    mappedEmail = 'sdn3linggasari@sekolah.com';
  } else if (email === '123456guru') {
    mappedEmail = '123456guru@sekolah.com';
  } else {
    Alert.alert('Error', 'Username tidak dikenali');
    return;
  }

  setLoading(true);

  try {
    const response = await AuthService.login({
      email: mappedEmail,
      password,
      role,
    });

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
        <View style={{ alignItems: 'center', marginBottom: 24, marginTop: 40 }}>
      <View
        style={{
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <Image
        source={Logo}
        style={{ width: 48, height: 48, resizeMode: 'contain' }}
      />
    </View>

    <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 4 }}>
      Sistem Tabungan Siswa
    </Text>
    <Text style={{ color: '#6B7280', fontSize: 12 }}>
      SDN 3 Linggasari
    </Text>
  </View>
        <Text style={input.label}>Username</Text>
        <TextInput
          style={input.base}
          placeholder="Masukkan username"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={input.label}>Password</Text>
        <View style={{ position: 'relative' }}>
        <TextInput
          style={input.base}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
        onPress={() => setShowPassword((prev) => !prev)}
        style={{
        position: 'absolute',
        right: 12,
        top: '50%',
        transform: [{ translateY: -12 }],
        padding: 4,
        }}
      >
      <Ionicons
        name={showPassword ? 'eye-off' : 'eye'}
        size={20}
        color={colors.gray[400]}
        />
        </TouchableOpacity>
    </View>


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
