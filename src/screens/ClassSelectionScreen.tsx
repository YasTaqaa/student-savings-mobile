import React, { useRef, useCallback } from 'react';
import {View,Text,TouchableOpacity,ScrollView,Animated,} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { StudentStackParamList } from '../types';
import useStore from '../store/useStore';
import { common, container, colors } from '../styles/utils';

type NavigationProp = NativeStackNavigationProp<
  StudentStackParamList,
  'ClassSelection'
>;

interface Props {
  navigation: NavigationProp;
}

export default function ClassSelectionScreen({ navigation }: Props) {
  const user = useStore((state) => state.user);
  const students = useStore((state) => state.students);

  const getStudentCount = (grade: number, className?: string) => {
    return students.filter((s: any) => {
      if (grade === 0) return true;
      if (className) {
        return s.grade === grade && s.class === className;
      }
      return s.grade === grade;
    }).length;
  };

  const getTotalStudents = () => students.length;

  const handleSelectClass = (grade: number, className?: string) => {
    navigation.navigate('StudentList', { grade, className });
  };

  const classes = [
    { grade: 0, label: 'Semua Kelas', icon: '📚', color: colors.primary },
    { grade: 1, label: 'Kelas 1', icon: '1️⃣', color: '#FF6B6B' },
    { grade: 2, label: 'Kelas 2', icon: '2️⃣', color: '#4ECDC4' },
    { grade: 3, label: 'Kelas 3', icon: '3️⃣', color: '#FFD93D' },
    {
      grade: 4,
      label: 'Kelas 4A',
      icon: '4️⃣',
      color: '#95E1D3',
      className: '4A',
    },
    {
      grade: 4,
      label: 'Kelas 4B',
      icon: '4️⃣',
      color: '#95E1D3',
      className: '4B',
    },
    { grade: 5, label: 'Kelas 5', icon: '5️⃣', color: '#F38181' },
    {
      grade: 6,
      label: 'Kelas 6A',
      icon: '6️⃣',
      color: '#AA96DA',
      className: '6A',
    },
    {
      grade: 6,
      label: 'Kelas 6B',
      icon: '6️⃣',
      color: '#AA96DA',
      className: '6B',
    },
  ] as const;

  // ====== Animasi header + list ======
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(20)).current;

  const listOpacity = useRef(new Animated.Value(0)).current;
  const listTranslateY = useRef(new Animated.Value(20)).current;

  useFocusEffect(
    useCallback(() => {
      headerOpacity.setValue(0);
      headerTranslateY.setValue(20);
      listOpacity.setValue(0);
      listTranslateY.setValue(20);

      Animated.parallel([
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(headerTranslateY, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(listOpacity, {
          toValue: 1,
          duration: 450,
          delay: 120,
          useNativeDriver: true,
        }),
        Animated.timing(listTranslateY, {
          toValue: 0,
          duration: 450,
          delay: 120,
          useNativeDriver: true,
        }),
      ]).start();

      return () => {};
    }, [headerOpacity, headerTranslateY, listOpacity, listTranslateY]),
  );

  return (
    <ScrollView
      style={container.screen}
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
    >
      {/* Header total siswa */}
      <Animated.View
        style={{
          opacity: headerOpacity,
          transform: [{ translateY: headerTranslateY }],
        }}
      >
        <View
          style={[
            common.bgWhite,
            common.roundedLg,
            common.p4,
            common.shadow,
            common.mb4,
          ]}
        >
          <Text style={[common.subtitle, common.mb1]}>
            Total Siswa Terdaftar
          </Text>
          <Text style={[common.title, common.textPrimary, common.mb1]}>
            {getTotalStudents()}
          </Text>
          <Text style={common.caption}>Siswa dari semua tingkat</Text>
        </View>
      </Animated.View>

      {/* List pilihan kelas */}
      <Animated.View
        style={{
          opacity: listOpacity,
          transform: [{ translateY: listTranslateY }],
        }}
      >
        <Text style={[common.subtitle, common.mb2]}>📖 Pilih Kelas</Text>

        {classes.map((cls, index) => {
          const studentCount =
            cls.grade === 0
              ? getTotalStudents()
              : getStudentCount(cls.grade, (cls as any).className);

          // animasi per tombol kelas
          const itemOpacity = useRef(new Animated.Value(0)).current;
          const itemTranslate = useRef(new Animated.Value(10)).current;

          React.useEffect(() => {
            Animated.parallel([
              Animated.timing(itemOpacity, {
                toValue: 1,
                duration: 250,
                delay: index * 70,
                useNativeDriver: true,
              }),
              Animated.timing(itemTranslate, {
                toValue: 0,
                duration: 250,
                delay: index * 70,
                useNativeDriver: true,
              }),
            ]).start();
          }, [itemOpacity, itemTranslate, index]);

          return (
            <Animated.View
              key={cls.label}
              style={{
                opacity: itemOpacity,
                transform: [{ translateY: itemTranslate }],
              }}
            >
              <TouchableOpacity
                onPress={() =>
                  handleSelectClass(cls.grade, (cls as any).className)
                }
                activeOpacity={0.7}
                style={[
                  common.mt2,
                  common.p3,
                  common.bgWhite,
                  common.flexRow,
                  common.justifyBetween,
                  common.itemsCenter,
                  common.roundedLg,
                  common.shadow,
                ]}
              >
                <View style={common.flexRow}>
                  <Text style={[common.mr2]}>{cls.icon}</Text>
                  <View>
                    <Text style={common.fontSemibold}>{cls.label}</Text>
                    <Text style={common.caption}>
                      {studentCount} siswa
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}

        <Text style={[common.caption, common.mt4, common.textCenter]}>
          Pilih "Semua Kelas" untuk melihat semua siswa{'\n'}
          atau pilih kelas tertentu untuk filter
        </Text>
      </Animated.View>
    </ScrollView>
  );
}
