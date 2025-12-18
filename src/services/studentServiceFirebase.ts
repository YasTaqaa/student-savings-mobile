import {collection,addDoc,updateDoc,deleteDoc,doc,onSnapshot,query,where,getDocs,} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Student, Transaction } from '../types';

export const subscribeStudents = (cb: (s: Student[]) => void) => {
  const colRef = collection(db, 'students');
  return onSnapshot(colRef, (snap) => {
    const data = snap.docs.map(
      (d) => ({ id: d.id, ...d.data() } as Student)
    );
    cb(data);
  });
};

export const subscribeTransactions = (cb: (t: Transaction[]) => void) => {
  const colRef = collection(db, 'transactions');
  return onSnapshot(colRef, (snap) => {
    const data = snap.docs.map(
      (d) => ({ id: d.id, ...d.data() } as Transaction)
    );
    cb(data);
  });
};

export const addStudentDoc = async (
  student: Omit<Student, 'id'>
) => {
  await addDoc(collection(db, 'students'), student);
};

export const updateStudentDoc = async (
  id: string,
  updates: Partial<Student>
) => {
  await updateDoc(doc(db, 'students', id), updates as any);
};

export const deleteStudentDoc = async (id: string) => {
  await deleteDoc(doc(db, 'students', id));

  const txCol = collection(db, 'transactions');
  const q = query(txCol, where('studentId', '==', id));
  const snap = await getDocs(q);
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
};

// Tambah transaksi
export const addTransactionDoc = async (
  tx: Omit<Transaction, 'id'>
) => {
  await addDoc(collection(db, 'transactions'), tx);
};
