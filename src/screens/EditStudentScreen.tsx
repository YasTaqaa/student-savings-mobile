import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { StudentStackParamList, getGradeFromClass } from '../types';
import useStore from '../store/useStore';
import ClassPicker from '../components/ClassPicker';
import { common, colors, container, button, input } from '../styles/utils';

type NavigationProp = NativeStackNavigationProp<StudentStackParamList, 'EditStudent'>;
type RouteProps = RouteProp<StudentStackParamList, 'EditStudent'>;

interface Props {
  navigation: NavigationProp;
  route: RouteProps;
}

export default function EditStudentScreen({ navigation, route }: Props) {
  const { studentId } = route.params;
  const student = useStore((state) => state.getStudentById(studentId));
  const updateStudent = useStore((state) => state.updateStudent);
  const students = useStore((state) => state.students);

  const [nis, setNis] = useState('');
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (student) {
      setNis(student.nis);
      setName(student.name);
      setSelectedClass(student.class);
      setBalance(student.balance.toString());
    }
  }, [student]);

  if (!student) {
    return (
      <View style={container.screen}>
        <Text style={[common.textCenter, common.textDanger, common.textBase, { marginTop: 40 }]}>
          Data siswa tidak ditemukan
        </Text>
      </View>
    );
  }

  const handleUpdate = async () => {
    if (!nis.trim() || !name.trim() || !selectedClass) {
      Alert.alert('Error', 'NIS, Nama, dan Kelas harus diisi');
      return;
    }

    const balanceNum = parseFloat(balance);
    if (isNaN(balanceNum) || balanceNum < 0) {
      Alert.alert('Error', 'Saldo harus berupa angka dan tidak boleh negatif');
      return;
    }

    const isDuplicate = students.some(
      (s) => s.nis === nis.trim() && s.id !== studentId
    );

    if (isDuplicate) {
      Alert.alert('Error', `NIS ${nis} sudah digunakan siswa lain`);
      return;
    }

    setLoading(true);

    try {
      const grade = getGradeFromClass(selectedClass);
      
      await updateStudent(studentId, {
        nis: nis.trim(),
        name: name.trim(),
        class: selectedClass,
        grade,
        balance: balanceNum,
      });

      // Langsung kembali
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Terjadi kesalahan saat menyimpan data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    if (numericValue === '') return '0';
    return parseInt(numericValue).toLocaleString('id-ID');
  };

  const handleBalanceChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setBalance(numericValue);
  };

  return (
    <KeyboardAvoidingView
      style={container.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={common.flex1}>
        <View style={common.p5}>
          <Text style={input.label}>NIS (Nomor Induk Siswa)</Text>
          <TextInput
            style={input.base}
            placeholder="Masukkan NIS"
            value={nis}
            onChangeText={setNis}
            keyboardType="numeric"
            editable={!loading}
          />

          <Text style={input.label}>Nama Lengkap</Text>
          <TextInput
            style={input.base}
            placeholder="Masukkan nama lengkap"
            value={name}
            onChangeText={setName}
            editable={!loading}
          />

          <ClassPicker
            label="Kelas"
            selectedClass={selectedClass}
            onSelectClass={setSelectedClass}
          />

          <Text style={input.label}>Saldo Tabungan</Text>
          <View style={[input.base, common.flexRow, common.itemsCenter]}>
            <Text style={[common.textBase, common.textGray500, common.mr2]}>Rp</Text>
            <TextInput
              style={[common.flex1, { fontSize: 16, padding: 0 }]}
              placeholder="0"
              value={formatCurrency(balance)}
              onChangeText={handleBalanceChange}
              keyboardType="numeric"
              editable={!loading}
            />
          </View>
          <Text style={[common.textXs, common.textGray500, { marginTop: 4, fontStyle: 'italic' }]}>
            💡 Saldo dapat diedit langsung
          </Text>

          <View style={[common.flexRow, { gap: 12, marginTop: 32, marginBottom: 40 }]}>
            <TouchableOpacity
              style={[button.secondary, common.flex1]}
              onPress={() => navigation.goBack()}
              disabled={loading}
            >
              <Text style={button.text}>Batal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[button.primary, common.flex1, loading && { opacity: 0.6 }]}
              onPress={handleUpdate}
              disabled={loading}
            >
              <Text style={button.textWhite}>
                {loading ? 'Menyimpan...' : 'Simpan'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}