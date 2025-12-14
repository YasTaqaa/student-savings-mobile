import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import useStore from '../store/useStore';
import { common, colors, container } from '../styles/utils';
import {
  generateClassReportPDF,
  ClassReport,
  Student,
  Transaction,
} from '../services/pdfService';
import * as Sharing from 'expo-sharing';


export default function ReportScreen() {
  const [loadingGrade, setLoadingGrade] = useState<number | null>(null);
  const [lastPdfUri, setLastPdfUri] = useState<string | null>(null);

  const user = useStore((state) => state.user);
  const students = useStore((state) => state.students) as Student[];
  const transactions = useStore((state) => state.transactions) as Transaction[];

  // ====== Hitung laporan per kelas ======
  const classReports: ClassReport[] = useMemo(() => {
    const gradeGroups = new Map<number, Student[]>();

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

  // ====== Export + popup Selesai/Bagikan ======
  const handleExportPDF = async (grade: number) => {
    const report = classReports.find((r) => r.grade === grade);
    if (!report) return;

    setLoadingGrade(grade);
    try {
      const fileUri = await generateClassReportPDF(
        report,
        students,
        transactions,
        'SD Negeri 3 Linggasari'
      );

      if (!fileUri) {
        Alert.alert('Error', 'Gagal menyimpan PDF');
      } else {
        setLastPdfUri(fileUri);

        Alert.alert(
  'Berhasil',
  'PDF laporan kelas sudah disimpan.',
  [
    { text: 'Selesai', style: 'cancel' },
    {
      text: 'Bagikan',
      onPress: async () => {
        try {
          const canShare = await Sharing.isAvailableAsync();
          if (!canShare) {
            Alert.alert(
              'Info',
              'Fitur berbagi file tidak tersedia di perangkat ini.'
            );
            return;
          }

          await Sharing.shareAsync(fileUri, {
            dialogTitle: `Laporan Kelas ${grade}`,
            mimeType: 'application/pdf',
          });
        } catch (e) {
          console.error('Error share:', e);
          Alert.alert('Error', 'Gagal berbagi laporan');
        }
      },
    },
  ],
  { cancelable: true }
);

      }
    } catch (e) {
      console.error('Error handleExportPDF:', e);
      Alert.alert('Error', 'Gagal membuat laporan');
    } finally {
      setLoadingGrade(null);
    }
  };

  return (
    <View style={[container.screen, { backgroundColor: colors.gray[50] }]}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ marginBottom: 16 }}>
          <Text style={[common.title, { marginBottom: 4 }]}>
            Laporan Tabungan
          </Text>
          <Text style={[common.subtitle, { marginBottom: 4 }]}>
            Rekap detail per kelas tingkat
          </Text>
          {user && (
            <Text style={common.caption}>
              Pengguna: {user.name}{' '}
              {user.role === 'admin' ? '(Admin)' : '(Guru)'}
            </Text>
          )}
        </View>

        {/* Ringkasan keseluruhan */}
        <View
          style={{
            backgroundColor: '#F5F5FB',
            borderRadius: 12,
            padding: 12,
            marginBottom: 12,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              marginBottom: 8,
              color: colors.black,
            }}
          >
            Ringkasan Keseluruhan
          </Text>

          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
            }}
          >
            <View
              style={{
                width: '48%',
                backgroundColor: colors.white,
                borderRadius: 10,
                padding: 10,
                marginBottom: 8,
              }}
            >
              <Text style={{ fontSize: 12, color: colors.gray[500] }}>
                Total Saldo
              </Text>
              <Text
                style={{
                  marginTop: 4,
                  fontSize: 16,
                  fontWeight: '700',
                  color: colors.primary,
                }}
              >
                {formatCurrency(grandTotal)}
              </Text>
            </View>

            <View
              style={{
                width: '48%',
                backgroundColor: colors.white,
                borderRadius: 10,
                padding: 10,
                marginBottom: 8,
              }}
            >
              <Text style={{ fontSize: 12, color: colors.gray[500] }}>
                Total Siswa
              </Text>
              <Text
                style={{
                  marginTop: 4,
                  fontSize: 16,
                  fontWeight: '700',
                  color: colors.black,
                }}
              >
                {totalStudents}
              </Text>
            </View>

            <View
              style={{
                width: '48%',
                backgroundColor: colors.white,
                borderRadius: 10,
                padding: 10,
                marginBottom: 8,
              }}
            >
              <Text style={{ fontSize: 12, color: colors.gray[500] }}>
                Total Setoran
              </Text>
              <Text
                style={{
                  marginTop: 4,
                  fontSize: 16,
                  fontWeight: '700',
                  color: colors.success,
                }}
              >
                {formatCurrency(totalDeposits)}
              </Text>
            </View>

            <View
              style={{
                width: '48%',
                backgroundColor: colors.white,
                borderRadius: 10,
                padding: 10,
                marginBottom: 8,
              }}
            >
              <Text style={{ fontSize: 12, color: colors.gray[500] }}>
                Total Penarikan
              </Text>
              <Text
                style={{
                  marginTop: 4,
                  fontSize: 16,
                  fontWeight: '700',
                  color: colors.danger,
                }}
              >
                {formatCurrency(totalWithdrawals)}
              </Text>
            </View>
          </View>
        </View>

        {/* Detail per kelas */}
        <View style={{ marginTop: 8 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              marginBottom: 8,
              color: colors.black,
            }}
          >
            Detail Per Kelas
          </Text>

          {classReports.length === 0 ? (
            <View
              style={{
                backgroundColor: colors.white,
                borderRadius: 12,
                padding: 16,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600' }}>
                Belum Ada Data Laporan
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: colors.gray[500],
                  marginTop: 4,
                  textAlign: 'center',
                }}
              >
                Tambahkan siswa dari tab Siswa untuk melihat laporan.
              </Text>
            </View>
          ) : (
            classReports.map((report) => {
              const percentage =
                grandTotal > 0
                  ? ((report.totalBalance / grandTotal) * 100).toFixed(1)
                  : '0.0';

              return (
                <View
                  key={report.grade}
                  style={{
                    backgroundColor: colors.white,
                    borderRadius: 16,
                    padding: 14,
                    marginBottom: 12,
                  }}
                >
                  {/* Header kelas */}
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 8,
                    }}
                  >
                    <View>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: '700',
                          color: colors.black,
                        }}
                      >
                        Kelas {report.grade}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: colors.gray[500],
                          marginTop: 2,
                        }}
                      >
                        {report.totalStudents} siswa terdaftar
                      </Text>
                    </View>
                    {grandTotal > 0 && (
                      <Text
                        style={{
                          fontSize: 12,
                          color: colors.gray[500],
                          fontWeight: '600',
                        }}
                      >
                        {percentage}% dari total saldo
                      </Text>
                    )}
                  </View>

                  {/* Ringkasan saldo kelas */}
                  <View style={{ marginTop: 4, marginBottom: 8 }}>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '600',
                        marginBottom: 4,
                        color: colors.gray[500],
                      }}
                    >
                      Saldo Saat Ini
                    </Text>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: '700',
                        color: colors.primary,
                        marginBottom: 6,
                      }}
                    >
                      {formatCurrency(report.totalBalance)}
                    </Text>

                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}
                    >
                      <View>
                        <Text
                          style={{ fontSize: 12, color: colors.gray[500] }}
                        >
                          Total Setoran
                        </Text>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: '600',
                            color: colors.success,
                            marginTop: 2,
                          }}
                        >
                          + {formatCurrency(report.totalDeposits)}
                        </Text>
                      </View>

                      <View style={{ alignItems: 'flex-end' }}>
                        <Text
                          style={{ fontSize: 12, color: colors.gray[500] }}
                        >
                          Total Penarikan
                        </Text>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: '600',
                            color: colors.danger,
                            marginTop: 2,
                          }}
                        >
                          - {formatCurrency(report.totalWithdrawals)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Daftar siswa singkat */}
                  <View style={{ marginTop: 6 }}>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '600',
                        marginBottom: 4,
                        color: colors.gray[500],
                      }}
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
                            style={{
                              paddingVertical: 6,
                              borderBottomWidth: 0.5,
                              borderBottomColor: colors.gray[100],
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 13,
                                fontWeight: '600',
                                color: colors.black,
                              }}
                            >
                              {student.name}
                            </Text>
                            <Text
                              style={{
                                fontSize: 11,
                                color: colors.gray[500],
                              }}
                            >
                              Saldo: {formatCurrency(student.balance)}
                            </Text>
                            <Text
                              style={{
                                fontSize: 11,
                                color: colors.success,
                              }}
                            >
                              Setoran: {formatCurrency(totalSetoran)}
                            </Text>
                            <Text
                              style={{
                                fontSize: 11,
                                color: colors.danger,
                              }}
                            >
                              Penarikan: {formatCurrency(totalPenarikan)}
                            </Text>
                          </View>
                        );
                      })}
                  </View>

                  {/* Satu tombol Export PDF */}
                  <TouchableOpacity
                    style={{
                      marginTop: 10,
                      backgroundColor: colors.primary,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingVertical: 8,
                      borderRadius: 8,
                    }}
                    onPress={() => handleExportPDF(report.grade)}
                    disabled={loadingGrade === report.grade}
                  >
                    {loadingGrade === report.grade ? (
                      <ActivityIndicator color={colors.white} size="small" />
                    ) : (
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: '600',
                          color: colors.white,
                        }}
                      >
                        📥 Export PDF
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}
