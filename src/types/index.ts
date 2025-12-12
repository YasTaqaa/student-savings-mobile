export interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'teacher';
}

export interface Student {
  category: string;
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
  note?: string; // supaya addTransaction pakai note tidak error
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
  StudentHome: undefined;
  Reports: undefined;
  Profile: undefined;
};

export type StudentStackParamList = {
  ClassSelection: undefined;
  StudentList: { grade: number };
  StudentDetail: { studentId: string };
  Transaction: { studentId: string };
  EditStudent: { studentId: string };
  EditTransaction: { studentId: string; transactionId: string };
};

export const CLASS_OPTIONS = [
  { grade: 1, classes: ['1'] },
  { grade: 2, classes: ['2'] },
  { grade: 3, classes: ['3'] },
  { grade: 4, classes: ['4'] },
  { grade: 5, classes: ['5'] },
  { grade: 6, classes: ['6'] },
];

export const getAllClasses = (): string[] => {
  return CLASS_OPTIONS.flatMap(option => option.classes);
};

export const getGradeFromClass = (className: string): number => {
  return parseInt(className.charAt(0));
};
