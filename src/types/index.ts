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
  grade: string;    
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
  note?: string; 
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
  grade: string;     
  data: Student[];
}

export interface ClassGroup {
  grade: string;      
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
  StudentList: { grade: string; className?: string };
  StudentDetail: { studentId: string };
  Transaction: { studentId: string };
  EditStudent: { studentId: string };
  EditTransaction: { studentId: string; transactionId: string };
};

// =====================
// CLASS OPTIONS
// =====================
export const CLASS_OPTIONS: ClassGroup[] = [
  {
    grade: '1',
    title: 'Kelas 1',
    classes: ['1A'],
    totalStudents: 0,
    totalBalance: 0,
  },
  {
    grade: '2',
    title: 'Kelas 2',
    classes: ['2A'],
    totalStudents: 0,
    totalBalance: 0,
  },
  {
    grade: '3',
    title: 'Kelas 3',
    classes: ['3A'],
    totalStudents: 0,
    totalBalance: 0,
  },
  {
    grade: '4',
    title: 'Kelas 4',
    classes: ['4A', '4B'],
    totalStudents: 0,
    totalBalance: 0,
  },
  {
    grade: '5',
    title: 'Kelas 5',
    classes: ['5A'],
    totalStudents: 0,
    totalBalance: 0,
  },
  {
    grade: '6',
    title: 'Kelas 6',
    classes: ['6A', '6B'],
    totalStudents: 0,
    totalBalance: 0,
  },
];

// =====================
// HELPERS
// =====================
export const getAllClasses = (): string[] => {
  return CLASS_OPTIONS.flatMap(option => option.classes);
};

export const getGradeFromClass = (className: string): string => {
  return className.charAt(0);
};
