import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { LogBox } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppNavigator from './src/navigation/AppNavigator';
import useStore from './src/store/useStore';

LogBox.ignoreLogs(['@firebase/auth: Auth (12.6.0):']);

export default function App() {
  const loadData = useStore((state) => state.loadData);
  const isAppReady = useStore((state) => state.isAppReady);

  useEffect(() => {
    loadData(); 
  }, [loadData]);

  if (!isAppReady) {
    return (
      <SafeAreaProvider>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ActivityIndicator size="large" />
          <StatusBar style="auto" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <AppNavigator />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
