import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { StudentStackParamList } from '../types';
import useStore from '../store/useStore';

type NavigationProp = NativeStackNavigationProp<StudentStackParamList, 'Transaction'>;
type RouteProps = RouteProp<StudentStackParamList, 'Transaction'>;

interface Props {
  navigation: NavigationProp;
  route: RouteProps;
}

export default function TransactionScreen({ navigation, route }: Props) {
  const { studentId } = route.params;
  const student = useStore((state) => state.getStudentById(studentId));
  const addTransaction = useStore((state) => state.addTransaction);
  const user = useStore((state) => state.user);
  
  const [type, setType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  
  if (!student || !user) {
    return null;
  }
  
  const handleSubmit = () => {
    const numAmount = parseFloat(amount);
    
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Error', 'Nominal harus lebih dari 0');
      return;
    }
    
    if (type === 'withdrawal' && numAmount > student.balance) {
      Alert.alert(
        'Saldo Tidak Cukup',
        `Saldo siswa: Rp ${student.balance.toLocaleString('id-ID')}\nJumlah penarikan: Rp ${numAmount.toLocaleString('id-ID')}`
      );
      return;
    }
    
    addTransaction({
      studentId,
      type,
      amount: numAmount,
      date: new Date().toISOString(),
      description: description.trim(),
      createdBy: user.id,
    });
    
    Alert.alert(
      'Berhasil',
      `${type === 'deposit' ? 'Setoran' : 'Penarikan'} sebesar Rp ${numAmount.toLocaleString('id-ID')} berhasil disimpan`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };
  
  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    return isNaN(num) ? 'Rp 0' : `Rp ${num.toLocaleString('id-ID')}`;
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{student.name}</Text>
          <Text style={styles.studentClass}>Kelas {student.class}</Text>
          <Text style={styles.currentBalance}>
            Saldo: Rp {student.balance.toLocaleString('id-ID')}
          </Text>
        </View>
        
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
        />
        {amount ? (
          <Text style={styles.previewAmount}>{formatCurrency(amount)}</Text>
        ) : null}
        
        <Text style={styles.label}>Keterangan (Opsional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Contoh: Tabungan mingguan, Iuran kelas"
          multiline
          numberOfLines={3}
          value={description}
          onChangeText={setDescription}
        />
        
        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: type === 'deposit' ? '#34C759' : '#FF3B30' },
          ]}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>
            Simpan {type === 'deposit' ? 'Setoran' : 'Penarikan'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    padding: 20,
  },
  studentInfo: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
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
    marginBottom: 8,
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
    marginBottom: 16,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
