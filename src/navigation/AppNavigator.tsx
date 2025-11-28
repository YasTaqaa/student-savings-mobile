import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList, MainTabParamList, StudentStackParamList } from '../types';
import useStore from '../store/useStore';

import LoginScreen from '../screens/LoginScreen';
import ClassSelectionScreen from '../screens/ClassSelectionScreen';
import StudentListScreen from '../screens/StudentListScreen';
import StudentDetailScreen from '../screens/StudentDetailScreen';
import TransactionScreen from '../screens/TransactionScreen';
import EditStudentScreen from '../screens/EditStudentScreen';
import EditTransactionScreen from '../screens/EditTransactionScreen';
import ReportScreen from '../screens/ReportScreen';
import ProfileScreen from '../screens/ProfileScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const StudentStack = createNativeStackNavigator<StudentStackParamList>();

function StudentNavigator() {
  return (
    <StudentStack.Navigator
      screenOptions={{
        headerTintColor: '#007AFF',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <StudentStack.Screen 
        name="ClassSelection" 
        component={ClassSelectionScreen}
        options={{ 
          title: 'Pilih Kelas',
          headerShown: true,
        }}
      />
      <StudentStack.Screen 
        name="StudentList" 
        component={StudentListScreen}
        options={{ 
          title: 'Daftar Siswa',
          headerShown: true,
        }}
      />
      <StudentStack.Screen 
        name="StudentDetail" 
        component={StudentDetailScreen}
        options={{ 
          title: 'Detail Siswa',
          headerShown: true,
        }}
      />
      <StudentStack.Screen 
        name="EditStudent" 
        component={EditStudentScreen}
        options={{ 
          title: 'Edit Data Siswa',
          headerShown: true,
        }}
      />
      <StudentStack.Screen 
        name="Transaction" 
        component={TransactionScreen}
        options={{ 
          title: 'Input Transaksi',
          headerShown: true,
        }}
      />
      <StudentStack.Screen 
        name="EditTransaction" 
        component={EditTransactionScreen}
        options={{ 
          title: 'Edit Transaksi',
          headerShown: true,
        }}
      />
    </StudentStack.Navigator>
  );
}

function MainNavigator() {
  return (
    <MainTab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <MainTab.Screen 
        name="StudentHome" 
        component={StudentNavigator}
        options={{ 
          title: 'Siswa',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24 }}>👨‍🎓</Text>
          ),
        }}
      />
      <MainTab.Screen 
        name="Reports" 
        component={ReportScreen}
        options={{ 
          title: 'Laporan',
          headerShown: true,
          headerTitleStyle: {
            fontWeight: '600',
          },
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24 }}>📊</Text>
          ),
        }}
      />
      <MainTab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ 
          title: 'Akun',
          headerShown: true,
          headerTitleStyle: {
            fontWeight: '600',
          },
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24 }}>👤</Text>
          ),
        }}
      />
    </MainTab.Navigator>
  );
}

export default function AppNavigator() {
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  
  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <RootStack.Screen name="Login" component={LoginScreen} />
        ) : (
          <RootStack.Screen name="Main" component={MainNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
