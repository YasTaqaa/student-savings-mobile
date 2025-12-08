import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StudentStackParamList } from '../types';
import useStore from '../store/useStore';
import { common, container, colors } from '../styles/utils';

type NavigationProp = NativeStackNavigationProp<StudentStackParamList, 'ClassSelection'>;

interface Props {
  navigation: NavigationProp;
}

export default function ClassSelectionScreen({ navigation }: Props) {
  const user = useStore((state) => state.user);
  const students = useStore((state) => state.students);
  
  const getStudentCount = (grade: number) => {
    return students.filter((s) => s.grade === grade).length;
  };
  
  const getTotalStudents = () => {
    return students.length;
  };
  
  const handleSelectClass = (grade: number) => {
    navigation.navigate('StudentList', { grade });
  };
  
  const classes = [
    { grade: 0, label: 'Semua Kelas', icon: '📚', color: colors.primary },
    { grade: 1, label: 'Kelas 1', icon: '1️⃣', color: '#FF6B6B' },
    { grade: 2, label: 'Kelas 2', icon: '2️⃣', color: '#4ECDC4' },
    { grade: 3, label: 'Kelas 3', icon: '3️⃣', color: '#FFD93D' },
    { grade: 4, label: 'Kelas 4', icon: '4️⃣', color: '#95E1D3' },
    { grade: 5, label: 'Kelas 5', icon: '5️⃣', color: '#F38181' },
    { grade: 6, label: 'Kelas 6', icon: '6️⃣', color: '#AA96DA' },
  ];
  
  return (
    <ScrollView style={container.screen}>
      <View style={common.p5}>
        <View style={[
          common.bgPrimary,
          common.rounded,
          common.p4,
          common.shadow,
          common.mb4,
          common.itemsCenter
        ]}>
          <Text style={[common.textSm, common.textWhite, { opacity: 0.9 }]}>
            Total Siswa Terdaftar
          </Text>
          <Text style={[common.fontBold, common.textWhite, { fontSize: 36, marginTop: 4 }]}>
            {getTotalStudents()}
          </Text>
          <Text style={[common.textXs, common.textWhite, { opacity: 0.8, marginTop: 4 }]}>
            Siswa dari semua tingkat
          </Text>
        </View>
        
        <Text style={[common.textLg, common.fontBold, common.textBlack, common.mb3]}>
          📖 Pilih Kelas
        </Text>
        
        <View style={{ gap: 12 }}>
          {classes.map((cls) => {
            const studentCount = cls.grade === 0 ? getTotalStudents() : getStudentCount(cls.grade);
            
            return (
              <TouchableOpacity
                key={cls.grade}
                style={[
                  common.bgWhite,
                  common.rounded,
                  common.p4,
                  common.shadow,
                  common.flexRow,
                  common.itemsCenter,
                  common.justifyBetween,
                  { 
                    borderLeftWidth: 4,
                    borderLeftColor: cls.color,
                  }
                ]}
                onPress={() => handleSelectClass(cls.grade)}
                activeOpacity={0.7}
              >
                <View style={[common.flexRow, common.itemsCenter, { gap: 12 }]}>
                  <View style={[
                    common.rounded,
                    common.justifyCenter,
                    common.itemsCenter,
                    {
                      width: 56,
                      height: 56,
                      backgroundColor: cls.color + '20',
                    }
                  ]}>
                    <Text style={{ fontSize: 28 }}>
                      {cls.icon}
                    </Text>
                  </View>
                  
                  <View>
                    <Text style={[common.textLg, common.fontBold, common.textBlack]}>
                      {cls.label}
                    </Text>
                    <Text style={[common.textSm, common.textGray500]}>
                      {studentCount} siswa
                    </Text>
                  </View>
                </View>
                
                <Text style={{ fontSize: 20, opacity: 0.5 }}>›</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        
        {/* Info Card */}
        <View style={[
          common.bgGray50,
          common.rounded,
          common.p4,
          { marginTop: 20, marginBottom: 40 }
        ]}>
          <Text style={[common.textSm, common.textGray500, common.textCenter]}>
            💡 Pilih "Semua Kelas" untuk melihat semua siswa{'\n'}
            atau pilih kelas tertentu untuk filter
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}