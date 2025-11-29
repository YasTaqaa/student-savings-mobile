import AsyncStorage from '@react-native-async-storage/async-storage';
import { Student, Transaction, User } from '../types';

const KEYS = {
  USER: '@user',
  STUDENTS: '@students',
  TRANSACTIONS: '@transactions',
};

export const saveUser = async (user: User): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user:', error);
  }
};

export const getUser = async (): Promise<User | null> => {
  try {
    const user = await AsyncStorage.getItem(KEYS.USER);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

export const removeUser = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(KEYS.USER);
  } catch (error) {
    console.error('Error removing user:', error);
  }
};

export const saveStudents = async (students: Student[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));
  } catch (error) {
    console.error('Error saving students:', error);
  }
};

export const getStudents = async (): Promise<Student[]> => {
  try {
    const students = await AsyncStorage.getItem(KEYS.STUDENTS);
    return students ? JSON.parse(students) : [];
  } catch (error) {
    console.error('Error getting students:', error);
    return [];
  }
};

export const saveTransactions = async (transactions: Transaction[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (error) {
    console.error('Error saving transactions:', error);
  }
};

export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    const transactions = await AsyncStorage.getItem(KEYS.TRANSACTIONS);
    return transactions ? JSON.parse(transactions) : [];
  } catch (error) {
    console.error('Error getting transactions:', error);
    return [];
  }
};

export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([KEYS.USER, KEYS.STUDENTS, KEYS.TRANSACTIONS]);
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};

export function clearUser() {
  throw new Error('Function not implemented.');
}
