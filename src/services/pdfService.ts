import { Share } from 'react-native';
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

// =====================
// Helper: HTML untuk PDF
// =====================

const buildStudentDetailsHTML = (
  grade: number,
  students: Student[],
  transactions: Transaction[]
): string => {
  const gradeStudents = students.filter((s) => s.grade === grade);

  if (gradeStudents.length === 0) {
    return '<p>Tidak ada siswa untuk kelas ini.</p>';
  }

  let html = `
    <h3>Detail Siswa Kelas ${grade}</h3>
    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
      <thead>
        <tr style="background-color: #f0f0f0;">
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">No.</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Nama Siswa</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Saldo</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Setoran</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Penarikan</th>
        </tr>
      </thead>
      <tbody>
  `;

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

    html += `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: left;">${index + 1}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: left;">${student.name}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatCurrency(
          student.balance
        )}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatCurrency(
          totalSetoran
        )}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatCurrency(
          totalPenarikan
        )}</td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  `;

  return html;
};

const buildPDFHTML = (
  classReport: ClassReport,
  students: Student[],
  transactions: Transaction[],
  schoolName = 'SD Negeri 3 Linggasari'
): string => {
  const studentDetailsHTML = buildStudentDetailsHTML(
    classReport.grade,
    students,
    transactions
  );

  return `
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Laporan Tabungan Siswa</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
          h1 {
            text-align: center;
            color: #2c5282;
            margin-bottom: 5px;
          }
          h2 {
            color: #2d5016;
            border-bottom: 2px solid #2d5016;
            padding-bottom: 10px;
            margin-top: 20px;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin: 20px 0;
          }
          .summary-card {
            border: 1px solid #ddd;
            padding: 15px;
            border-radius: 5px;
            background-color: #f9f9f9;
          }
          .summary-card-label {
            font-size: 12px;
            color: #666;
            margin-bottom: 5px;
          }
          .summary-card-value {
            font-size: 16px;
            font-weight: bold;
            color: #2c5282;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #2d5016;
            color: white;
            font-weight: bold;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .footer {
            margin-top: 30px;
            font-size: 11px;
            color: #999;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <h1>Laporan Tabungan Siswa - ${schoolName}</h1>
        <h2>Kelas ${classReport.grade}</h2>

        <h3>Ringkasan Kelas</h3>
        <div class="summary-grid">
          <div class="summary-card">
            <div class="summary-card-label">Total Siswa</div>
            <div class="summary-card-value">${classReport.totalStudents} siswa</div>
          </div>
          <div class="summary-card">
            <div class="summary-card-label">Total Saldo</div>
            <div class="summary-card-value">${formatCurrency(
              classReport.totalBalance
            )}</div>
          </div>
          <div class="summary-card">
            <div class="summary-card-label">Total Setoran</div>
            <div class="summary-card-value">${formatCurrency(
              classReport.totalDeposits
            )}</div>
          </div>
          <div class="summary-card">
            <div class="summary-card-label">Total Penarikan</div>
            <div class="summary-card-value">${formatCurrency(
              classReport.totalWithdrawals
            )}</div>
          </div>
        </div>

        ${studentDetailsHTML}

        <div class="footer">
          <p>Dibuat: ${new Date().toLocaleString('id-ID')}</p>
        </div>
      </body>
    </html>
  `;
};


const ensureDownloadsDir = async (): Promise<string | null> => {
  try {
    const permissions =
      await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

    if (!permissions.granted) {
      return null;
    }

    return permissions.directoryUri;
  } catch (e) {
    console.error('Error ensureDownloadsDir:', e);
    return null;
  }
};


export const generateClassReportPDF = async (
  classReport: ClassReport,
  students: Student[],
  transactions: Transaction[],
  schoolName = 'SD Negeri 3 Linggasari'
): Promise<string | null> => {
  try {
    const html = buildPDFHTML(classReport, students, transactions, schoolName);

    // buat PDF sementara
    const { uri } = await printToFileAsync({
      html,
      base64: false,
    });

    const dirUri = await ensureDownloadsDir();
    if (!dirUri) return null;

    const fileName = `Laporan_Kelas_${classReport.grade}.pdf`;

    const pdfData = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
      dirUri,
      fileName,
      'application/pdf'
    );

    await FileSystem.writeAsStringAsync(fileUri, pdfData, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // tidak Alert di sini, biar di-handle di screen
    return fileUri;
  } catch (error) {
    console.error('Error generateClassReportPDF:', error);
    throw error;
  }
};


export const shareExistingPDF = async (
  fileUri: string,
  title: string,
  message?: string
): Promise<void> => {
  await Share.share({
    url: fileUri,
    title,
    message,
  });
};
