import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { StudentStackParamList, getGradeFromClass } from '../types';
import useStore from '../store/useStore';
import ClassPicker from '../components/ClassPicker';

type NavigationProp = NativeStackNavigationProp<StudentStackParamList, 'StudentList'>;
type RouteProps = RouteProp<StudentStackParamList, 'StudentList'>;

interface Props {
  navigation: NavigationProp;
  route: RouteProps;
}

export default function StudentListScreen({ navigation, route }: Props) {
  const { grade } = route.params;
  const allStudents = useStore((state) => state.students);
  const addStudent = useStore((state) => state.addStudent);
  const deleteStudent = useStore((state) => state.deleteStudent);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [newStudent, setNewStudent] = useState({
    nis: '',
    name: '',
    class: '',
  });

  const students = useMemo(() => {
    if (grade === 0) return allStudents;
    return allStudents.filter((s) => s.grade === grade);
  }, [allStudents, grade]);

  const groupedStudents = useMemo(() => {
    const grouped = new Map<string, typeof students>();
    
    students.forEach((student) => {
      if (!grouped.has(student.class)) {
        grouped.set(student.class, []);
      }
      grouped.get(student.class)!.push(student);
    });

    grouped.forEach((studentList) => {
      studentList.sort((a, b) => a.name.localeCompare(b.name));
    });

    return Array.from(grouped.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [students]);
  
  const handleAddStudent = async () => {
    if (!newStudent.nis.trim() || !newStudent.name.trim() || !newStudent.class) {
      if (Platform.OS === 'web') {
        window.alert('Error: Semua field harus diisi');
      } else {
        Alert.alert('Error', 'Semua field harus diisi');
      }
      return;
    }
    
    const isDuplicate = allStudents.some((s) => s.nis === newStudent.nis.trim());
    if (isDuplicate) {
      if (Platform.OS === 'web') {
        window.alert(`Error: NIS ${newStudent.nis} sudah terdaftar`);
      } else {
        Alert.alert('Error', `NIS ${newStudent.nis} sudah terdaftar`);
      }
      return;
    }
    
    const studentGrade = getGradeFromClass(newStudent.class);
    
    try {
      await addStudent({
        ...newStudent,
        grade: studentGrade,
        nis: newStudent.nis.trim(),
        name: newStudent.name.trim(),
      });
      
      setNewStudent({ nis: '', name: '', class: '' });
      setModalVisible(false);
      
      if (Platform.OS === 'web') {
        window.alert('Berhasil! Siswa berhasil ditambahkan');
      } else {
        Alert.alert('Berhasil', 'Siswa berhasil ditambahkan');
      }
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert('Error: Gagal menambahkan siswa');
      } else {
        Alert.alert('Error', 'Gagal menambahkan siswa');
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteStudent(id);
      
      if (Platform.OS === 'web') {
        window.alert('Berhasil! Siswa berhasil dihapus');
      } else {
        Alert.alert('Berhasil', 'Siswa berhasil dihapus');
      }
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert('Error! Gagal menghapus siswa');
      } else {
        Alert.alert('Error', 'Gagal menghapus siswa');
      }
    }
  };

  const showDeleteConfirm = (student: any) => {
    const message = `Yakin ingin menghapus ${student.name}?\n\nNIS: ${student.nis}\nKelas: ${student.class}\nSaldo: Rp ${student.balance.toLocaleString('id-ID')}\n\nSemua data transaksi akan ikut terhapus.`;
    
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(message);
      if (confirmed) {
        handleDelete(student.id);
      }
    } else {
      Alert.alert(
        'Hapus Siswa',
        message,
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Hapus',
            style: 'destructive',
            onPress: () => handleDelete(student.id),
          },
        ],
        { cancelable: true }
      );
    }
  };
  
  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const getTotalBalance = () => {
    return students.reduce((sum, s) => sum + s.balance, 0);
  };

  const renderStudentCard = (student: any) => (
    <View key={student.id} style={styles.studentCard}>
      <TouchableOpacity
        style={styles.studentInfoTouchable}
        onPress={() => navigation.navigate('EditStudent', { studentId: student.id })}
        activeOpacity={0.7}
      >
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{student.name}</Text>
          <Text style={styles.studentMeta}>NIS: {student.nis}</Text>
        </View>

        <Text style={styles.studentBalance}>{formatCurrency(student.balance)}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => showDeleteConfirm(student)}
        activeOpacity={0.7}
      >
        <Text style={styles.deleteIcon}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {grade === 0 ? 'Semua Siswa' : `Kelas ${grade}`}
        </Text>
        <View style={styles.headerStats}>
          <Text style={styles.headerStat}>👨‍🎓 {students.length} siswa</Text>
          <Text style={styles.headerStat}>💰 {formatCurrency(getTotalBalance())}</Text>
        </View>
      </View>

      <View style={styles.hintContainer}>
        <Text style={styles.hintText}>
          💡 Tap nama untuk edit • Tap 🗑️ untuk hapus
        </Text>
      </View>

      {groupedStudents.length > 0 ? (
        <FlatList
          data={groupedStudents}
          keyExtractor={(item) => item[0]}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const [className, classStudents] = item;
            return (
              <View style={styles.classSection}>
                <View style={styles.classSectionHeader}>
                  <Text style={styles.classSectionTitle}>Kelas {className}</Text>
                  <Text style={styles.classSectionCount}>{classStudents.length} siswa</Text>
                </View>

                <View style={styles.studentList}>
                  {classStudents.map((student) => renderStudentCard(student))}
                </View>
              </View>
            );
          }}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📚</Text>
          <Text style={styles.emptyText}>
            {grade === 0 ? 'Belum ada data siswa' : `Belum ada siswa di Kelas ${grade}`}
          </Text>
          <Text style={styles.emptySubtext}>Tap tombol + untuk menambah siswa baru</Text>
        </View>
      )}
      
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
      
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tambah Siswa Baru</Text>
            
            <Text style={styles.inputLabel}>NIS</Text>
            <TextInput
              style={styles.input}
              placeholder="Nomor Induk Siswa"
              value={newStudent.nis}
              onChangeText={(text) => setNewStudent({ ...newStudent, nis: text })}
              keyboardType="numeric"
            />
            
            <Text style={styles.inputLabel}>Nama Lengkap</Text>
            <TextInput
              style={styles.input}
              placeholder="Nama lengkap siswa"
              value={newStudent.name}
              onChangeText={(text) => setNewStudent({ ...newStudent, name: text })}
            />
            
            <ClassPicker
              label="Kelas"
              selectedClass={newStudent.class}
              onSelectClass={(className) => setNewStudent({ ...newStudent, class: className })}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setNewStudent({ nis: '', name: '', class: '' });
                  setModalVisible(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Batal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleAddStudent}
              >
                <Text style={styles.submitButtonText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  headerStats: {
    flexDirection: 'row',
    gap: 16,
  },
  headerStat: {
    fontSize: 14,
    color: '#8E8E93',
  },
  hintContainer: {
    backgroundColor: '#E8F4FD',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#007AFF',
  },
  hintText: {
    fontSize: 12,
    color: '#007AFF',
    textAlign: 'center',
    fontWeight: '500',
  },
  listContainer: {
    paddingBottom: 100,
  },
  classSection: {
    marginTop: 16,
  },
  classSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#E5E5EA',
  },
  classSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  classSectionCount: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '600',
  },
  studentList: {
    paddingHorizontal: 16,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginTop: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  studentInfoTouchable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  studentMeta: {
    fontSize: 14,
    color: '#8E8E93',
  },
  studentBalance: {
    fontSize: 18,
    fontWeight: '700',
    color: '#34C759',
    marginRight: 8,
  },
  deleteButton: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#E5E5EA',
  },
  deleteIcon: {
    fontSize: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
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
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  fabText: {
    fontSize: 32,
    color: '#FFF',
    fontWeight: '300',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
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
  submitButton: {
    backgroundColor: '#007AFF',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
