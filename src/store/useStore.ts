import { create } from 'zustand';
import { User, Student, Transaction } from '../types';
import * as StorageService from '../services/storageService';

interface StoreState {
  // Auth State
  user: User | null;
  isAuthenticated: boolean;
  
  // Data State
  students: Student[];
  transactions: Transaction[];
  
  // Auth Actions
  login: (user: User) => Promise<void>;
  logout: () => Promise<void>;
  
  // Student Actions
  addStudent: (student: Omit<Student, 'id' | 'balance' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateStudent: (id: string, updates: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  getStudentById: (id: string) => Student | undefined;
  
  // Transaction Actions
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getTransactionById: (id: string) => Transaction | undefined;
  getTransactionsByStudent: (studentId: string) => Transaction[];
  
  // Report Actions
  getClassReport: () => Array<{
    className: string;
    grade: number;
    totalStudents: number;
    totalBalance: number;
    totalDeposits: number;
    totalWithdrawals: number;
  }>;
  
  // Initial Load
  loadData: () => Promise<void>;
}

const useStore = create<StoreState>((set, get) => ({
  // ========== Initial State ==========
  user: null,
  isAuthenticated: false,
  students: [],
  transactions: [],
  
  // ========== Load Data from Storage ==========
  loadData: async () => {
    try {
      const user = await StorageService.getUser();
      const students = await StorageService.getStudents();
      const transactions = await StorageService.getTransactions();
      
      set({
        user: user || null,
        isAuthenticated: !!user,
        students: students || [],
        transactions: transactions || [],
      });
    } catch (error) {
      console.error('Error loading data:', error);
    }
  },
  
  // ========== Auth Actions ==========
  login: async (user: User) => {
    try {
      await StorageService.saveUser(user);
      set({ user, isAuthenticated: true });
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  },
  
  logout: async () => {
    try {
      await StorageService.clearUser();
      set({
        user: null,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  },
  
  // ========== Student Actions ==========
  addStudent: async (studentData) => {
    try {
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
    } catch (error) {
      console.error('Error adding student:', error);
      throw error;
    }
  },
  
  updateStudent: async (id, updates) => {
    try {
      const updatedStudents = get().students.map((student) =>
        student.id === id
          ? { ...student, ...updates, updatedAt: new Date().toISOString() }
          : student
      );
      
      await StorageService.saveStudents(updatedStudents);
      set({ students: updatedStudents });
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  },
  
  deleteStudent: async (id) => {
    try {
      const updatedStudents = get().students.filter((s) => s.id !== id);
      const updatedTransactions = get().transactions.filter((t) => t.studentId !== id);
      
      await StorageService.saveStudents(updatedStudents);
      await StorageService.saveTransactions(updatedTransactions);
      
      set({ 
        students: updatedStudents,
        transactions: updatedTransactions 
      });
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  },
  
  getStudentById: (id) => {
    return get().students.find((s) => s.id === id);
  },
  
  // ========== Transaction Actions ==========
  addTransaction: async (transactionData) => {
    try {
      const newTransaction: Transaction = {
        ...transactionData,
        id: Date.now().toString(),
      };
      
      // Update student balance
      const updatedStudents = get().students.map((student) => {
        if (student.id === transactionData.studentId) {
          const newBalance = transactionData.type === 'deposit'
            ? student.balance + transactionData.amount
            : student.balance - transactionData.amount;
          
          return {
            ...student,
            balance: newBalance,
            updatedAt: new Date().toISOString(),
          };
        }
        return student;
      });
      
      const updatedTransactions = [...get().transactions, newTransaction];
      
      await StorageService.saveStudents(updatedStudents);
      await StorageService.saveTransactions(updatedTransactions);
      
      set({ 
        students: updatedStudents,
        transactions: updatedTransactions 
      });
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  },
  
  updateTransaction: async (id, updates) => {
    try {
      const oldTransaction = get().transactions.find((t) => t.id === id);
      if (!oldTransaction) return;
      
      const updatedTransactions = get().transactions.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      );
      
      // Recalculate student balance
      let updatedStudents = get().students;
      
      // Revert old transaction
      updatedStudents = updatedStudents.map((student) => {
        if (student.id === oldTransaction.studentId) {
          const revertAmount = oldTransaction.type === 'deposit'
            ? student.balance - oldTransaction.amount
            : student.balance + oldTransaction.amount;
          return { ...student, balance: revertAmount };
        }
        return student;
      });
      
      // Apply new transaction
      const newTransaction = updatedTransactions.find((t) => t.id === id)!;
      updatedStudents = updatedStudents.map((student) => {
        if (student.id === newTransaction.studentId) {
          const newBalance = newTransaction.type === 'deposit'
            ? student.balance + newTransaction.amount
            : student.balance - newTransaction.amount;
          
          return {
            ...student,
            balance: newBalance,
            updatedAt: new Date().toISOString(),
          };
        }
        return student;
      });
      
      await StorageService.saveStudents(updatedStudents);
      await StorageService.saveTransactions(updatedTransactions);
      
      set({ 
        students: updatedStudents,
        transactions: updatedTransactions 
      });
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  },
  
  deleteTransaction: async (id) => {
    try {
      const transaction = get().transactions.find((t) => t.id === id);
      if (!transaction) return;
      
      // Revert balance
      const updatedStudents = get().students.map((student) => {
        if (student.id === transaction.studentId) {
          const newBalance = transaction.type === 'deposit'
            ? student.balance - transaction.amount
            : student.balance + transaction.amount;
          
          return {
            ...student,
            balance: newBalance,
            updatedAt: new Date().toISOString(),
          };
        }
        return student;
      });
      
      const updatedTransactions = get().transactions.filter((t) => t.id !== id);
      
      await StorageService.saveStudents(updatedStudents);
      await StorageService.saveTransactions(updatedTransactions);
      
      set({ 
        students: updatedStudents,
        transactions: updatedTransactions 
      });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  },
  
  getTransactionById: (id) => {
    return get().transactions.find((t) => t.id === id);
  },
  
  getTransactionsByStudent: (studentId) => {
    return get().transactions.filter((t) => t.studentId === studentId);
  },
  
  // ========== Report Actions ==========
  getClassReport: () => {
    const students = get().students;
    const transactions = get().transactions;
    
    // Group by grade (1-6)
    const gradeGroups = new Map<number, typeof students>();
    
    for (let grade = 1; grade <= 6; grade++) {
      const gradeStudents = students.filter((s) => s.grade === grade);
      if (gradeStudents.length > 0) {
        gradeGroups.set(grade, gradeStudents);
      }
    }
    
    // Calculate stats for each grade
    const reports = Array.from(gradeGroups.entries()).map(([grade, gradeStudents]) => {
      const totalBalance = gradeStudents.reduce((sum, s) => sum + s.balance, 0);
      
      // Get transactions for this grade
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
  },
}));

export default useStore;
