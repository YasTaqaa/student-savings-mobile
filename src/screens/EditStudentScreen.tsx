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
import { StudentStackParamList, getGradeFromClass } from '../types';
import useStore from '../store/useStore';
import ClassPicker from '../components/ClassPicker';

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (student) {
      setNis(student.nis);
      setName(student.name);
      setSelectedClass(student.class);
    }
  }, [student]);

  if (!student) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Data siswa tidak ditemukan</Text>
      </View>
    );
  }

  const handleUpdate = async () => {
    if (!nis.trim() || !name.trim() || !selectedClass) {
      Alert.alert('Error', 'Semua field harus diisi');
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
      });

      Alert.alert('Berhasil', 'Data siswa berhasil diupdate', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Terjadi kesalahan saat menyimpan data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.label}>NIS (Nomor Induk Siswa)</Text>
          <TextInput
            style={styles.input}
            placeholder="Masukkan NIS"
            value={nis}
            onChangeText={setNis}
            keyboardType="numeric"
            editable={!loading}
          />

          <Text style={styles.label}>Nama Lengkap</Text>
          <TextInput
            style={styles.input}
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

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Saldo Tabungan</Text>
            <Text style={styles.infoValue}>
              Rp {student.balance.toLocaleString('id-ID')}
            </Text>
            <Text style={styles.infoNote}>
              * Saldo tidak dapat diubah di sini
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
              style={[styles.button, styles.saveButton, loading && styles.buttonDisabled]}
              onPress={handleUpdate}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? 'Menyimpan...' : 'Simpan'}
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
    marginTop: 16,
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
  infoBox: {
    backgroundColor: '#E8F4FD',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  infoLabel: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  infoNote: {
    fontSize: 12,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
    marginBottom: 40,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 10,
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
  saveButton: {
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
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
