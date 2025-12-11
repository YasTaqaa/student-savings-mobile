import { Alert, Share } from 'react-native';
import { printToFileAsync } from 'expo-print';
import * as FileSystem from 'expo-file-system/legacy';

export interface ClassReport {
  grade: number;
  totalStudents: number;
  totalBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  className?: string;
}

// tipe minimal student & transaction
export interface Student {
  id: string;
  name: string;
  grade: number;
  balance: number;
}

export interface Transaction {
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

const buildPDFHTML = (
  classReport: ClassReport,
  students: Student[],
  transactions: Transaction[],
  schoolName = 'Sistem Tabungan Siswa'
) => {
  const studentDetails = buildStudentDetailsText(
    classReport.grade,
    students,
    transactions
  ).replace(/\n/g, '<br />');

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
      h1 { text-align: center; color: #333; margin-bottom: 10px; }
      .subtitle { text-align: center; color: #666; margin-bottom: 20px; font-size: 14px; }
      .summary { margin: 20px 0; padding: 15px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 5px; }
      .summary-row { display: flex; justify-content: space-between; margin: 10px 0; }
      .summary-label { font-weight: bold; color: #333; }
      .summary-value { text-align: right; }
      .footer { margin-top: 30px; text-align: right; font-size: 12px; color: #666; }
      pre { white-space: pre-wrap; font-family: inherit; }
    </style>
  </head>
  <body>
    <h1>📊 LAPORAN TABUNGAN SISWA</h1>
    <div class="subtitle">${schoolName}</div>
    <div class="subtitle">Kelas ${classReport.grade}</div>

    <div class="summary">
      <div class="summary-row">
        <span class="summary-label">Total Siswa:</span>
        <span class="summary-value">${classReport.totalStudents} siswa</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">Saldo Saat Ini:</span>
        <span class="summary-value">${formatCurrency(classReport.totalBalance)}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">Total Setoran:</span>
        <span class="summary-value">${formatCurrency(classReport.totalDeposits)}</span>
      </div>
      <div class="summary-row">
        <span class="summary-label">Total Penarikan:</span>
        <span class="summary-value">${formatCurrency(classReport.totalWithdrawals)}</span>
      </div>
    </div>

    <h2 style="margin-top: 30px; color: #333;">Rincian Per Siswa</h2>
    <pre>${studentDetails}</pre>

    <div class="footer">
      <p>Dibuat: ${new Date().toLocaleString('id-ID')}</p>
    </div>
  </body>
</html>
`;
};

// EXPORT: pakai expo-print → PDF file per kelas
export const generateClassReportPDF = async (
  classReport: ClassReport,
  students: Student[],
  transactions: Transaction[],
  schoolName = 'Sistem Tabungan Siswa'
): Promise<string> => {
  try {
    const htmlContent = buildPDFHTML(
      classReport,
      students,
      transactions,
      schoolName
    );

    const { uri } = await printToFileAsync({
      html: htmlContent,
      base64: false,
    });

    const fileName = `laporan_kelas_${classReport.grade}_${new Date().getTime()}.pdf`;
    const newUri = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.copyAsync({
      from: uri,
      to: newUri,
    });

    Alert.alert(
      'Sukses',
      `Laporan Kelas ${classReport.grade} telah dibuat.\n\nFile tersimpan di perangkat Anda: ${fileName}`,
      [{ text: 'Tutup', style: 'default' }],
    );

    return newUri;
  } catch (error) {
    Alert.alert('Error', 'Gagal membuat laporan PDF');
    console.error('Error generating PDF:', error);
    throw error;
  }
};

// BAGIKAN: pakai logika lama (Share.share teks)
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
