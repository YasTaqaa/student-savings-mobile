import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { User } from '../types';

interface LoginCredentials {
  email: string;
  password: string;
  role: 'admin' | 'teacher';
}

interface LoginResponse {
  success: boolean;
  user?: User;
  message?: string;
  token?: string;
}

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const { email, password, role } = credentials;

  if (!email.trim() || !password.trim()) {
    return { success: false, message: 'Email dan password harus diisi' };
  }

  // Validasi email per role
  if (role === 'admin' && email !== 'sdn3linggasari@sekolah.com') {
    return { success: false, message: 'Hanya email admin yang boleh login sebagai Admin' };
  }
  if (role === 'teacher' && email !== '123456guru@sekolah.com') {
    return { success: false, message: 'Hanya email guru yang boleh login sebagai Guru' };
  }

  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCred.user.getIdToken();

    const appUser: User = {
      id: userCred.user.uid,
      username: email,
      name: email.split('@')[0],
      role, 
    };

    return { success: true, user: appUser, token, message: 'Login berhasil' };
  } catch (err: any) {
    let message = 'Terjadi kesalahan login';
    if (err.code === 'auth/wrong-password') message = 'Password salah';
    if (err.code === 'auth/user-not-found') message = 'User tidak terdaftar';
    return { success: false, message };
  }
};

export const logout = async () => {
  await signOut(auth);
};
