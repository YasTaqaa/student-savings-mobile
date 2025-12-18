import { create } from 'zustand';
import { User, Student, Transaction } from '../types';
import * as StorageService from '../services/storageService';
import {subscribeStudents,subscribeTransactions,addStudentDoc,updateStudentDoc,deleteStudentDoc,addTransactionDoc,} from '../services/studentServiceFirebase';

interface StoreState {
  user: User | null;
  isAuthenticated: boolean;
  students: Student[];
  transactions: Transaction[];
  isAppReady: boolean;
  login: (user: User) => Promise<void>;
  logout: () => Promise<void>;
  addStudent: (student: Omit<Student, 'id' | 'balance' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateStudent: (id: string, updates: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  getStudentById: (id: string) => Student | undefined;
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getTransactionById: (id: string) => Transaction | undefined;
  getTransactionsByStudent: (studentId: string) => Transaction[];
  getClassReport: () => Array<{
    className: string;
    grade: number;
    totalStudents: number;
    totalBalance: number;
    totalDeposits: number;
    totalWithdrawals: number;
  }>;
  loadData: () => Promise<void>;
}

const useStore = create<StoreState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  students: [],
  transactions: [],
  isAppReady: false,

  loadData: async () => {
    try {
      const user = await StorageService.getUser();

      set({
        user: user || null,
        isAuthenticated: !!user,
      });

      if (!user) return;

      const unsubStudents = subscribeStudents((students) => set({ students }));
      const unsubTx = subscribeTransactions((transactions) =>
        set({ transactions }),
      );

      (global as any).unsubStudents = unsubStudents;
      (global as any).unsubTx = unsubTx;
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      set({ isAppReady: true });
    }
  },

  // ====== BAGIAN YANG DIBENERIN ======
  login: async (user: User) => {
    try {
      await StorageService.saveUser(user);
      set({ user, isAuthenticated: true });

      // Langsung subscribe Firestore setelah login
      const unsubStudents = subscribeStudents((students) => set({ students }));
      const unsubTx = subscribeTransactions((transactions) =>
        set({ transactions }),
      );

      (global as any).unsubStudents = unsubStudents;
      (global as any).unsubTx = unsubTx;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  },
  // ================================

  logout: async () => {
    try {
      await StorageService.clearUser();

      (global as any).unsubStudents?.();
      (global as any).unsubTx?.();

      set({
        user: null,
        isAuthenticated: false,
        students: [],
        transactions: [],
      });
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  },

  addStudent: async (studentData) => {
    try {
      const newStudent: Omit<Student, 'id'> = {
        ...studentData,
        balance: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as any;
      await addStudentDoc(newStudent);
    } catch (error) {
      console.error('Error adding student:', error);
      throw error;
    }
  },

  updateStudent: async (id, updates) => {
    try {
      await updateStudentDoc(id, {
        ...updates,
        updatedAt: new Date().toISOString(),
      } as any);
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  },

  deleteStudent: async (id) => {
    try {
      await deleteStudentDoc(id);
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  },

  getStudentById: (id) => get().students.find((s) => s.id === id),

  addTransaction: async (transactionData) => {
    try {
      const newTransaction: Omit<Transaction, 'id'> = {
        ...transactionData,
        date: transactionData.date || new Date().toISOString(),
      } as any;
      await addTransactionDoc(newTransaction);
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  },

  updateTransaction: async () => {
    console.warn('updateTransaction via Firestore belum diimplementasikan');
    return;
  },

  deleteTransaction: async () => {
    console.warn('deleteTransaction via Firestore belum diimplementasikan');
    return;
  },

  getTransactionById: (id) => get().transactions.find((t) => t.id === id),

  getTransactionsByStudent: (studentId) =>
    get().transactions.filter((t) => t.studentId === studentId),

  getClassReport: () => {
    const students = get().students;
    const transactions = get().transactions;
    const gradeGroups = new Map<number, Student[]>();

    for (let grade = 1; grade <= 6; grade++) {
      const gradeStudents = students.filter((s) => s.grade === grade);
      if (gradeStudents.length > 0) gradeGroups.set(grade, gradeStudents);
    }

    return Array.from(gradeGroups.entries()).map(
      ([grade, gradeStudents]) => {
        const totalBalance = gradeStudents.reduce(
          (sum, s) => sum + s.balance,
          0,
        );
        const studentIds = gradeStudents.map((s) => s.id);
        const gradeTransactions = transactions.filter((t) =>
          studentIds.includes(t.studentId),
        );

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
      },
    );
  },
}));

export default useStore;
