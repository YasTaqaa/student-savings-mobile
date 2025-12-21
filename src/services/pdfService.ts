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
  class: string;
  balance: number;
}

export interface Transaction {
  id: string;
  studentId: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  date: string;
}

const formatCurrency = (amount: number) =>
  `Rp ${amount.toLocaleString('id-ID')}`;

const formatDateTime = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const buildStudentDetailsHTML = (
  className: string,
  students: Student[],
  transactions: Transaction[]
): string => {
  const classStudents = students.filter((s) => s.class === className);

  if (classStudents.length === 0) {
    return '<p>Tidak ada siswa untuk kelas ini.</p>';
  }

  let html = `
    <h3>Detail Siswa Kelas ${className}</h3>
    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
      <thead>
        <tr style="background-color: #f0f0f0;">
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">No.</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Nama Siswa</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Saldo</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Setoran</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Penarikan</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Transaksi Terakhir</th>
        </tr>
      </thead>
      <tbody>
  `;

  classStudents.forEach((student, index) => {
    const studentTransactions = transactions.filter(
      (t) => t.studentId === student.id
    );
    const totalSetoran = studentTransactions
      .filter((t) => t.type === 'deposit')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalPenarikan = studentTransactions
      .filter((t) => t.type === 'withdrawal')
      .reduce((sum, t) => sum + t.amount, 0);
      const lastTx = studentTransactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    const lastTxText = lastTx 
      ? `${formatDateTime(lastTx.date)} - ${lastTx.type === 'deposit' ? 'Setor' : 'Tarik'}` 
      : '-';

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
        <td style="border: 1px solid #ddd; padding: 8px; text-align: left;">${lastTxText}</td>
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
    classReport.className || '',
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
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <thead>
            <tr style="background-color: #2d5016; color: white; font-weight: bold;">
              <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Total Siswa</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Total Saldo</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Total Setoran</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Total Penarikan</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">
                ${classReport.totalStudents} siswa
              </td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">
                ${formatCurrency(classReport.totalBalance)}
              </td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">
                ${formatCurrency(classReport.totalDeposits)}
              </td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">
                ${formatCurrency(classReport.totalWithdrawals)}
              </td>
            </tr>
          </tbody>
        </table>

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

    return fileUri;
  } catch (error) {
    console.error('Error generateClassReportPDF:', error);
    throw error;
  }
};