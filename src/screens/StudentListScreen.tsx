import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
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
import { common, colors, container, button, input } from '../styles/utils';

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
    <View key={student.id} style={[
      common.flexRow,
      common.itemsCenter,
      common.bgWhite,
      common.mt3,
      common.roundedLg,
      common.shadow,
      common.overflowHidden
    ]}>
      <TouchableOpacity
        style={[common.flex1, common.flexRow, common.itemsCenter, common.p4]}
        onPress={() => navigation.navigate('EditStudent', { studentId: student.id })}
        activeOpacity={0.7}
      >
        <View style={common.flex1}>
          <Text style={[common.textLg, common.fontSemibold, common.textBlack, common.mb1]}>
            {student.name}
          </Text>
          <Text style={[common.textSm, common.textGray500]}>
            NIS: {student.nis}
          </Text>
        </View>

        <Text style={[common.textLg, common.fontBold, common.textSuccess, common.mr2]}>
          {formatCurrency(student.balance)}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[common.w14, common.h14, common.justifyCenter, common.itemsCenter, common.borderL, common.borderGray100]}
        onPress={() => showDeleteConfirm(student)}
        activeOpacity={0.7}
      >
        <Text style={{ fontSize: 20 }}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );
  
  return (
    <View style={container.screen}>
      {/* Header */}
      <View style={[common.bgWhite, common.p4, common.borderB, common.borderGray100]}>
        <Text style={[common.text2xl, common.fontBold, common.textBlack, common.mb2]}>
          {grade === 0 ? 'Semua Siswa' : `Kelas ${grade}`}
        </Text>
        <View style={[common.flexRow, { gap: 16 }]}>
          <Text style={[common.textSm, common.textGray500]}>
            👨‍🎓 {students.length} siswa
          </Text>
          <Text style={[common.textSm, common.textGray500]}>
            💰 {formatCurrency(getTotalBalance())}
          </Text>
        </View>
      </View>

      {/* Hint */}
      <View style={[common.bgBlue50, common.py2, common.px4, common.borderB, common.borderPrimary]}>
        <Text style={[common.textXs, common.textPrimary, common.textCenter, common.fontMedium]}>
          💡 Tap nama untuk edit • Tap 🗑️ untuk hapus
        </Text>
      </View>

      {/* List */}
      {groupedStudents.length > 0 ? (
        <FlatList
          data={groupedStudents}
          keyExtractor={(item) => item[0]}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const [className, classStudents] = item;
            return (
              <View style={common.mt4}>
                <View style={[common.flexRow, common.justifyBetween, common.itemsCenter, common.px4, { paddingVertical: 10 }, common.bgGray100]}>
                  <Text style={[common.textBase, common.fontBold, common.textBlack]}>
                    Kelas {className}
                  </Text>
                  <Text style={[common.textSm, common.textGray500, common.fontSemibold]}>
                    {classStudents.length} siswa
                  </Text>
                </View>

                <View style={common.px4}>
                  {classStudents.map((student) => renderStudentCard(student))}
                </View>
              </View>
            );
          }}
        />
      ) : (
        <View style={[common.itemsCenter, { marginTop: 100, paddingHorizontal: 40 }]}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>📚</Text>
          <Text style={[common.textXl, common.fontSemibold, common.textBlack, common.mb2, common.textCenter]}>
            {grade === 0 ? 'Belum ada data siswa' : `Belum ada siswa di Kelas ${grade}`}
          </Text>
          <Text style={[common.textSm, common.textGray500, common.textCenter]}>
            Tap tombol + untuk menambah siswa baru
          </Text>
        </View>
      )}
      
      {/* FAB */}
      <TouchableOpacity
        style={[common.absolute, { right: 20, bottom: 20 }, common.w15, common.h15, common.roundedFull, common.bgPrimary, common.justifyCenter, common.itemsCenter, common.shadowLg]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={{ fontSize: 32, color: colors.white, fontWeight: '300' }}>+</Text>
      </TouchableOpacity>
      
      {/* Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={container.modal}>
          <View style={container.modalContent}>
            <Text style={[common.textXl, common.fontSemibold, { marginBottom: 20 }, common.textCenter]}>
              Tambah Siswa Baru
            </Text>
            
            <Text style={input.label}>NIS</Text>
            <TextInput
              style={[input.base, common.mb1]}
              placeholder="Nomor Induk Siswa"
              value={newStudent.nis}
              onChangeText={(text) => setNewStudent({ ...newStudent, nis: text })}
              keyboardType="numeric"
            />
            
            <Text style={input.label}>Nama Lengkap</Text>
            <TextInput
              style={[input.base, common.mb1]}
              placeholder="Nama lengkap siswa"
              value={newStudent.name}
              onChangeText={(text) => setNewStudent({ ...newStudent, name: text })}
            />
            
            <ClassPicker
              label="Kelas"
              selectedClass={newStudent.class}
              onSelectClass={(className) => setNewStudent({ ...newStudent, class: className })}
            />
            
            <View style={[common.flexRow, { gap: 12, marginTop: 24 }]}>
              <TouchableOpacity
                style={[button.secondary, common.flex1]}
                onPress={() => {
                  setNewStudent({ nis: '', name: '', class: '' });
                  setModalVisible(false);
                }}
              >
                <Text style={[button.text, common.textBlack]}>Batal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[button.primary, common.flex1]}
                onPress={handleAddStudent}
              >
                <Text style={button.textWhite}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
