import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { StudentStackParamList, Transaction } from '../types';
import useStore from '../store/useStore';

type NavigationProp = NativeStackNavigationProp<StudentStackParamList, 'StudentDetail'>;
type RouteProps = RouteProp<StudentStackParamList, 'StudentDetail'>;

interface Props {
  navigation: NavigationProp;
  route: RouteProps;
}

export default function StudentDetailScreen({ navigation, route }: Props) {
  const { studentId } = route.params;
  const student = useStore((state) => state.getStudentById(studentId));
  const transactions = useStore((state) => state.getTransactionsByStudent(studentId));
  const deleteTransaction = useStore((state) => state.deleteTransaction);
  
  if (!student) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Data siswa tidak ditemukan</Text>
      </View>
    );
  }
  
  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };
  
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  const handleEditTransaction = (transactionId: string) => {
    navigation.navigate('EditTransaction', { studentId, transactionId });
  };
  
  const handleDeleteTransaction = (transaction: Transaction) => {
    Alert.alert(
      'Hapus Transaksi',
      `Hapus ${transaction.type === 'deposit' ? 'setoran' : 'penarikan'} sebesar ${formatCurrency(transaction.amount)}?\n\nSaldo akan otomatis disesuaikan.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            await deleteTransaction(transaction.id);
            Alert.alert('Berhasil', 'Transaksi berhasil dihapus');
          },
        },
      ]
    );
  };
  
  const renderTransactionItem = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionCard}>
      <View style={styles.transactionContent}>
        <View style={styles.transactionHeader}>
          <Text
            style={[
              styles.transactionType,
              item.type === 'deposit' ? styles.depositType : styles.withdrawalType,
            ]}
          >
            {item.type === 'deposit' ? '💰 SETORAN' : '💸 PENARIKAN'}
          </Text>
          <Text style={styles.transactionDate}>{formatDate(item.date)}</Text>
        </View>
        <Text
          style={[
            styles.transactionAmount,
            item.type === 'deposit' ? styles.depositAmount : styles.withdrawalAmount,
          ]}
        >
          {item.type === 'deposit' ? '+' : '-'} {formatCurrency(item.amount)}
        </Text>
        {item.description ? (
          <Text style={styles.transactionDesc}>{item.description}</Text>
        ) : null}
      </View>
      
      <View style={styles.transactionActions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.editBtn]}
          onPress={() => handleEditTransaction(item.id)}
        >
          <Text style={styles.actionBtnText}>✏️ Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={() => handleDeleteTransaction(item)}
        >
          <Text style={[styles.actionBtnText, styles.deleteBtnText]}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.studentName}>{student.name}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>NIS:</Text>
            <Text style={styles.infoValue}>{student.nis}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Kelas:</Text>
            <Text style={styles.infoValue}>{student.class}</Text>
          </View>
        </View>
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Saldo Tabungan</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(student.balance)}</Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.transactionButton}
        onPress={() => navigation.navigate('Transaction', { studentId })}
      >
        <Text style={styles.transactionButtonText}>+ Transaksi Baru</Text>
      </TouchableOpacity>
      
      <View style={styles.historyContainer}>
        <Text style={styles.historyTitle}>
          📋 Riwayat Transaksi ({sortedTransactions.length})
        </Text>
        <FlatList
          data={sortedTransactions}
          keyExtractor={(item) => item.id}
          renderItem={renderTransactionItem}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📝</Text>
              <Text style={styles.emptyText}>Belum ada transaksi</Text>
            </View>
          }
        />
      </View>
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
  headerInfo: {
    marginBottom: 16,
  },
  studentName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 16,
    color: '#8E8E93',
    width: 60,
  },
  infoValue: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  balanceContainer: {
    padding: 16,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#FFF',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  transactionButton: {
    backgroundColor: '#34C759',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  transactionButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  historyContainer: {
    flex: 1,
    padding: 16,
    paddingTop: 0,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000',
  },
  transactionCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  transactionContent: {
    padding: 16,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  transactionType: {
    fontSize: 12,
    fontWeight: '700',
  },
  depositType: {
    color: '#34C759',
  },
  withdrawalType: {
    color: '#FF3B30',
  },
  transactionDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  transactionAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  depositAmount: {
    color: '#34C759',
  },
  withdrawalAmount: {
    color: '#FF3B30',
  },
  transactionDesc: {
    fontSize: 14,
    color: '#8E8E93',
  },
  transactionActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtn: {
    backgroundColor: '#E8F4FD',
    borderRightWidth: 1,
    borderRightColor: '#F2F2F7',
  },
  deleteBtn: {
    backgroundColor: '#FFEBEE',
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  deleteBtnText: {
    color: '#FF3B30',
    fontSize: 18,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#8E8E93',
    fontSize: 16,
  },
  errorText: {
    textAlign: 'center',
    color: '#FF3B30',
    fontSize: 16,
    marginTop: 40,
  },
});
