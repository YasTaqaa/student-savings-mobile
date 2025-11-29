import React from 'react';
import { View, Text, FlatList } from 'react-native';
import useStore from '../store/useStore';
import { common, colors, container } from '../styles/utils';

export default function ReportScreen() {
  const classReports = useStore((state) => state.getClassReport());
  const user = useStore((state) => state.user);
  
  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };
  
  const grandTotal = classReports.reduce((sum, report) => sum + report.totalBalance, 0);
  const totalStudents = classReports.reduce((sum, report) => sum + report.totalStudents, 0);
  
  return (
    <View style={container.screen}>
      {/* Header */}
      <View style={[common.bgWhite, common.p5, common.borderB, common.borderGray100]}>
        <Text style={[common.textXl, common.fontBold, common.textBlack]}>
          Halo, {user?.name} 👋
        </Text>
        <Text style={[common.textSm, common.textGray500, { marginTop: 2 }]}>
          {user?.role === 'admin' ? 'Administrator' : 'Guru'}
        </Text>
      </View>
      
      {/* Summary Card */}
      <View style={[
        common.bgPrimary,
        common.roundedXl,
        common.itemsCenter,
        common.shadowLg,
        { margin: 16, padding: 24 }
      ]}>
        <Text style={[common.textBase, common.textWhite, common.mb2]}>
          💰 Total Keseluruhan
        </Text>
        <Text style={[common.fontBold, common.textWhite, common.mb1, { fontSize: 32 }]}>
          {formatCurrency(grandTotal)}
        </Text>
        <Text style={[common.textSm, common.textWhite, { opacity: 0.9 }]}>
          {totalStudents} siswa dari {classReports.length} tingkat kelas
        </Text>
      </View>
      
      {/* Laporan Per Kelas */}
      <Text style={[
        common.textLg,
        common.fontSemibold,
        common.textBlack,
        { marginHorizontal: 16, marginBottom: 12 }
      ]}>
        📋 Laporan Per Kelas
      </Text>
      
      <FlatList
        data={classReports}
        keyExtractor={(item) => item.className}
        contentContainerStyle={{ padding: 16, paddingTop: 0, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View style={[
            common.bgWhite,
            common.roundedLg,
            common.p4,
            common.shadow,
            { marginBottom: 12 }
          ]}>
            <View style={[common.flexRow, common.justifyBetween, common.mb4]}>
              <Text style={[common.textLg, common.fontSemibold, common.textBlack]}>
                Kelas {item.grade}
              </Text>
              <Text style={[common.textSm, common.textGray500]}>
                {item.totalStudents} siswa
              </Text>
            </View>
            
            <View style={[common.flexRow, common.justifyBetween]}>
              <View style={[common.flex1, common.itemsCenter]}>
                <Text style={[common.textXs, common.textGray500, common.mb1]}>
                  Total Saldo
                </Text>
                <Text style={[
                  common.textSm,
                  common.fontSemibold,
                  common.textBlack,
                  common.textCenter
                ]}>
                  {formatCurrency(item.totalBalance)}
                </Text>
              </View>
              
              <View style={{
                width: 1,
                backgroundColor: colors.gray[100],
                marginHorizontal: 8
              }} />
              
              <View style={[common.flex1, common.itemsCenter]}>
                <Text style={[common.textXs, common.textGray500, common.mb1]}>
                  Total Setoran
                </Text>
                <Text style={[
                  common.textSm,
                  common.fontSemibold,
                  common.textSuccess,
                  common.textCenter
                ]}>
                  {formatCurrency(item.totalDeposits)}
                </Text>
              </View>
              
              <View style={{
                width: 1,
                backgroundColor: colors.gray[100],
                marginHorizontal: 8
              }} />
              
              <View style={[common.flex1, common.itemsCenter]}>
                <Text style={[common.textXs, common.textGray500, common.mb1]}>
                  Total Penarikan
                </Text>
                <Text style={[
                  common.textSm,
                  common.fontSemibold,
                  common.textDanger,
                  common.textCenter
                ]}>
                  {formatCurrency(item.totalWithdrawals)}
                </Text>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={[common.itemsCenter, { marginTop: 60, paddingHorizontal: 40 }]}>
            <Text style={{ fontSize: 64, marginBottom: 16 }}>📊</Text>
            <Text style={[
              common.textLg,
              common.fontSemibold,
              common.textBlack,
              common.mb2,
              common.textCenter
            ]}>
              Belum ada data laporan
            </Text>
            <Text style={[common.textSm, common.textGray500, common.textCenter]}>
              Tambahkan siswa dan transaksi terlebih dahulu
            </Text>
          </View>
        }
      />
    </View>
  );
}
