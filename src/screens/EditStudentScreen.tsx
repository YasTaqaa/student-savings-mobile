import React, { useState } from 'react';
import {View,Text,TextInput,TouchableOpacity,ScrollView,Alert,} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StudentStackParamList } from '../types';
import useStore from '../store/useStore';
import { common, container, button, colors, input } from '../styles/utils';
import ClassPicker from '../components/ClassPicker';

type Props = NativeStackScreenProps<StudentStackParamList, 'EditStudent'>;

export default function EditStudentScreen({ route, navigation }: Props) {
  const { studentId } = route.params;

  const getStudentById = useStore((state) => state.getStudentById);
  const updateStudent = useStore((state) => state.updateStudent);
  const addTransaction = useStore((state) => state.addTransaction);
  const currentUser = useStore((state) => state.user);

  const isAdmin = currentUser?.role === 'admin';
  const isTeacher = currentUser?.role === 'teacher';

  const student = getStudentById(studentId);

  const [nis, setNis] = useState(student?.nis || '');
  const [name, setName] = useState(student?.name || '');
  const [grade, setGrade] = useState<number>(Number(student?.grade) || 1);
  const [studentClass, setStudentClass] = useState(student?.class || '');
  const currentBalance = student?.balance || 0;

  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [saving, setSaving] = useState(false);

  if (!student) {
    return (
      <View style={[container.screen, common.itemsCenter, common.justifyCenter]}>
        <Text style={common.textBase}>Data siswa tidak ditemukan.</Text>
      </View>
    );
  }

  const parseAmount = (value: string) => {
    const onlyNumber = value.replace(/[^0-9]/g, '');
    return Number(onlyNumber || 0);
  };

  const handleSave = async () => {
    if (!isAdmin) {
      Alert.alert('Akses Ditolak', 'Hanya admin yang dapat mengedit data siswa');
      return;
    }

    if (!nis.trim() || !name.trim()) {
      Alert.alert('Validasi', 'NIS dan Nama lengkap harus diisi');
      return;
    }

    setSaving(true);
    try {
      await updateStudent(student.id, {
        nis: nis.trim(),
        name: name.trim(),
        grade: grade.toString(),
        class: studentClass,
      });
      navigation.navigate('StudentList', { grade: grade.toString() });
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Gagal menyimpan data siswa');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveReadonly = () => {
    // untuk guru: tidak mengubah data, hanya kembali
    navigation.goBack();
  };

  const handleDeposit = async () => {
    const amount = parseAmount(depositAmount);
    if (!amount) {
      Alert.alert('Validasi', 'Nominal setoran tidak boleh kosong');
      return;
    }

    try {
      await addTransaction({
        studentId: student.id,
        type: 'deposit',
        amount,
        date: new Date().toISOString(),
        description: 'Setoran manual dari Edit Data Siswa',
        createdBy: currentUser?.role || 'unknown',
        note: 'Setoran manual dari Edit Data Siswa',
      });

      await updateStudent(student.id, {
        balance: currentBalance + amount,
      });

      setDepositAmount('');
      Alert.alert('Sukses', 'Setoran berhasil ditambahkan');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Gagal menambahkan setoran');
    }
  };

  const handleWithdraw = async () => {
    const amount = parseAmount(withdrawAmount);
    if (!amount) {
      Alert.alert('Validasi', 'Nominal penarikan tidak boleh kosong');
      return;
    }

    if (amount > currentBalance) {
      Alert.alert('Validasi', 'Saldo tidak mencukupi untuk penarikan ini');
      return;
    }

    try {
      await addTransaction({
        studentId: student.id,
        type: 'withdrawal',
        amount,
        date: new Date().toISOString(),
        description: 'Penarikan manual dari Edit Data Siswa',
        createdBy: currentUser?.role || 'unknown',
        note: 'Penarikan manual dari Edit Data Siswa',
      });

      await updateStudent(student.id, {
        balance: currentBalance - amount,
      });

      setWithdrawAmount('');
      Alert.alert('Sukses', 'Penarikan berhasil dilakukan');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Gagal melakukan penarikan');
    }
  };

  return (
    <ScrollView style={container.screen} contentContainerStyle={common.p5}>
      <Text style={[common.text2xl, common.fontBold, common.mb4, common.textBlack]}>
        Edit Data Siswa
      </Text>

      {/* NIS */}
      <Text style={[common.textSm, common.fontSemibold, common.textGray700]}>
        NIS (Nomor Induk Siswa)
      </Text>
      <TextInput
        style={[input.base, common.mt1]}
        value={nis}
        onChangeText={setNis}
        keyboardType="numeric"
        placeholder="Masukkan NIS"
        editable={isAdmin}
      />

      {/* Nama */}
      <Text style={[common.textSm, common.fontSemibold, common.textGray700, common.mt4]}>
        Nama Lengkap
      </Text>
      <TextInput
        style={[input.base, common.mt1]}
        value={name}
        onChangeText={setName}
        placeholder="Masukkan nama lengkap"
        editable={isAdmin}
      />

      {/* Kelas */}
      <Text style={[common.textSm, common.fontSemibold, common.textGray700, common.mt4]}>
        Kelas
      </Text>
      <ClassPicker
        label="Kelas"
        selectedClass={studentClass}
        onSelectClass={(cls) => {
          setStudentClass(cls);
          setGrade(Number(cls));
        }}
        preselectedGrade={grade.toString()}
        disabled={!isAdmin}
      />

      {/* Saldo */}
      <Text style={[common.textSm, common.fontSemibold, common.textGray700, common.mt4]}>
        Saldo Tabungan
      </Text>
      <View
        style={[
          common.mt1,
          common.p3,
          common.bgGray100,
          common.roundedLg,
          common.flexRow,
          common.itemsCenter,
        ]}
      >
        <Text style={[common.textSm, common.textGray500]}>Rp </Text>
        <Text style={[common.textLg, common.fontBold, common.textBlack, common.mr2]}>
          {currentBalance.toLocaleString('id-ID')}
        </Text>
      </View>
      <Text style={[common.textXs, common.textGray400, common.mt1]}>
        ⚡ Saldo tidak bisa diedit langsung. Gunakan Setor / Tarik di bawah.
      </Text>

      {/* Setor */}
      <Text style={[common.textSm, common.fontSemibold, common.textGray700, common.mt5]}>
        Tambah Saldo (Setor)
      </Text>
      <TextInput
        style={[input.base, common.mt1]}
        value={depositAmount}
        onChangeText={setDepositAmount}
        keyboardType="numeric"
        placeholder="Masukkan nominal setoran"
      />
      <TouchableOpacity
        style={[button.primary, common.mt2]}
        onPress={handleDeposit}
      >
        <Text style={button.textWhite}>Setor</Text>
      </TouchableOpacity>

      {/* Tarik */}
      <Text style={[common.textSm, common.fontSemibold, common.textGray700, common.mt5]}>
        Tarik Saldo
      </Text>
      <TextInput
        style={[input.base, common.mt1]}
        value={withdrawAmount}
        onChangeText={setWithdrawAmount}
        keyboardType="numeric"
        placeholder="Masukkan nominal penarikan"
      />
      <TouchableOpacity
        style={[
          button.secondary,
          common.mt2,
          { borderColor: colors.danger, borderWidth: 1 },
        ]}
        onPress={handleWithdraw}
      >
        <Text style={[common.textRed600, common.fontSemibold, common.textCenter]}>
          Tarik
        </Text>
      </TouchableOpacity>

      {/* Batal / Simpan */}
      <View style={[common.mt5, common.flexRow, { justifyContent: 'space-between' }]}>
        <TouchableOpacity
          style={[button.secondary, { flex: 1, marginRight: 8 }]}
          onPress={() => navigation.goBack()}
          disabled={saving}
        >
          <Text style={[common.textBlack, common.fontSemibold, common.textCenter]}>
            Batal
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[button.primary, { flex: 1, marginLeft: 8 }]}
          onPress={isAdmin ? handleSave : handleSaveReadonly}
          disabled={saving}
        >
          <Text style={button.textWhite}>
            {isAdmin ? 'Simpan' : 'Selesai'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
