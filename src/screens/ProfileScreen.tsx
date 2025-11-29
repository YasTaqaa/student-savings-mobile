import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import useStore from '../store/useStore';
import { common, colors, container, button } from '../styles/utils';

export default function ProfileScreen() {
  const user = useStore((state) => state.user);
  const logout = useStore((state) => state.logout);
  const students = useStore((state) => state.students);
  const transactions = useStore((state) => state.transactions);

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Apakah Anda yakin ingin keluar?');
      if (confirmed) {
        logout();
      }
    } else {
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
              } catch (error) {
                Alert.alert('Error', 'Gagal logout. Silakan coba lagi.');
              }
            },
          },
        ]
      );
    }
  };

  const totalBalance = students.reduce((sum, student) => sum + student.balance, 0);
  const totalDeposits = transactions
    .filter((t) => t.type === 'deposit')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalWithdrawals = transactions
    .filter((t) => t.type === 'withdrawal')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <ScrollView style={container.screen}>
      <View style={common.p5}>
        {/* User Info Card */}
        <View style={[
          common.bgWhite,
          common.roundedXl,
          common.p5,
          common.itemsCenter,
          { marginBottom: 20 },
          common.shadow
        ]}>
          <View style={[
            { width: 80, height: 80 },
            common.roundedFull,
            common.bgPrimary,
            common.justifyCenter,
            common.itemsCenter,
            common.mb4
          ]}>
            <Text style={[{ fontSize: 36 }, common.fontBold, common.textWhite]}>
              {user?.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={[common.text2xl, common.fontBold, common.textBlack, common.mb1]}>
            {user?.name}
          </Text>
          <Text style={[common.textBase, common.textPrimary, common.mb2]}>
            {user?.role === 'admin' ? '👑 Administrator' : '👨‍🏫 Guru'}
          </Text>
          <Text style={[common.textSm, common.textGray500]}>
            @{user?.username}
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={[common.flexRow, { gap: 12, marginBottom: 12 }]}>
          <View style={[common.flex1, common.bgWhite, common.roundedLg, common.p4, common.itemsCenter, common.shadow]}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>👨‍🎓</Text>
            <Text style={[common.textLg, common.fontBold, common.textBlack, common.mb1]}>
              {students.length}
            </Text>
            <Text style={[common.textXs, common.textGray500, common.textCenter]}>
              Total Siswa
            </Text>
          </View>

          <View style={[common.flex1, common.bgWhite, common.roundedLg, common.p4, common.itemsCenter, common.shadow]}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>📝</Text>
            <Text style={[common.textLg, common.fontBold, common.textBlack, common.mb1]}>
              {transactions.length}
            </Text>
            <Text style={[common.textXs, common.textGray500, common.textCenter]}>
              Transaksi
            </Text>
          </View>
        </View>

        <View style={[common.bgPrimary, common.roundedLg, common.p4, common.itemsCenter, common.shadow, { marginBottom: 12 }]}>
          <Text style={{ fontSize: 32, marginBottom: 8 }}>💰</Text>
          <Text style={[common.textLg, common.fontBold, common.textWhite, common.mb1]}>
            Rp {totalBalance.toLocaleString('id-ID')}
          </Text>
          <Text style={[common.textXs, common.textWhite, common.textCenter, { opacity: 0.9 }]}>
            Total Saldo
          </Text>
        </View>

        <View style={[common.flexRow, { gap: 12, marginBottom: 20 }]}>
          <View style={[common.flex1, common.bgSuccess, common.roundedLg, common.p4, common.itemsCenter, common.shadow]}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>💵</Text>
            <Text style={[common.textBase, common.fontBold, common.textWhite, common.mb1]}>
              Rp {totalDeposits.toLocaleString('id-ID')}
            </Text>
            <Text style={[common.textXs, common.textWhite, common.textCenter, { opacity: 0.9 }]}>
              Total Setoran
            </Text>
          </View>

          <View style={[common.flex1, common.bgDanger, common.roundedLg, common.p4, common.itemsCenter, common.shadow]}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>💸</Text>
            <Text style={[common.textBase, common.fontBold, common.textWhite, common.mb1]}>
              Rp {totalWithdrawals.toLocaleString('id-ID')}
            </Text>
            <Text style={[common.textXs, common.textWhite, common.textCenter, { opacity: 0.9 }]}>
              Total Penarikan
            </Text>
          </View>
        </View>

        {/* Info Section */}
        <View style={[common.bgWhite, common.roundedLg, common.p4, { marginBottom: 20 }]}>
          <Text style={[common.textBase, common.fontSemibold, common.textBlack, common.mb4]}>
            ℹ️ Informasi Aplikasi
          </Text>
          
          <View style={[
            common.flexRow,
            common.justifyBetween,
            { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.gray[50] }
          ]}>
            <Text style={[common.textSm, common.textGray500]}>Versi Aplikasi</Text>
            <Text style={[common.textSm, common.fontSemibold, common.textBlack]}>1.0.0</Text>
          </View>
          
          <View style={[
            common.flexRow,
            common.justifyBetween,
            { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.gray[50] }
          ]}>
            <Text style={[common.textSm, common.textGray500]}>Platform</Text>
            <Text style={[common.textSm, common.fontSemibold, common.textBlack]}>Expo React Native</Text>
          </View>
          
          <View style={[common.flexRow, common.justifyBetween, { paddingVertical: 12 }]}>
            <Text style={[common.textSm, common.textGray500]}>Database</Text>
            <Text style={[common.textSm, common.fontSemibold, common.textBlack]}>AsyncStorage (Local)</Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={[
            common.flexRow,
            common.justifyCenter,
            common.itemsCenter,
            common.bgDanger,
            common.p4,
            common.roundedLg,
            common.shadowLg,
            { marginBottom: 20 }
          ]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 20, marginRight: 8 }}>🚪</Text>
          <Text style={[common.textLg, common.fontSemibold, common.textWhite]}>
            Logout
          </Text>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={[
          common.textXs,
          common.textGray500,
          common.textCenter,
          { marginBottom: 40, lineHeight: 18 }
        ]}>
          Sistem Tabungan Siswa SD{'\n'}© 2025 - Semua Hak Dilindungi
        </Text>
      </View>
    </ScrollView>
  );
}
