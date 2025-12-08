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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useStore((state) => state.login);
  
  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Username dan password harus diisi');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await AuthService.login({ username, password });
      
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
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={common.p5}>
        <Text style={[common.text3xl, common.fontBold, common.textBlack, common.textCenter, common.mb2]}>
          Sistem Tabungan Siswa
        </Text>
        <Text style={[common.textBase, common.textGray500, common.textCenter, { marginBottom: 40 }]}>
          Login Guru/Admin
        </Text>
        
        <TextInput
          style={[input.base, common.mb4]}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
        />
        
        <TextInput
          style={[input.base, common.mb4]}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          editable={!loading}
        />
        
        <TouchableOpacity 
          style={[button.primary, { marginTop: 8 }, loading && { opacity: 0.6 }]} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={button.textWhite}>Login</Text>
          )}
        </TouchableOpacity>
        
        <View style={[common.bgWhite, common.p4, common.roundedLg, { marginTop: 30 }]}>
          <Text style={[common.textSm, common.fontSemibold, common.textBlack, common.mb2]}>
            Akun Demo:
          </Text>
          <Text style={[common.textSm, common.textGray500, common.mb1]}>
            • Admin: admin / admin123
          </Text>
          <Text style={[common.textSm, common.textGray500, common.mb1]}>
            • Guru 1: guru / guru123
          </Text>
          <Text style={[common.textSm, common.textGray500]}>
            • Guru 2: guru2 / guru123
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}