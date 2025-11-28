import { create } from 'zustand';
import { User, Student, Transaction } from '../types';
import * as StorageService from '../services/storageService';

interface StoreState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  students: Student[];
  transactions: Transaction[];
  
  login: (user: User) => Promise<void>;
  logout: () => Promise<void>;
  loadInitialData: () => Promise<void>;
  
  addStudent: (student: Omit<Student, 'id' | 'createdAt' | 'updatedAt' | 'balance'>) => Promise<void>;
  updateStudent: (id: string, updates: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  getStudentById: (id: string) => Student | undefined;
  
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getTransactionsByStudent: (studentId: string) => Transaction[];
  
  calculateBalance: (studentId: string) => number;
  getClassReport: () => any[];
}

const useStore = create<StoreState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  students: [],
  transactions: [],
  
  loadInitialData: async () => {
    try {
      const [user, students, transactions] = await Promise.all([
        StorageService.getUser(),
        StorageService.getStudents(),
        StorageService.getTransactions(),
      ]);
      
      set({
        user,
        isAuthenticated: !!user,
        students,
        transactions,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error loading initial data:', error);
      set({ isLoading: false });
    }
  },
  
  login: async (user) => {
    await StorageService.saveUser(user);
    set({ user, isAuthenticated: true });
  },
  
  logout: async () => {
    await StorageService.removeUser();
    set({ user: null, isAuthenticated: false });
  },
  
  addStudent: async (studentData) => {
    const newStudent: Student = {
      ...studentData,
      id: Date.now().toString(),
      balance: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const updatedStudents = [...get().students, newStudent];
    await StorageService.saveStudents(updatedStudents);
    set({ students: updatedStudents });
  },
  
  updateStudent: async (id, updates) => {
    const updatedStudents = get().students.map((student) =>
      student.id === id
        ? { ...student, ...updates, updatedAt: new Date().toISOString() }
        : student
    );
    
    await StorageService.saveStudents(updatedStudents);
    set({ students: updatedStudents });
  },
  
  deleteStudent: async (id) => {
    const updatedStudents = get().students.filter((student) => student.id !== id);
    const updatedTransactions = get().transactions.filter((t) => t.studentId !== id);
    
    await Promise.all([
      StorageService.saveStudents(updatedStudents),
      StorageService.saveTransactions(updatedTransactions),
    ]);
    
    set({
      students: updatedStudents,
      transactions: updatedTransactions,
    });
  },
  
  getStudentById: (id) => {
    return get().students.find((student) => student.id === id);
  },
  
  addTransaction: async (transactionData) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: Date.now().toString(),
    };
    
    const updatedStudents = get().students.map((student) => {
      if (student.id === transactionData.studentId) {
        const newBalance =
          transactionData.type === 'deposit'
            ? student.balance + transactionData.amount
            : student.balance - transactionData.amount;
        
        return { ...student, balance: newBalance, updatedAt: new Date().toISOString() };
      }
      return student;
    });
    
    const updatedTransactions = [...get().transactions, newTransaction];
    
    await Promise.all([
      StorageService.saveStudents(updatedStudents),
      StorageService.saveTransactions(updatedTransactions),
    ]);
    
    set({
      transactions: updatedTransactions,
      students: updatedStudents,
    });
  },
  
  updateTransaction: async (id, updates) => {
    const oldTransaction = get().transactions.find((t) => t.id === id);
    if (!oldTransaction) return;
    
    const updatedTransactions = get().transactions.map((t) =>
      t.id === id ? { ...t, ...updates } : t
    );
    
    const updatedStudents = get().students.map((student) => {
      if (student.id === oldTransaction.studentId) {
        let newBalance = student.balance;
        
        if (oldTransaction.type === 'deposit') {
          newBalance -= oldTransaction.amount;
        } else {
          newBalance += oldTransaction.amount;
        }
        
        const newType = updates.type || oldTransaction.type;
        const newAmount = updates.amount || oldTransaction.amount;
        
        if (newType === 'deposit') {
          newBalance += newAmount;
        } else {
          newBalance -= newAmount;
        }
        
        return { ...student, balance: newBalance, updatedAt: new Date().toISOString() };
      }
      return student;
    });
    
    await Promise.all([
      StorageService.saveStudents(updatedStudents),
      StorageService.saveTransactions(updatedTransactions),
    ]);
    
    set({
      transactions: updatedTransactions,
      students: updatedStudents,
    });
  },
  
  deleteTransaction: async (id) => {
    const transaction = get().transactions.find((t) => t.id === id);
    if (!transaction) return;
    
    const updatedTransactions = get().transactions.filter((t) => t.id !== id);
    
    const updatedStudents = get().students.map((student) => {
      if (student.id === transaction.studentId) {
        let newBalance = student.balance;
        
        if (transaction.type === 'deposit') {
          newBalance -= transaction.amount;
        } else {
          newBalance += transaction.amount;
        }
        
        return { ...student, balance: newBalance, updatedAt: new Date().toISOString() };
      }
      return student;
    });
    
    await Promise.all([
      StorageService.saveStudents(updatedStudents),
      StorageService.saveTransactions(updatedTransactions),
    ]);
    
    set({
      transactions: updatedTransactions,
      students: updatedStudents,
    });
  },
  
  getTransactionsByStudent: (studentId) => {
    return get().transactions.filter((t) => t.studentId === studentId);
  },
  
  calculateBalance: (studentId) => {
    const transactions = get().getTransactionsByStudent(studentId);
    return transactions.reduce((balance, transaction) => {
      return transaction.type === 'deposit'
        ? balance + transaction.amount
        : balance - transaction.amount;
    }, 0);
  },
  
  getClassReport: () => {
    const students = get().students;
    const transactions = get().transactions;
    
    const gradeMap = new Map<number, any>();
    
    for (let grade = 1; grade <= 6; grade++) {
      gradeMap.set(grade, {
        grade,
        className: `Kelas ${grade}`,
        totalStudents: 0,
        totalBalance: 0,
        totalDeposits: 0,
        totalWithdrawals: 0,
      });
    }
    
    students.forEach((student) => {
      const report = gradeMap.get(student.grade);
      if (report) {
        report.totalStudents += 1;
        report.totalBalance += student.balance;
        
        const studentTransactions = transactions.filter((t) => t.studentId === student.id);
        studentTransactions.forEach((t) => {
          if (t.type === 'deposit') {
            report.totalDeposits += t.amount;
          } else {
            report.totalWithdrawals += t.amount;
          }
        });
      }
    });
    
    return Array.from(gradeMap.values()).filter(report => report.totalStudents > 0);
  },
}));

export default useStore;
