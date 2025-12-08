import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Student, Transaction } from '../types';

const STORAGE_KEYS = {
  USER: '@student_savings:user',
  STUDENTS: '@student_savings:students',
  TRANSACTIONS: '@student_savings:transactions',
};

// User Storage
export const saveUser = async (user: User): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user:', error);
    throw error;
  }
};

export const getUser = async (): Promise<User | null> => {
  try {
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

export const clearUser = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
  } catch (error) {
    console.error('Error clearing user:', error);
    throw error;
  }
};

// Students Storage
export const saveStudents = async (students: Student[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  } catch (error) {
    console.error('Error saving students:', error);
    throw error;
  }
};

export const getStudents = async (): Promise<Student[]> => {
  try {
    const studentsData = await AsyncStorage.getItem(STORAGE_KEYS.STUDENTS);
    return studentsData ? JSON.parse(studentsData) : [];
  } catch (error) {
    console.error('Error getting students:', error);
    return [];
  }
};

// Transactions Storage
export const saveTransactions = async (transactions: Transaction[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (error) {
    console.error('Error saving transactions:', error);
    throw error;
  }
};

export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    const transactionsData = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return transactionsData ? JSON.parse(transactionsData) : [];
  } catch (error) {
    console.error('Error getting transactions:', error);
    return [];
  }
};

// Clear all data (untuk logout atau reset)
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.USER,
      STORAGE_KEYS.STUDENTS,
      STORAGE_KEYS.TRANSACTIONS,
    ]);
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw error;
  }
};