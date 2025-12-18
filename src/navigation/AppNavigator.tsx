import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {RootStackParamList,MainTabParamList,StudentStackParamList,} from '../types';
import useStore from '../store/useStore';

import LoginScreen from '../screens/LoginScreen';
import ClassSelectionScreen from '../screens/ClassSelectionScreen';
import StudentListScreen from '../screens/StudentListScreen';
import EditStudentScreen from '../screens/EditStudentScreen';
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
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <StudentStack.Screen
        name="ClassSelection"
        component={ClassSelectionScreen}
        options={{ title: 'Pilih Kelas', headerShown: true }}
      />
      <StudentStack.Screen
        name="StudentList"
        component={StudentListScreen}
        options={{ title: 'Daftar Siswa', headerShown: true }}
      />
      <StudentStack.Screen
        name="EditStudent"
        component={EditStudentScreen}
        options={{ title: 'Edit Data Siswa', headerShown: true }}
      />
    </StudentStack.Navigator>
  );
}

function MainNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <MainTab.Navigator
      screenOptions={{
        headerTitleStyle: { fontWeight: '600' },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E5EA',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      {/* TAB SISWA */}
      <MainTab.Screen
        name="StudentHome"
        component={StudentNavigator}
        options={{
          title: 'Siswa',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 24 }}>👨</Text>
          ),
        }}
        // trik: setiap tab ini ditekan, paksa navigate ke ClassSelection
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('StudentHome', {
              screen: 'ClassSelection',
            } as any);
          },
        })}
      />

      {/* TAB LAPORAN */}
      <MainTab.Screen
        name="Reports"
        component={ReportScreen}
        options={{
          title: 'Laporan',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 24 }}>📊</Text>
          ),
        }}
      />

      {/* TAB PROFIL */}
      <MainTab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Akun',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 24 }}>⚙️</Text>
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
