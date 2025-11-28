import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from 'react-native';
import useStore from '../store/useStore';

export default function ReportScreen() {
  const classReports = useStore((state) => state.getClassReport());
  const user = useStore((state) => state.user);
  
  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };
  
  const grandTotal = classReports.reduce((sum, report) => sum + report.totalBalance, 0);
  const totalStudents = classReports.reduce((sum, report) => sum + report.totalStudents, 0);
  
  return (
    <View style={styles.container}>
      {/* Header Info User - TANPA LOGOUT */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Halo, {user?.name} 👋</Text>
          <Text style={styles.role}>{user?.role === 'admin' ? 'Administrator' : 'Guru'}</Text>
        </View>
      </View>
      
      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>💰 Total Keseluruhan</Text>
        <Text style={styles.summaryAmount}>{formatCurrency(grandTotal)}</Text>
        <Text style={styles.summarySubtitle}>
          {totalStudents} siswa dari {classReports.length} tingkat kelas
        </Text>
      </View>
      
      {/* Laporan Per Kelas */}
      <Text style={styles.sectionTitle}>📋 Laporan Per Kelas</Text>
      <FlatList
        data={classReports}
        keyExtractor={(item) => item.className}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <View style={styles.classCard}>
            <View style={styles.classHeader}>
              <Text style={styles.className}>Kelas {item.grade}</Text>
              <Text style={styles.studentCount}>{item.totalStudents} siswa</Text>
            </View>
            
            <View style={styles.classStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Total Saldo</Text>
                <Text style={styles.statValue}>{formatCurrency(item.totalBalance)}</Text>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Total Setoran</Text>
                <Text style={[styles.statValue, styles.depositText]}>
                  {formatCurrency(item.totalDeposits)}
                </Text>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Total Penarikan</Text>
                <Text style={[styles.statValue, styles.withdrawalText]}>
                  {formatCurrency(item.totalWithdrawals)}
                </Text>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyText}>Belum ada data laporan</Text>
            <Text style={styles.emptySubtext}>Tambahkan siswa dan transaksi terlebih dahulu</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    backgroundColor: '#FFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  role: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  summaryCard: {
    backgroundColor: '#007AFF',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  summaryTitle: {
    fontSize: 16,
    color: '#FFF',
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  summarySubtitle: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 100,
  },
  classCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  className: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  studentCount: {
    fontSize: 14,
    color: '#8E8E93',
  },
  classStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  depositText: {
    color: '#34C759',
  },
  withdrawalText: {
    color: '#FF3B30',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
});
