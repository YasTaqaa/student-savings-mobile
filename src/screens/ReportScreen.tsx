import React, {useMemo,useState,useRef,useEffect,useCallback,} from 'react';
import {View,Text,Animated,TouchableOpacity,ActivityIndicator,Alert,ScrollView,} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import useStore from '../store/useStore';
import { common, colors, container } from '../styles/utils';
import {generateClassReportPDF,ClassReport,Student,Transaction,} from '../services/pdfService';

type ReportItemProps = {
  report: ClassReport;
  index: number;
  grandTotal: number;
  students: Student[];
  transactions: Transaction[];
  loadingClass: string | null;
  onExport: (className: string) => void;
  formatCurrency: (amount: number) => string;
};

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};


function ReportItem({
  report,
  index,
  grandTotal,
  students,
  transactions,
  loadingClass,
  onExport,
  formatCurrency,
}: ReportItemProps) {
  const itemOpacity = useRef(new Animated.Value(0)).current;
  const itemTranslate = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(itemOpacity, {
        toValue: 1,
        duration: 300,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(itemTranslate, {
        toValue: 0,
        duration: 300,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [itemOpacity, itemTranslate, index]);

  const percentage =
    grandTotal > 0
      ? ((report.totalBalance / grandTotal) * 100).toFixed(1)
      : '0.0';

  return (
    <Animated.View
      style={{
        opacity: itemOpacity,
        transform: [{ translateY: itemTranslate }],
      }}
    >
      <View
        style={[
          common.bgWhite,
          common.roundedLg,
          common.p4,
          common.mb3,
        ]}
      >
        <View
          style={[common.flexRow, common.justifyBetween, common.mb1]}
        >
          <View style={common.flexRow}>
            <Text style={{ marginRight: 8 }}>📊</Text>
            <View>
              <Text style={common.fontSemibold}>
                Kelas {report.className}
              </Text>
            </View>
          </View>
          <Text style={common.caption}>
            {report.totalStudents} siswa terdaftar
          </Text>
        </View>

        <View
          style={[
            common.flexRow,
            common.justifyBetween,
            common.mb2,
          ]}
        >
          <View>
            <Text style={common.caption}>Saldo Saat Ini</Text>
            <Text
              style={[common.fontSemibold, common.textPrimary]}
            >
              {formatCurrency(report.totalBalance)}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={common.caption}>Total Setoran</Text>
            <Text
              style={[
                common.fontSemibold,
                { color: colors.success },
              ]}
            >
              + {formatCurrency(report.totalDeposits)}
            </Text>
            <Text style={common.caption}>Total Penarikan</Text>
            <Text
              style={[
                common.fontSemibold,
                { color: colors.danger },
              ]}
            >
              - {formatCurrency(report.totalWithdrawals)}
            </Text>
          </View>
        </View>

        <Text style={[common.caption, common.mb1]}>
          Detail Siswa Kelas {report.className}
        </Text>
        {students
          .filter((s) => s.class === report.className)
          .map((student) => {
            const studentTransactions = transactions.filter(
              (t) => t.studentId === student.id,
            );

            const totalSetoran = studentTransactions
              .filter((t) => t.type === 'deposit')
              .reduce((sum, t) => sum + t.amount, 0);

            const totalPenarikan = studentTransactions
              .filter((t) => t.type === 'withdrawal')
              .reduce((sum, t) => sum + t.amount, 0);

            const lastTx = studentTransactions.sort(
              (a, b) =>
                new Date(b.date).getTime() - new Date(a.date).getTime(),
              )[0];

            const lastTxText = lastTx
                ? `${formatDateTime(lastTx.date)} (${lastTx.type === 'deposit' ? 'Setor' : 'Tarik'})`
            : '-';

            return (
              <View
                key={student.id}
                style={[common.mt1, common.flexRow]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={common.fontSemibold}>
                    {student.name}
                  </Text>
                  <Text style={common.caption}>
                    Saldo: {formatCurrency(student.balance)}
                  </Text>
                  <Text style={common.caption}>
                    Setoran: {formatCurrency(totalSetoran)} • Penarikan:{' '}
                    {formatCurrency(totalPenarikan)}
                  </Text>
                  <Text style={common.caption}>
                    Terakhir transaksi: {lastTxText}
                  </Text>
                </View>
              </View>
            );
          })}

        {report.className && (
          <TouchableOpacity
            onPress={() => onExport(report.className!)}
            disabled={loadingClass === report.className}
            style={[
              common.mt3,
              common.bgPrimary,
              common.roundedLg,
              common.itemsCenter,
              common.py3,
            ]}
            activeOpacity={0.7}
          >
            {loadingClass === report.className ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text
                style={[common.fontSemibold, { color: '#fff' }]}
              >
                📥 Export PDF
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

export default function ReportScreen() {
  const [loadingClass, setLoadingClass] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const students = useStore((state) => state.students) as unknown as Student[];
  const transactions = useStore(
    (state) => state.transactions,
  ) as Transaction[];

  const classReports: ClassReport[] = useMemo(() => {
    const classMap = new Map<string, Student[]>();

    students.forEach((s) => {
      if (!classMap.has(s.class)) {
        classMap.set(s.class, []);
      }
      classMap.get(s.class)!.push(s);
    });

    const reports: ClassReport[] = Array.from(classMap.entries()).map(
      ([className, classStudents]) => {
        const totalBalance = classStudents.reduce(
          (sum, s) => sum + s.balance,
          0,
        );

        const studentIds = classStudents.map((s) => s.id);
        const classTransactions = transactions.filter((t) =>
          studentIds.includes(t.studentId),
        );

        const totalDeposits = classTransactions
          .filter((t) => t.type === 'deposit')
          .reduce((sum, t) => sum + t.amount, 0);

        const totalWithdrawals = classTransactions
          .filter((t) => t.type === 'withdrawal')
          .reduce((sum, t) => sum + t.amount, 0);

        const gradeNumber = parseInt(className.charAt(0), 10);

        return {
          grade: isNaN(gradeNumber) ? 0 : gradeNumber,
          className,
          totalStudents: classStudents.length,
          totalBalance,
          totalDeposits,
          totalWithdrawals,
        };
      },
    );

    return reports.sort((a, b) => {
      if (a.grade !== b.grade) return a.grade - b.grade;
      const ca = a.className ?? '';
      const cb = b.className ?? '';
      return ca.localeCompare(cb);
    });
  }, [students, transactions]);

  const formatCurrency = (amount: number) =>
    `Rp ${amount.toLocaleString('id-ID')}`;

  const grandTotal = classReports.reduce(
    (sum, report) => sum + report.totalBalance,
    0,
  );
  const totalStudents = classReports.reduce(
    (sum, report) => sum + report.totalStudents,
    0,
  );
  const totalDeposits = classReports.reduce(
    (sum, report) => sum + report.totalDeposits,
    0,
  );
  const totalWithdrawals = classReports.reduce(
    (sum, report) => sum + report.totalWithdrawals,
    0,
  );

  // ====== Animations ======
  const summaryOpacity = useRef(new Animated.Value(0)).current;
  const summaryTranslateY = useRef(new Animated.Value(20)).current;
  const listOpacity = useRef(new Animated.Value(0)).current;
  const listTranslateY = useRef(new Animated.Value(20)).current;

  useFocusEffect(
    useCallback(() => {
      summaryOpacity.setValue(0);
      summaryTranslateY.setValue(20);
      listOpacity.setValue(0);
      listTranslateY.setValue(20);

      Animated.parallel([
        Animated.timing(summaryOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(summaryTranslateY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(listOpacity, {
          toValue: 1,
          duration: 500,
          delay: 150,
          useNativeDriver: true,
        }),
        Animated.timing(listTranslateY, {
          toValue: 0,
          duration: 500,
          delay: 150,
          useNativeDriver: true,
        }),
      ]).start();

      return () => {};
    }, [summaryOpacity, summaryTranslateY, listOpacity, listTranslateY]),
  );

  const handleExportPDF = async (className: string) => {
    const report = classReports.find((r) => r.className === className);
    if (!report) return;

    setLoadingClass(className);

    try {
      const fileUri = await generateClassReportPDF(
        report,
        students,
        transactions,
        'SD Negeri 3 Linggasari',
      );

      if (!fileUri) {
        Alert.alert('Error', 'Gagal menyimpan PDF');
      } else {
        Alert.alert(
          'Berhasil',
          `PDF laporan kelas ${className} sudah disimpan di perangkat.`,
        );
      }
    } catch (e) {
      console.error('Error handleExportPDF:', e);
      Alert.alert(
      'Gagal ekspor di emulator',
      'Fitur ekspor PDF tidak bisa di emulator. Coba di perangkat HP asli.',
    );
    } finally {
      setLoadingClass(null);
    }
  };

  // ====== Filter tampilan per kelas ======
  const visibleReports = useMemo(() => {
    if (!selectedClass) return classReports;
    return classReports.filter((r) => r.className === selectedClass);
  }, [classReports, selectedClass]);

  return (
    <ScrollView
      style={container.screen}
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
    >
      <Text style={[common.title, common.mb1]}>Laporan Tabungan</Text>
      <Text style={[common.caption, common.mb3]}>
        Rekap detail per kelas tingkat
      </Text>

      {/* Ringkasan Keseluruhan */}
      <Animated.View
        style={{
          opacity: summaryOpacity,
          transform: [{ translateY: summaryTranslateY }],
        }}
      >
        <View
          style={[
            common.bgWhite,
            common.roundedLg,
            common.p4,
            common.mb4,
          ]}
        >
          <Text style={[common.subtitle, common.mb2]}>
            Ringkasan Keseluruhan
          </Text>

          <View style={[common.flexRow, common.justifyBetween, common.mb2]}>
            <View>
              <Text style={common.caption}>Total Saldo</Text>
              <Text style={[common.title, common.textPrimary]}>
                {formatCurrency(grandTotal)}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={common.caption}>Total Siswa</Text>
              <Text style={[common.title]}>{totalStudents}</Text>
            </View>
          </View>

          <View style={[common.flexRow, common.justifyBetween]}>
            <View>
              <Text style={common.caption}>Total Setoran</Text>
              <Text style={[common.fontSemibold, { color: colors.success }]}>
                {formatCurrency(totalDeposits)}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={common.caption}>Total Penarikan</Text>
              <Text style={[common.fontSemibold, { color: colors.danger }]}>
                {formatCurrency(totalWithdrawals)}
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Detail Per Kelas + DROPDOWN */}
      <Animated.View
        style={{
          opacity: listOpacity,
          transform: [{ translateY: listTranslateY }],
        }}
      >
        <Text style={[common.subtitle, common.mb1]}>Detail Per Kelas</Text>

        {/* Dropdown pilih kelas */}
        <View style={[common.mb3]}>
          <TouchableOpacity
            onPress={() => setIsDropdownOpen((v) => !v)}
            style={[
              common.bgWhite,
              common.roundedLg,
              common.p3,
              common.flexRow,
              common.itemsCenter,
              common.justifyBetween,
            ]}
            activeOpacity={0.7}
          >
            <Text>
              {selectedClass
                ? `Kelas ${selectedClass}`
                : 'Pilih kelas (semua kelas)'}
            </Text>
            <Text>{isDropdownOpen ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {isDropdownOpen && (
            <View
              style={[
                common.bgWhite,
                common.roundedLg,
                common.mt1,
              ]}
            >
              <ScrollView style={{ maxHeight: 220 }} nestedScrollEnabled>
                {/* Opsi: semua kelas */}
                <TouchableOpacity
                  onPress={() => {
                    setSelectedClass(null);
                    setIsDropdownOpen(false);
                  }}
                  style={[
                    common.p3,
                    { borderBottomWidth: 1, borderBottomColor: '#eee' },
                  ]}
                >
                  <Text>Semua kelas</Text>
                </TouchableOpacity>

                {/* Opsi per kelas */}
                {classReports.map((r) => (
                  <TouchableOpacity
                    key={r.className}
                    onPress={() => {
                      setSelectedClass(r.className || '');
                      setIsDropdownOpen(false);
                    }}
                    style={[
                      common.p3,
                      { borderBottomWidth: 1, borderBottomColor: '#eee' },
                    ]}
                  >
                    <Text>Kelas {r.className}</Text>
                    <Text style={common.caption}>
                      {r.totalStudents} siswa • {formatCurrency(r.totalBalance)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {classReports.length === 0 ? (
          <View
            style={[
              common.bgWhite,
              common.roundedLg,
              common.p4,
              common.itemsCenter,
            ]}
          >
            <Text style={[common.fontSemibold, common.mb1]}>
              Belum Ada Data Laporan
            </Text>
            <Text style={common.caption}>
              Tambahkan siswa dari tab Siswa untuk melihat laporan.
            </Text>
          </View>
        ) : visibleReports.length === 0 ? (
          <View
            style={[
              common.bgWhite,
              common.roundedLg,
              common.p3,
              common.itemsCenter,
            ]}
          >
            <Text style={common.caption}>
              Tidak ada kelas yang cocok dengan pilihan.
            </Text>
          </View>
        ) : (
          <>
            {visibleReports.map((report, index) => (
              <ReportItem
                key={report.className}
                report={report}
                index={index}
                grandTotal={grandTotal}
                students={students}
                transactions={transactions}
                loadingClass={loadingClass}
                onExport={handleExportPDF}
                formatCurrency={formatCurrency}
              />
            ))}
          </>
        )}
      </Animated.View>
    </ScrollView>
  );
}
