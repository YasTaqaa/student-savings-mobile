import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import useStore from '../store/useStore';
import { common, colors, container, button } from '../styles/utils';
import {
  generateClassReportPDF,
  shareClassReportPDF,
  ClassReport,
} from '../services/pdfService';

export default function ReportScreen() {
  const [loadingGrade, setLoadingGrade] = useState<number | null>(null);

  const user = useStore((state) => state.user);
  const students = useStore((state) => state.students);
  const transactions = useStore((state) => state.transactions);

  const classReports: ClassReport[] = useMemo(() => {
    const gradeGroups = new Map<number, typeof students>();

    for (let grade = 1; grade <= 6; grade++) {
      const gradeStudents = students.filter((s) => s.grade === grade);
      if (gradeStudents.length > 0) {
        gradeGroups.set(grade, gradeStudents);
      }
    }

    const reports: ClassReport[] = Array.from(gradeGroups.entries()).map(
      ([grade, gradeStudents]) => {
        const totalBalance = gradeStudents.reduce(
          (sum, s) => sum + s.balance,
          0
        );

        const studentIds = gradeStudents.map((s) => s.id);
        const gradeTransactions = transactions.filter((t) =>
          studentIds.includes(t.studentId)
        );

        const totalDeposits = gradeTransactions
          .filter((t) => t.type === 'deposit')
          .reduce((sum, t) => sum + t.amount, 0);

        const totalWithdrawals = gradeTransactions
          .filter((t) => t.type === 'withdrawal')
          .reduce((sum, t) => sum + t.amount, 0);

        return {
          grade,
          className: `${grade}`,
          totalStudents: gradeStudents.length,
          totalBalance,
          totalDeposits,
          totalWithdrawals,
        };
      }
    );

    return reports;
  }, [students, transactions]);

  const formatCurrency = (amount: number) =>
    `Rp ${amount.toLocaleString('id-ID')}`;

  const grandTotal = classReports.reduce(
    (sum, report) => sum + report.totalBalance,
    0
  );
  const totalStudents = classReports.reduce(
    (sum, report) => sum + report.totalStudents,
    0
  );
  const totalDeposits = classReports.reduce(
    (sum, report) => sum + report.totalDeposits,
    0
  );
  const totalWithdrawals = classReports.reduce(
    (sum, report) => sum + report.totalWithdrawals,
    0
  );

  const handleExportPDF = async (grade: number) => {
    const report = classReports.find((r) => r.grade === grade);
    if (!report) return;

    setLoadingGrade(grade);
    try {
      await generateClassReportPDF(
        report,
        students,
        transactions,
        'Sistem Tabungan Siswa'
      );
    } catch (e) {
      Alert.alert('Error', 'Gagal membuat laporan');
      console.error(e);
    } finally {
      setLoadingGrade(null);
    }
  };

  const handleSharePDF = async (grade: number) => {
    const report = classReports.find((r) => r.grade === grade);
    if (!report) return;

    setLoadingGrade(grade);
    try {
      await shareClassReportPDF(
        report,
        students,
        transactions,
        'Sistem Tabungan Siswa'
      );
    } catch (e) {
      Alert.alert('Error', 'Gagal berbagi laporan');
      console.error(e);
    } finally {
      setLoadingGrade(null);
    }
  };

  return (
    <ScrollView style={container.screen}>
      {/* Header */}
      <View style={[common.p5, common.bgWhite]}>
        <Text style={[common.text3xl, common.fontBold, common.textBlack]}>
          📊 Laporan Tabungan
        </Text>
        <Text style={[common.textBase, common.textGray500, common.mt2]}>
          Rekap detail per kelas tingkat
        </Text>
        {user && (
          <Text style={[common.textSm, common.textGray500, common.mt2]}>
            Pengguna: {user.name} ({user.role === 'admin' ? 'Admin' : 'Guru'})
          </Text>
        )}
      </View>

      {/* Summary cards */}
      <View style={common.p5}>
        <View
          style={[
            common.flexRow,
            common.justifyBetween,
            common.mb4,
          ]}
        >
          <View
            style={[
              common.bgWhite,
              common.roundedLg,
              common.p4,
              common.shadow,
              { width: '48%' },
            ]}
          >
            <Text style={[common.textSm, common.textGray500]}>Total Saldo</Text>
            <Text
              style={[
                common.textLg,
                common.fontBold,
                common.textPrimary,
                common.mt2,
              ]}
            >
              {formatCurrency(grandTotal)}
            </Text>
          </View>

          <View
            style={[
              common.bgWhite,
              common.roundedLg,
              common.p4,
              common.shadow,
              { width: '48%' },
            ]}
          >
            <Text style={[common.textSm, common.textGray500]}>Total Siswa</Text>
            <Text
              style={[
                common.textLg,
                common.fontBold,
                common.textBlack,
                common.mt2,
              ]}
            >
              {totalStudents}
            </Text>
          </View>
        </View>

        <View
          style={[
            common.flexRow,
            common.justifyBetween,
            common.mb4,
          ]}
        >
          <View
            style={[
              common.bgWhite,
              common.roundedLg,
              common.p4,
              common.shadow,
              { width: '48%' },
            ]}
          >
            <Text style={[common.textSm, common.textGray500]}>
              Total Setoran
            </Text>
            <Text
              style={[
                common.textLg,
                common.fontBold,
                common.textSuccess,
                common.mt2,
              ]}
            >
              {formatCurrency(totalDeposits)}
            </Text>
          </View>

          <View
            style={[
              common.bgWhite,
              common.roundedLg,
              common.p4,
              common.shadow,
              { width: '48%' },
            ]}
          >
            <Text style={[common.textSm, common.textGray500]}>
              Total Penarikan
            </Text>
            <Text
              style={[
                common.textLg,
                common.fontBold,
                common.textDanger,
                common.mt2,
              ]}
            >
              {formatCurrency(totalWithdrawals)}
            </Text>
          </View>
        </View>
      </View>

      {/* Detail per kelas */}
      <View style={common.p5}>
        <Text style={[common.text2xl, common.fontBold, common.mb4]}>
          📋 Detail Per Kelas
        </Text>

        {classReports.length === 0 ? (
          <View style={[common.itemsCenter, common.p5]}>
            <Text style={[common.textBase, common.textGray500]}>
              Belum Ada Data Laporan
            </Text>
            <Text style={[common.textSm, common.textGray500, common.mt2]}>
              Tambahkan siswa dari tab Siswa untuk melihat laporan.
            </Text>
          </View>
        ) : (
          classReports.map((report) => (
            <View
              key={report.grade}
              style={[
                common.bgWhite,
                common.p4,
                common.mb4,
                common.roundedLg,
                common.shadow,
              ]}
            >
              <View
                style={[
                  common.flexRow,
                  common.justifyBetween,
                  common.itemsCenter,
                ]}
              >
                <View>
                  <Text
                    style={[
                      common.textLg,
                      common.fontBold,
                      common.textBlack,
                    ]}
                  >
                    🎓 Kelas {report.grade}
                  </Text>
                  <Text
                    style={[
                      common.textSm,
                      common.textGray500,
                      common.mt2,
                    ]}
                  >
                    {report.totalStudents} siswa terdaftar
                  </Text>
                </View>

                {grandTotal > 0 && (
                  <Text
                    style={[
                      common.textSm,
                      common.textPrimary,
                      common.fontSemibold,
                    ]}
                  >
                    {(
                      (report.totalBalance / grandTotal) *
                      100
                    ).toFixed(1)}
                    % dari total saldo
                  </Text>
                )}
              </View>

              {/* Ringkasan saldo kelas */}
              <View style={common.mt4}>
                <Text style={[common.textSm, common.textGray500]}>
                  Saldo Saat Ini
                </Text>
                <Text
                  style={[
                    common.textLg,
                    common.fontBold,
                    common.textPrimary,
                    common.mt2,
                  ]}
                >
                  {formatCurrency(report.totalBalance)}
                </Text>

                <Text
                  style={[
                    common.textSm,
                    common.textGray500,
                    common.mt3,
                  ]}
                >
                  Total Setoran
                </Text>
                <Text
                  style={[
                    common.textLg,
                    common.fontBold,
                    common.textSuccess,
                    common.mt2,
                  ]}
                >
                  + {formatCurrency(report.totalDeposits)}
                </Text>

                <Text
                  style={[
                    common.textSm,
                    common.textGray500,
                    common.mt3,
                  ]}
                >
                  Total Penarikan
                </Text>
                <Text
                  style={[
                    common.textLg,
                    common.fontBold,
                    common.textDanger,
                    common.mt2,
                  ]}
                >
                  - {formatCurrency(report.totalWithdrawals)}
                </Text>
              </View>

              {/* Detail per siswa di layar */}
              <View style={common.mt4}>
                <Text
                  style={[
                    common.textSm,
                    common.fontSemibold,
                    common.textBlack,
                  ]}
                >
                  Detail Siswa Kelas {report.grade}
                </Text>

                {students
                  .filter((s) => s.grade === report.grade)
                  .map((student) => {
                    const studentTransactions = transactions.filter(
                      (t) => t.studentId === student.id
                    );
                    const totalSetoran = studentTransactions
                      .filter((t) => t.type === 'deposit')
                      .reduce((sum, t) => sum + t.amount, 0);
                    const totalPenarikan = studentTransactions
                      .filter((t) => t.type === 'withdrawal')
                      .reduce((sum, t) => sum + t.amount, 0);

                    return (
                      <View
                        key={student.id}
                        style={[
                          common.mt2,
                          common.p2,
                          common.bgGray50,
                          common.roundedLg,
                        ]}
                      >
                        <Text
                          style={[
                            common.textSm,
                            common.fontSemibold,
                            common.textBlack,
                          ]}
                        >
                          {student.name}
                        </Text>
                        <Text style={[common.textSm, common.textGray500]}>
                          Saldo: {formatCurrency(student.balance)}
                        </Text>
                        <Text style={[common.textSm, common.textSuccess]}>
                          Setoran: {formatCurrency(totalSetoran)}
                        </Text>
                        <Text style={[common.textSm, common.textDanger]}>
                          Penarikan: {formatCurrency(totalPenarikan)}
                        </Text>
                      </View>
                    );
                  })}
              </View>

              {/* Tombol Export / Bagikan */}
              <View
                style={[
                  common.mt4,
                  common.flexRow,
                  common.justifyBetween,
                ]}
              >
                <TouchableOpacity
                  style={[button.primary, { flex: 1, marginRight: 8 }]}
                  onPress={() => handleExportPDF(report.grade)}
                  disabled={loadingGrade === report.grade}
                >
                  {loadingGrade === report.grade ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text style={button.textWhite}>📥 Export</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[button.secondary, { flex: 1, marginLeft: 8 }]}
                  onPress={() => handleSharePDF(report.grade)}
                  disabled={loadingGrade === report.grade}
                >
                  {loadingGrade === report.grade ? (
                    <ActivityIndicator color={colors.primary} />
                  ) : (
                    <Text
                      style={[
                        common.textBlack,
                        common.fontSemibold,
                      ]}
                    >
                      📤 Bagikan
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}
