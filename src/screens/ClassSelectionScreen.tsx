import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StudentStackParamList, ClassGroup } from '../types';
import useStore from '../store/useStore';
import { common, colors, container, fab } from '../styles/utils';

type NavigationProp = NativeStackNavigationProp<StudentStackParamList, 'ClassSelection'>;

interface Props {
  navigation: NavigationProp;
}

export default function ClassSelectionScreen({ navigation }: Props) {
  const students = useStore((state) => state.students);

  const classGroups = useMemo((): ClassGroup[] => {
    const groups: ClassGroup[] = [];
    
    for (let grade = 1; grade <= 6; grade++) {
      const gradeStudents = students.filter((s) => s.grade === grade);
      const totalBalance = gradeStudents.reduce((sum, s) => sum + s.balance, 0);

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
    <View style={container.screen}>
      {/* Header Summary */}
      <View style={[common.bgPrimary, common.p5]}>
        <Text style={[common.text2xl, common.fontBold, common.textWhite, common.mb1]}>
          📚 Pilih Kelas
        </Text>
        <Text style={[common.textSm, common.textWhite, { opacity: 0.9 }]}>
          {totalStats.students} siswa • {formatCurrency(totalStats.balance)}
        </Text>
      </View>

      <ScrollView 
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {classGroups.length > 0 ? (
          classGroups.map((group) => (
            <TouchableOpacity
              key={group.grade}
              style={[common.bgWhite, common.roundedXl, common.p5, common.shadow, common.mb4]}
              onPress={() => navigation.navigate('StudentList', { grade: group.grade })}
              activeOpacity={0.7}
            >
              <View style={[common.flexRow, common.itemsCenter, common.mb4]}>
                <View style={[
                  { width: 56, height: 56 },
                  common.roundedFull,
                  common.bgPrimary,
                  common.justifyCenter,
                  common.itemsCenter,
                  common.mr2
                ]}>
                  <Text style={[common.text3xl, common.fontBold, common.textWhite]}>
                    {group.grade}
                  </Text>
                </View>
                
                <View style={common.flex1}>
                  <Text style={[common.textXl, common.fontBold, common.textBlack, common.mb1]}>
                    {group.title}
                  </Text>
                  <Text style={[common.textSm, common.textGray500]}>
                    {group.classes.join(', ') || 'Belum ada kelas'}
                  </Text>
                </View>

                <View style={[
                  { width: 32, height: 32 },
                  common.roundedFull,
                  common.bgGray50,
                  common.justifyCenter,
                  common.itemsCenter
                ]}>
                  <Text style={[common.text2xl, common.textPrimary, common.fontBold]}>›</Text>
                </View>
              </View>

              <View style={[common.flexRow, common.borderB, common.borderGray100, { paddingTop: 16 }]}>
                <View style={[common.flex1, common.itemsCenter]}>
                  <Text style={{ fontSize: 24, marginBottom: 4 }}>👨‍🎓</Text>
                  <Text style={[common.textXs, common.textGray500, common.mb1]}>Siswa</Text>
                  <Text style={[common.textSm, common.fontSemibold, common.textBlack]}>
                    {group.totalStudents}
                  </Text>
                </View>

                <View style={{ width: 1, backgroundColor: colors.gray[100], marginHorizontal: 16 }} />

                <View style={[common.flex1, common.itemsCenter]}>
                  <Text style={{ fontSize: 24, marginBottom: 4 }}>💰</Text>
                  <Text style={[common.textXs, common.textGray500, common.mb1]}>Total Saldo</Text>
                  <Text style={[common.textSm, common.fontSemibold, common.textBlack, common.textCenter]}>
                    {formatCurrency(group.totalBalance)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={[common.itemsCenter, { marginTop: 100, paddingHorizontal: 40 }]}>
            <Text style={{ fontSize: 80, marginBottom: 20 }}>📚</Text>
            <Text style={[common.textXl, common.fontSemibold, common.textBlack, common.mb2, common.textCenter]}>
              Belum ada siswa
            </Text>
            <Text style={[common.textSm, common.textGray500, common.textCenter, { lineHeight: 20 }]}>
              Tambahkan siswa baru dari tombol + di bawah
            </Text>
          </View>
        )}
      </ScrollView>
      
      <TouchableOpacity
        style={fab.base}
        onPress={() => navigation.navigate('StudentList', { grade: 0 })}
        activeOpacity={0.8}
      >
        <Text style={fab.text}>+</Text>
      </TouchableOpacity>
    </View>
  );
}
