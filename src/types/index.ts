export interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'teacher';
}

export interface Student {
  id: string;
  nis: string;
  name: string;
  class: string;
  grade: number;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  studentId: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  date: string;
  description: string;
  createdBy: string;
}

export interface ClassReport {
  className: string;
  totalStudents: number;
  totalBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
}

export interface StudentSection {
  title: string;
  grade: number;
  data: Student[];
}

// TAMBAH INTERFACE INI
export interface ClassGroup {
  grade: number;
  title: string;
  classes: string[];
  totalStudents: number;
  totalBalance: number;
}

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  StudentHome: undefined; // GANTI NAMA
  Reports: undefined;
  Profile: undefined;
};

export type StudentStackParamList = {
  ClassSelection: undefined; // BARU - Halaman pilih kelas
  StudentList: { grade: number }; // UPDATE - Terima parameter grade
  StudentDetail: { studentId: string };
  Transaction: { studentId: string };
  EditStudent: { studentId: string };
  EditTransaction: { studentId: string; transactionId: string };
};

export const CLASS_OPTIONS = [
  { grade: 1, classes: ['1A', '1B', '1C'] },
  { grade: 2, classes: ['2A', '2B', '2C'] },
  { grade: 3, classes: ['3A', '3B', '3C'] },
  { grade: 4, classes: ['4A', '4B', '4C'] },
  { grade: 5, classes: ['5A', '5B', '5C'] },
  { grade: 6, classes: ['6A', '6B', '6C'] },
];

export const getAllClasses = (): string[] => {
  return CLASS_OPTIONS.flatMap(option => option.classes);
};

export const getGradeFromClass = (className: string): number => {
  return parseInt(className.charAt(0));
};
