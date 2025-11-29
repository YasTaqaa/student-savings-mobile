import React, { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import useStore from '../store/useStore';
import { common, colors, container } from '../styles/utils';

export default function ReportScreen() {
  const user = useStore((state) => state.user);
  const students = useStore((state) => state.students);
  const transactions = useStore((state) => state.transactions);
  
  // Calculate reports dengan useMemo
  const classReports = useMemo(() => {
    const gradeGroups = new Map<number, typeof students>();
    
    for (let grade = 1; grade <= 6; grade++) {
      const gradeStudents = students.filter((s) => s.grade === grade);
      if (gradeStudents.length > 0) {
        gradeGroups.set(grade, gradeStudents);
      }
    }
    
    const reports = Array.from(gradeGroups.entries()).map(([grade, gradeStudents]) => {
      const totalBalance = gradeStudents.reduce((sum, s) => sum + s.balance, 0);
      
      const studentIds = gradeStudents.map((s) => s.id);
      const gradeTransactions = transactions.filter((t) => studentIds.includes(t.studentId));
      
      const totalDeposits = gradeTransactions
        .filter((t) => t.type === 'deposit')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalWithdrawals = gradeTransactions
        .filter((t) => t.type === 'withdrawal')
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        className: `${grade}`,
        grade,
        totalStudents: gradeStudents.length,
        totalBalance,
        totalDeposits,
        totalWithdrawals,
      };
    });
    
    return reports;
  }, [students, transactions]);
  
  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };
  
  const grandTotal = classReports.reduce((sum, report) => sum + report.totalBalance, 0);
  const totalStudents = classReports.reduce((sum, report) => sum + report.totalStudents, 0);
  const totalDeposits = classReports.reduce((sum, report) => sum + report.totalDeposits, 0);
  const totalWithdrawals = classReports.reduce((sum, report) => sum + report.totalWithdrawals, 0);
  
  return (
    <ScrollView style={container.screen}>
      <View style={common.p5}>
        {/* Header */}
        <Text style={[common.text2xl, common.fontBold, common.textBlack, common.mb1]}>
          📊 Laporan Tabungan
        </Text>
        <Text style={[common.textSm, common.textGray500, common.mb4]}>
          Rekap detail per kelas tingkat
        </Text>
        
        {/* Summary Cards */}
        <View style={[common.flexRow, { gap: 12, marginBottom: 16 }]}>
          <View style={[common.flex1, common.bgPrimary, common.rounded, common.p4, common.shadow]}>
            <Text style={[common.textXs, common.textWhite, { opacity: 0.9 }, common.mb1]}>
              Total Saldo
            </Text>
            <Text style={[common.textLg, common.fontBold, common.textWhite]}>
              {formatCurrency(grandTotal)}
            </Text>
          </View>
          
          <View style={[common.flex1, common.bgWhite, common.rounded, common.p4, common.shadow]}>
            <Text style={[common.textXs, common.textGray500, common.mb1]}>
              Total Siswa
            </Text>
            <Text style={[common.textLg, common.fontBold, common.textPrimary]}>
              {totalStudents}
            </Text>
          </View>
        </View>
        
        <View style={[common.flexRow, { gap: 12, marginBottom: 20 }]}>
          <View style={[common.flex1, common.bgSuccess, common.rounded, common.p4, common.shadow]}>
            <Text style={[common.textXs, common.textWhite, { opacity: 0.9 }, common.mb1]}>
              Total Setoran
            </Text>
            <Text style={[common.textBase, common.fontBold, common.textWhite]}>
              {formatCurrency(totalDeposits)}
            </Text>
          </View>
          
          <View style={[common.flex1, common.bgDanger, common.rounded, common.p4, common.shadow]}>
            <Text style={[common.textXs, common.textWhite, { opacity: 0.9 }, common.mb1]}>
              Total Penarikan
            </Text>
            <Text style={[common.textBase, common.fontBold, common.textWhite]}>
              {formatCurrency(totalWithdrawals)}
            </Text>
          </View>
        </View>
        
        {/* Laporan Per Kelas */}
        <Text style={[common.textLg, common.fontBold, common.textBlack, common.mb3]}>
          📋 Detail Per Kelas
        </Text>
        
        {classReports.length > 0 ? (
          classReports.map((report) => (
            <View 
              key={report.className}
              style={[
                common.bgWhite,
                common.rounded,
                common.p4,
                common.shadow,
                common.mb3
              ]}
            >
              {/* Header Kelas */}
              <View style={[
                common.flexRow,
                common.justifyBetween,
                common.itemsCenter,
                common.mb3,
                common.borderB,
                common.borderGray100,
                { paddingBottom: 12 }
              ]}>
                <View>
                  <Text style={[common.textLg, common.fontBold, common.textBlack]}>
                    🎓 Kelas {report.grade}
                  </Text>
                  <Text style={[common.textXs, common.textGray500, { marginTop: 2 }]}>
                    {report.totalStudents} siswa terdaftar
                  </Text>
                </View>
                <View style={[
                  common.bgPrimary,
                  common.rounded,
                  { paddingHorizontal: 12, paddingVertical: 6 }
                ]}>
                  <Text style={[common.textXs, common.textWhite, common.fontBold]}>
                    Tingkat {report.grade}
                  </Text>
                </View>
              </View>
              
              {/* Stats Grid */}
              <View style={{ gap: 10 }}>
                <View style={[common.flexRow, common.justifyBetween, common.itemsCenter]}>
                  <View style={[common.flexRow, common.itemsCenter, { gap: 8 }]}>
                    <Text style={{ fontSize: 20 }}>💰</Text>
                    <Text style={[common.textSm, common.textGray500]}>Saldo Saat Ini</Text>
                  </View>
                  <Text style={[common.textBase, common.fontBold, common.textBlack]}>
                    {formatCurrency(report.totalBalance)}
                  </Text>
                </View>
                
                <View style={[common.flexRow, common.justifyBetween, common.itemsCenter]}>
                  <View style={[common.flexRow, common.itemsCenter, { gap: 8 }]}>
                    <Text style={{ fontSize: 20 }}>💵</Text>
                    <Text style={[common.textSm, common.textGray500]}>Total Setoran</Text>
                  </View>
                  <Text style={[common.textBase, common.fontBold, common.textSuccess]}>
                    + {formatCurrency(report.totalDeposits)}
                  </Text>
                </View>
                
                <View style={[common.flexRow, common.justifyBetween, common.itemsCenter]}>
                  <View style={[common.flexRow, common.itemsCenter, { gap: 8 }]}>
                    <Text style={{ fontSize: 20 }}>💸</Text>
                    <Text style={[common.textSm, common.textGray500]}>Total Penarikan</Text>
                  </View>
                  <Text style={[common.textBase, common.fontBold, common.textDanger]}>
                    - {formatCurrency(report.totalWithdrawals)}
                  </Text>
                </View>
                
                {/* Persentase */}
                {grandTotal > 0 && (
                  <View style={[
                    common.bgGray50,
                    common.rounded,
                    { padding: 8, marginTop: 4 }
                  ]}>
                    <Text style={[common.textXs, common.textGray500, common.textCenter]}>
                      {((report.totalBalance / grandTotal) * 100).toFixed(1)}% dari total saldo sekolah
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))
        ) : (
          <View style={[
            common.bgWhite,
            common.rounded,
            common.p5,
            common.itemsCenter
          ]}>
            <Text style={{ fontSize: 64, marginBottom: 16 }}>📚</Text>
            <Text style={[common.textLg, common.fontBold, common.textCenter, common.mb2]}>
              Belum Ada Data Laporan
            </Text>
            <Text style={[common.textSm, common.textGray500, common.textCenter]}>
              Tambahkan siswa dari tab Siswa{'\n'}untuk melihat laporan detail
            </Text>
          </View>
        )}
        
        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}
