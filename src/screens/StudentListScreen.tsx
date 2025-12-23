import React, { useState, useMemo } from 'react';
import {View,Text,Animated,TouchableOpacity,Alert,Modal,TextInput,Platform,} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { StudentStackParamList, getGradeFromClass } from '../types';
import useStore from '../store/useStore';
import ClassPicker from '../components/ClassPicker';
import { common, container, button, input, colors } from '../styles/utils';

type NavigationProp = NativeStackNavigationProp<
  StudentStackParamList,
  'StudentList'
>;
type RouteProps = RouteProp<StudentStackParamList, 'StudentList'>;

interface Props {
  navigation: NavigationProp;
  route: RouteProps;
}

export default function StudentListScreen({ navigation, route }: Props) {
  const { grade, className: selectedClassName } = route.params;
  const allStudents = useStore((state) => state.students);
  const addStudent = useStore((state) => state.addStudent);
  const deleteStudent = useStore((state) => state.deleteStudent);
  const currentUser = useStore((state) => state.user);
  const isAdmin = currentUser?.role === 'admin';
  const [modalVisible, setModalVisible] = useState(false);
  const [newStudent, setNewStudent] = useState({
    nis: '',
    name: '',
    class:
      grade === '0'
        ? selectedClassName ?? ''
        : selectedClassName ?? `${grade}`,
  });

  const students = useMemo(() => {
    if (grade === '0' && !selectedClassName) return allStudents;

    return allStudents.filter((s) => {
      if (grade === '0') {
        return selectedClassName ? s.class === selectedClassName : true;
      }
      if (selectedClassName) {
        return s.grade === grade && s.class === selectedClassName;
      }
      return s.grade === grade;
    });
  }, [allStudents, grade, selectedClassName]);

  const groupedStudents = useMemo(() => {
    const grouped = new Map<string, any[]>();

    students.forEach((student) => {
      if (!grouped.has(student.class)) {
        grouped.set(student.class, []);
      }
      grouped.get(student.class)!.push(student);
    });

    grouped.forEach((studentList) => {
      studentList.sort((a, b) => a.name.localeCompare(b.name));
    });

    return Array.from(grouped.entries()).sort((a, b) =>
      a[0].localeCompare(b[0]),
    );
  }, [students]);

  const handleAddStudent = async () => {
    if (!isAdmin) {
      Alert.alert('Akses Ditolak', 'Hanya admin yang dapat menambah siswa');
      return;
    }

    if (!newStudent.nis.trim() || !newStudent.name.trim() || !newStudent.class) {
      if (Platform.OS === 'web') {
        window.alert('Error: Semua field harus diisi');
      } else {
        Alert.alert('Error', 'Semua field harus diisi');
      }
      return;
    }

    const isDuplicate = allStudents.some(
      (s) => s.nis === newStudent.nis.trim(),
    );
    if (isDuplicate) {
      const msg = `NIS ${newStudent.nis} sudah terdaftar`;
      if (Platform.OS === 'web') window.alert(`Error: ${msg}`);
      else Alert.alert('Error', msg);
      return;
    }

    const studentGrade = getGradeFromClass(newStudent.class);

    try {
      await addStudent({
        ...newStudent,
        grade: studentGrade,
        nis: newStudent.nis.trim(),
        name: newStudent.name.trim(),
        category: '',
      });

      setNewStudent({
        nis: '',
        name: '',
        class:
          grade === '0'
            ? selectedClassName ?? ''
            : selectedClassName ?? `${grade}`,
      });
      setModalVisible(false);

      if (Platform.OS === 'web') {
        window.alert('Berhasil! Siswa berhasil ditambahkan');
      } else {
        Alert.alert('Berhasil', 'Siswa berhasil ditambahkan');
      }
    } catch {
      if (Platform.OS === 'web') {
        window.alert('Error: Gagal menambahkan siswa');
      } else {
        Alert.alert('Error', 'Gagal menambahkan siswa');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) {
      Alert.alert('Akses Ditolak', 'Hanya admin yang dapat menghapus siswa');
      return;
    }

    try {
      await deleteStudent(id);
      if (Platform.OS === 'web') {
        window.alert('Berhasil! Siswa berhasil dihapus');
      } else {
        Alert.alert('Berhasil', 'Siswa berhasil dihapus');
      }
    } catch {
      if (Platform.OS === 'web') {
        window.alert('Error: Gagal menghapus siswa');
      } else {
        Alert.alert('Error', 'Gagal menghapus siswa');
      }
    }
  };

  const showDeleteConfirm = (student: any) => {
    if (!isAdmin) return;

    const message = `Yakin ingin menghapus ${student.name}?\nNIS: ${student.nis}\nKelas: ${student.class}\nSaldo: Rp ${student.balance.toLocaleString(
      'id-ID',
    )}\n\nSemua data transaksi akan ikut terhapus.`;

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(message);
      if (confirmed) handleDelete(student.id);
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
        { cancelable: true },
      );
    }
  };

  const formatCurrency = (amount: number) =>
    `Rp ${amount.toLocaleString('id-ID')}`;

  const getTotalBalance = () =>
    students.reduce((sum, s) => sum + s.balance, 0);

  const openAddModal = () => {
    if (!isAdmin) {
      Alert.alert('Akses Ditolak', 'Hanya admin yang dapat menambah siswa');
      return;
    }

    setNewStudent({
      nis: '',
      name: '',
      class:
        grade === '0'
          ? selectedClassName ?? ''
          : selectedClassName ?? `${grade}`,
    });
    setModalVisible(true);
  };

  return (
    <View style={container.screen}>
      <View style={{ padding: 16 }}>
        {/* Header */}
        <Text style={[common.title, common.mb1]}>
          {grade === '0'
            ? 'Semua Siswa'
            : selectedClassName
            ? `Siswa Kelas ${selectedClassName}`
            : `Siswa Kelas ${grade}`}
        </Text>
        <Text style={common.caption}>
          {students.length} siswa • Total saldo:{' '}
          {formatCurrency(getTotalBalance())}
        </Text>
      </View>

      {/* Student List */}
      {groupedStudents.length > 0 ? (
        <Animated.FlatList
          data={groupedStudents}
          keyExtractor={(item) => item[0]}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          renderItem={({ item, index }) => {
            const [className, classStudents] = item;

            const rowOpacity = new Animated.Value(0);
            const rowTranslate = new Animated.Value(10);

            Animated.parallel([
              Animated.timing(rowOpacity, {
                toValue: 1,
                duration: 300,
                delay: index * 80,
                useNativeDriver: true,
              }),
              Animated.timing(rowTranslate, {
                toValue: 0,
                duration: 300,
                delay: index * 80,
                useNativeDriver: true,
              }),
            ]).start();

            return (
              <Animated.View
                style={{
                  opacity: rowOpacity,
                  transform: [{ translateY: rowTranslate }],
                  marginBottom: 12,
                  borderRadius: 12,
                  overflow: 'hidden',
                  backgroundColor: colors.gray[50],
                }}
              >
                {/* Header kelas */}
                <View
                  style={[
                    common.flexRow,
                    common.justifyBetween,
                    common.p3,
                    common.bgWhite,
                  ]}
                >
                  <View style={common.flexRow}>
                    <Text style={[common.mr2]}>📚</Text>
                    <Text style={[common.fontSemibold]}>
                      Kelas {className}
                    </Text>
                  </View>
                  <Text style={common.caption}>
                    {classStudents.length} siswa
                  </Text>
                </View>

                {/* Daftar siswa: card per siswa */}
                <View style={[common.bgGray50, common.p3]}>
                  {classStudents.map((student: any) => (
                    <View
                      key={student.id}
                      style={[
                        common.bgWhite,
                        common.roundedLg,
                        common.p3,
                        common.mb2,
                        common.flexRow,
                        common.justifyBetween,
                        common.itemsCenter,
                      ]}
                    >
                      <TouchableOpacity
                        style={{ flex: 1 }}
                        activeOpacity={0.7}
                        onPress={() =>
                          navigation.navigate('EditStudent', {
                            studentId: student.id,
                          })
                        }
                      >
                        <Text style={[common.fontSemibold]}>
                          {student.name}
                        </Text>
                        <Text style={common.caption}>
                          NIS: {student.nis}
                        </Text>
                        <Text
                          style={[
                            common.textPrimary,
                            common.mt1,
                          ]}
                        >
                          {formatCurrency(student.balance)}
                        </Text>
                      </TouchableOpacity>

                      {isAdmin && (
                        <TouchableOpacity
                          onPress={() => showDeleteConfirm(student)}
                          activeOpacity={0.7}
                          style={{ paddingHorizontal: 8, paddingVertical: 4 }}
                        >
                          <Text>🗑️</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </View>
              </Animated.View>
            );
          }}
        />
      ) : (
        <View
          style={[
            common.flex1,
            common.itemsCenter,
            common.justifyCenter,
            common.p4,
          ]}
        >
          <Text style={common.text2xl}>👨🎓</Text>
          <Text style={[common.mt2, common.fontSemibold]}>
            {grade === '0'
              ? 'Belum ada data siswa'
              : selectedClassName
              ? `Belum ada siswa di Kelas ${selectedClassName}`
              : `Belum ada siswa di Kelas ${grade}`}
          </Text>
        </View>
      )}

      {isAdmin && (
  <TouchableOpacity
    onPress={openAddModal}
    activeOpacity={0.8}
    style={{
      position: 'absolute',
      right: 16,
      bottom: 24,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary ?? '#007bff',
      alignItems: 'center',
      justifyContent: 'center',
      // sedikit shadow
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 4,
    }}
  >
    <Text style={{ color: 'white', fontSize: 28, marginTop: -2 }}>+</Text>
  </TouchableOpacity>
)}


      {/* Modal Add Student (Admin only) */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={container.modal}>
          <View style={container.modalContent}>
            <Text style={[common.subtitle, common.mb3]}>
              ➕ Tambah Siswa Baru
            </Text>

            <Text style={input.label}>NIS (Nomor Induk Siswa)</Text>
            <TextInput
              style={input.base}
              value={newStudent.nis}
              onChangeText={(text) =>
                setNewStudent({ ...newStudent, nis: text })
              }
              keyboardType="numeric"
            />

            <Text style={input.label}>Nama Lengkap</Text>
            <TextInput
              style={input.base}
              value={newStudent.name}
              onChangeText={(text) =>
                setNewStudent({ ...newStudent, name: text })
              }
            />

            <Text style={input.label}>Kelas</Text>
            <ClassPicker
              selectedClass={newStudent.class}
              onSelectClass={(className) =>
                setNewStudent({ ...newStudent, class: className })
              }
              preselectedGrade={grade === '0' ? undefined : grade}
            />

            <View
              style={[
                common.flexRow,
                common.justifyBetween,
                common.mt4,
              ]}
            >
              <TouchableOpacity
                style={[button.secondary, { flex: 1, marginRight: 8 }]}
                onPress={() => {
                  setNewStudent({
                    nis: '',
                    name: '',
                    class:
                      grade === '0'
                        ? selectedClassName ?? ''
                        : selectedClassName ?? `${grade}`,
                  });
                  setModalVisible(false);
                }}
              >
                <Text style={button.text}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[button.primary, { flex: 1, marginLeft: 8 }]}
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
