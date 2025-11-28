import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StudentStackParamList, ClassGroup } from '../types';
import useStore from '../store/useStore';

type NavigationProp = NativeStackNavigationProp<StudentStackParamList, 'ClassSelection'>;

interface Props {
  navigation: NavigationProp;
}

export default function ClassSelectionScreen({ navigation }: Props) {
  const students = useStore((state) => state.students);

  // Group students by grade dengan statistik
  const classGroups = useMemo((): ClassGroup[] => {
    const groups: ClassGroup[] = [];

    for (let grade = 1; grade <= 6; grade++) {
      const gradeStudents = students.filter((s) => s.grade === grade);
      const totalBalance = gradeStudents.reduce((sum, s) => sum + s.balance, 0);

      // Hitung jumlah siswa per kelas (1A, 1B, 1C, dst)
      const classesInGrade: string[] = [];
      gradeStudents.forEach((s) => {
        if (!classesInGrade.includes(s.class)) {
          classesInGrade.push(s.class);
        }
      });

      groups.push({
        grade,
        title: `Kelas ${grade}`,
        classes: classesInGrade.sort(),
        totalStudents: gradeStudents.length,
        totalBalance,
      });
    }

    return groups.filter((g) => g.totalStudents > 0);
  }, [students]);

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const getTotalStats = () => {
    const total = classGroups.reduce(
      (acc, group) => ({
        students: acc.students + group.totalStudents,
        balance: acc.balance + group.totalBalance,
      }),
      { students: 0, balance: 0 }
    );
    return total;
  };

  const totalStats = getTotalStats();

  return (
    <View style={styles.container}>
      {/* Header Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>📚 Pilih Kelas</Text>
        <Text style={styles.summarySubtitle}>
          {totalStats.students} siswa • {formatCurrency(totalStats.balance)}
        </Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {classGroups.length > 0 ? (
          classGroups.map((group) => (
            <TouchableOpacity
              key={group.grade}
              style={styles.classCard}
              onPress={() => navigation.navigate('StudentList', { grade: group.grade })}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <View style={styles.gradeIconContainer}>
                  <Text style={styles.gradeIcon}>{group.grade}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{group.title}</Text>
                  <Text style={styles.cardSubtitle}>
                    {group.classes.join(', ') || 'Belum ada kelas'}
                  </Text>
                </View>
                <View style={styles.arrowContainer}>
                  <Text style={styles.arrow}>›</Text>
                </View>
              </View>

              <View style={styles.cardStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statIcon}>👨‍🎓</Text>
                  <Text style={styles.statLabel}>Siswa</Text>
                  <Text style={styles.statValue}>{group.totalStudents}</Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                  <Text style={styles.statIcon}>💰</Text>
                  <Text style={styles.statLabel}>Total Saldo</Text>
                  <Text style={styles.statValue}>
                    {formatCurrency(group.totalBalance)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={styles.emptyText}>Belum ada siswa</Text>
            <Text style={styles.emptySubtext}>
              Tambahkan siswa baru dari tombol + di bawah
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button - Tambah Siswa */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('StudentList', { grade: 0 })} // grade 0 = tampilkan semua + form tambah
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  summaryCard: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  summarySubtitle: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  classCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  gradeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  gradeIcon: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 24,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  cardStats: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    paddingTop: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 4,
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
  statDivider: {
    width: 1,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
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
    lineHeight: 20,
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
});
