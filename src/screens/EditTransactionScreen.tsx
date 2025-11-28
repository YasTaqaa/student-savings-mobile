import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { StudentStackParamList } from '../types';
import useStore from '../store/useStore';

type NavigationProp = NativeStackNavigationProp<StudentStackParamList, 'EditTransaction'>;
type RouteProps = RouteProp<StudentStackParamList, 'EditTransaction'>;

interface Props {
  navigation: NavigationProp;
  route: RouteProps;
}

export default function EditTransactionScreen({ navigation, route }: Props) {
  const { studentId, transactionId } = route.params;
  const student = useStore((state) => state.getStudentById(studentId));
  const transaction = useStore((state) => 
    state.transactions.find((t) => t.id === transactionId)
  );
  const updateTransaction = useStore((state) => state.updateTransaction);
  const user = useStore((state) => state.user);

  const [type, setType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setAmount(transaction.amount.toString());
      setDescription(transaction.description);
      setDate(transaction.date);
    }
  }, [transaction]);

  if (!student || !transaction || !user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Data tidak ditemukan</Text>
      </View>
    );
  }

  const handleUpdate = async () => {
    const numAmount = parseFloat(amount);

    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Error', 'Nominal harus lebih dari 0');
      return;
    }

    let simulatedBalance = student.balance;
    if (transaction.type === 'deposit') {
      simulatedBalance -= transaction.amount;
    } else {
      simulatedBalance += transaction.amount;
    }

    if (type === 'deposit') {
      simulatedBalance += numAmount;
    } else {
      simulatedBalance -= numAmount;
    }

    if (simulatedBalance < 0) {
      Alert.alert(
        'Saldo Tidak Cukup',
        `Perubahan ini akan membuat saldo negatif.\n\nSaldo saat ini: Rp ${student.balance.toLocaleString('id-ID')}\nSaldo setelah edit: Rp ${simulatedBalance.toLocaleString('id-ID')}`
      );
      return;
    }

    setLoading(true);

    try {
      await updateTransaction(transactionId, {
        type,
        amount: numAmount,
        description: description.trim(),
        date,
      });

      Alert.alert(
        'Berhasil',
        'Transaksi berhasil diupdate',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Terjadi kesalahan saat menyimpan');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    return isNaN(num) ? 'Rp 0' : `Rp ${num.toLocaleString('id-ID')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.studentInfo}>
            <Text style={styles.studentName}>{student.name}</Text>
            <Text style={styles.studentClass}>Kelas {student.class}</Text>
            <Text style={styles.currentBalance}>
              Saldo: Rp {student.balance.toLocaleString('id-ID')}
            </Text>
          </View>

          <View style={styles.originalInfo}>
            <Text style={styles.originalTitle}>📝 Data Transaksi Asli:</Text>
            <Text style={styles.originalText}>
              Jenis: {transaction.type === 'deposit' ? 'Setoran' : 'Penarikan'}
            </Text>
            <Text style={styles.originalText}>
              Nominal: Rp {transaction.amount.toLocaleString('id-ID')}
            </Text>
            <Text style={styles.originalText}>
              Tanggal: {formatDate(transaction.date)}
            </Text>
            {transaction.description && (
              <Text style={styles.originalText}>
                Keterangan: {transaction.description}
              </Text>
            )}
          </View>

          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Edit Transaksi:</Text>

          <Text style={styles.label}>Jenis Transaksi</Text>
          <View style={styles.typeContainer}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                type === 'deposit' && styles.typeButtonActive,
                { backgroundColor: type === 'deposit' ? '#34C759' : '#F2F2F7' },
              ]}
              onPress={() => setType('deposit')}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  type === 'deposit' && styles.typeButtonTextActive,
                ]}
              >
                Setoran
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeButton,
                type === 'withdrawal' && styles.typeButtonActive,
                { backgroundColor: type === 'withdrawal' ? '#FF3B30' : '#F2F2F7' },
              ]}
              onPress={() => setType('withdrawal')}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  type === 'withdrawal' && styles.typeButtonTextActive,
                ]}
              >
                Penarikan
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Nominal</Text>
          <TextInput
            style={styles.input}
            placeholder="Masukkan nominal"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
            editable={!loading}
          />
          {amount ? (
            <Text style={styles.previewAmount}>{formatCurrency(amount)}</Text>
          ) : null}

          <Text style={styles.label}>Keterangan (Opsional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Contoh: Koreksi input, Tabungan mingguan"
            multiline
            numberOfLines={3}
            value={description}
            onChangeText={setDescription}
            editable={!loading}
          />

          <View style={styles.warningBox}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={styles.warningText}>
              Saldo siswa akan otomatis disesuaikan dengan perubahan transaksi ini.
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => navigation.goBack()}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Batal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.updateButton,
                { backgroundColor: type === 'deposit' ? '#34C759' : '#FF3B30' },
                loading && styles.buttonDisabled,
              ]}
              onPress={handleUpdate}
              disabled={loading}
            >
              <Text style={styles.updateButtonText}>
                {loading ? 'Menyimpan...' : 'Update Transaksi'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  studentInfo: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  studentName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  studentClass: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  currentBalance: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginTop: 8,
  },
  originalInfo: {
    backgroundColor: '#FFF9E6',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD60A',
  },
  originalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  originalText: {
    fontSize: 14,
    color: '#000',
    marginBottom: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
    marginTop: 8,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  typeButtonActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  typeButtonTextActive: {
    color: '#FFF',
  },
  input: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  previewAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginTop: 8,
    marginBottom: 8,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF3CD',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFC107',
  },
  warningIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 40,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F2F2F7',
  },
  cancelButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  updateButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  updateButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  errorText: {
    textAlign: 'center',
    color: '#FF3B30',
    fontSize: 16,
    marginTop: 40,
  },
});
