import React, { useRef, useCallback } from 'react';
import {View,Text,TouchableOpacity,ScrollView,Alert,Platform,Animated,} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import useStore from '../store/useStore';
import { common, container, button } from '../styles/utils';

export default function ProfileScreen() {
  const user = useStore((state) => state.user);
  const logout = useStore((state) => state.logout);
  const students = useStore((state) => state.students);
  const transactions = useStore((state) => state.transactions);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useFocusEffect(
    useCallback(() => {
      fadeAnim.setValue(0);
      translateY.setValue(20);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();

      return () => {};
    }, [fadeAnim, translateY]),
  );

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Apakah Anda yakin ingin keluar?');
      if (confirmed) logout();
      return;
    }

    Alert.alert(
      'Konfirmasi Logout',
      'Apakah Anda yakin ingin keluar?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch {
              Alert.alert('Error', 'Gagal logout. Silakan coba lagi.');
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  const totalBalance = students.reduce(
    (sum, student) => sum + student.balance,
    0,
  );
  const totalDeposits = transactions
    .filter((t) => t.type === 'deposit')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalWithdrawals = transactions
    .filter((t) => t.type === 'withdrawal')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <ScrollView
      style={container.screen}
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
    >
      {/* Header */}
      <Text style={[common.title, common.mb2]}>Profil</Text>
      <Text style={[common.caption, common.mb4]}>
        Informasi akun dan ringkasan data
      </Text>

      {/* Kartu user + ringkasan dengan animasi */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY }],
        }}
      >
        {/* Kartu user */}
        <View
          style={[
            common.bgWhite,
            common.roundedLg,
            common.p4,
            common.shadow,
            common.flexRow,
            common.itemsCenter,
          ]}
        >
          <View
            style={[
              common.w15,
              common.h15,
              common.roundedFull,
              common.bgPrimary,
              common.itemsCenter,
              common.justifyCenter,
              common.mr2,
            ]}
          >
            <Text style={[common.textWhite, common.textXl, common.fontBold]}>
              {user?.name?.charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={[common.fontSemibold, common.textLg]}>
              {user?.name}
            </Text>
            <Text style={[common.textGray500, common.mt1]}>
              {user?.role === 'admin' ? 'Administrator' : 'Guru'}
            </Text>
            <Text style={[common.caption, common.mt1]}>@{user?.username}</Text>
          </View>
        </View>

        {/* Ringkasan singkat */}
        <View
          style={[
            common.bgWhite,
            common.roundedLg,
            common.p4,
            common.mt3,
            common.shadow,
          ]}
        >
          <Text style={[common.subtitle, common.mb3]}>Ringkasan</Text>

          <View style={[common.flexRow, common.justifyBetween, common.mb2]}>
            <View>
              <Text style={common.caption}>Total Siswa</Text>
              <Text style={[common.fontSemibold, common.textLg]}>
                {students.length}
              </Text>
            </View>
            <View>
              <Text style={common.caption}>Total Setoran</Text>
              <Text style={[common.textSuccess, common.fontSemibold]}>
                Rp {totalDeposits.toLocaleString('id-ID')}
              </Text>
            </View>
          </View>

          <View style={[common.mt2]}>
            <Text style={common.caption}>Total Saldo</Text>
            <Text
              style={[common.fontBold, common.textLg, common.textPrimary]}
            >
              Rp {totalBalance.toLocaleString('id-ID')}
            </Text>
          </View>

          <View style={[common.mt2]}>
            <Text style={common.caption}>Total Penarikan</Text>
            <Text style={[common.textDanger, common.fontSemibold]}>
              Rp {totalWithdrawals.toLocaleString('id-ID')}
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Tombol logout */}
      <View style={[common.mt4]}>
        <TouchableOpacity style={button.danger} onPress={handleLogout}>
          <Text style={button.textWhite}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Footer kecil */}
      <View style={[common.mt4, common.itemsCenter]}>
        <Text style={[common.caption, common.textCenter]}>
          Sistem Tabungan Siswa SD{'\n'}Kelompok 5
        </Text>
      </View>
    </ScrollView>
  );
}
