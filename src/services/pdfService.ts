import { Alert, Share } from 'react-native';

export interface ClassReport {
  grade: number;
  totalStudents: number;
  totalBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  className?: string;
}

// tipe minimal student & transaction
interface Student {
  id: string;
  name: string;
  grade: number;
  balance: number;
}

interface Transaction {
  id: string;
  studentId: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
}

const formatCurrency = (amount: number) =>
  `Rp ${amount.toLocaleString('id-ID')}`;

const buildStudentDetailsText = (
  grade: number,
  students: Student[],
  transactions: Transaction[]
) => {
  const gradeStudents = students.filter((s) => s.grade === grade);
  if (gradeStudents.length === 0) {
    return '\nTidak ada siswa untuk kelas ini.\n';
  }

  let text = '\nRincian per siswa:\n';

  gradeStudents.forEach((student, index) => {
    const studentTransactions = transactions.filter(
      (t) => t.studentId === student.id
    );
    const totalSetoran = studentTransactions
      .filter((t) => t.type === 'deposit')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalPenarikan = studentTransactions
      .filter((t) => t.type === 'withdrawal')
      .reduce((sum, t) => sum + t.amount, 0);

    text += `
${index + 1}. ${student.name}
   Saldo     : ${formatCurrency(student.balance)}
   Setoran   : ${formatCurrency(totalSetoran)}
   Penarikan : ${formatCurrency(totalPenarikan)}
`;
  });

  return text;
};

export const generateClassReportPDF = async (
  classReport: ClassReport,
  students: Student[],
  transactions: Transaction[],
  schoolName = 'Sistem Tabungan Siswa'
): Promise<string> => {
  const baseText = `
LAPORAN TABUNGAN SISWA
${schoolName}
Kelas ${classReport.grade}

RINGKASAN KELAS
Total Siswa    : ${classReport.totalStudents} siswa
Saldo Saat Ini : ${formatCurrency(classReport.totalBalance)}
Total Setoran  : ${formatCurrency(classReport.totalDeposits)}
Total Penarikan: ${formatCurrency(classReport.totalWithdrawals)}
`.trim();

  const studentText = buildStudentDetailsText(
    classReport.grade,
    students,
    transactions
  );

  const fullText = `${baseText}\n${studentText}\nDibuat: ${new Date().toLocaleString(
    'id-ID'
  )}`;

  Alert.alert(
    `Laporan Kelas ${classReport.grade}`,
    fullText,
    [
      { text: 'Tutup', style: 'default' },
      {
        text: 'Bagikan',
        onPress: () =>
          shareClassReportPDF(classReport, students, transactions, schoolName),
      },
    ]
  );

  return `laporan_kelas_${classReport.grade}`;
};

export const shareClassReportPDF = async (
  classReport: ClassReport,
  students: Student[],
  transactions: Transaction[],
  schoolName = 'Sistem Tabungan Siswa'
) => {
  const baseText = `
Laporan Tabungan Siswa - ${schoolName}
Kelas ${classReport.grade}

RINGKASAN KELAS
Total Siswa    : ${classReport.totalStudents} siswa
Saldo Saat Ini : ${formatCurrency(classReport.totalBalance)}
Total Setoran  : ${formatCurrency(classReport.totalDeposits)}
Total Penarikan: ${formatCurrency(classReport.totalWithdrawals)}
`.trim();

  const studentText = buildStudentDetailsText(
    classReport.grade,
    students,
    transactions
  );

  const fullText = `${baseText}\n${studentText}\nDibuat: ${new Date().toLocaleString(
    'id-ID'
  )}`;

  try {
    await Share.share({
      message: fullText,
      title: `Laporan Kelas ${classReport.grade}`,
    });
  } catch (error) {
    Alert.alert('Error', 'Gagal berbagi laporan');
    console.error(error);
  }
};
