import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import useStore from './src/store/useStore';

export default function App() {
  const loadData = useStore((state) => state.loadData);

  useEffect(() => {
    loadData();
  }, []);

  return (
    <SafeAreaProvider>
      <AppNavigator />
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
