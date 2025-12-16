import React, { useEffect } from 'react';
import { LogBox } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppNavigator from './src/navigation/AppNavigator';
import useStore from './src/store/useStore';

// Pindah ke paling atas, jalankan sekali sebelum komponen
LogBox.ignoreLogs([
  '@firebase/auth: Auth (12.6.0):',
]);

export default function App() {
  const loadData = useStore((state) => state.loadData);
  const isAuthenticated = useStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
