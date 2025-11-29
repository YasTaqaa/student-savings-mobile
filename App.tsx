import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import useStore from './src/store/useStore';

export default function App() {
  const loadData = useStore((state) => state.loadData);

  useEffect(() => {
    loadData();
  }, []);

  return (
    <>
      <AppNavigator />
      <StatusBar style="auto" />
    </>
  );
}
