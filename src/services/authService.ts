import { User } from '../types';

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  user?: User;
  message?: string;
}

const MOCK_USERS: User[] = [
  {
    id: '1',
    username: 'admin',
    name: 'Admin Sekolah',
    role: 'admin',
  },
  {
    id: '2',
    username: 'guru',
    name: 'Ibu Siti',
    role: 'teacher',
  },
  {
    id: '3',
    username: 'guru2',
    name: 'Pak Budi',
    role: 'teacher',
  },
];

const MOCK_PASSWORDS: { [key: string]: string } = {
  admin: 'admin123',
  guru: 'guru123',
  guru2: 'guru123',
};

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const { username, password } = credentials;

  if (!username.trim() || !password.trim()) {
    return {
      success: false,
      message: 'Username dan password harus diisi',
    };
  }

  const user = MOCK_USERS.find((u) => u.username === username);

  if (!user) {
    return {
      success: false,
      message: 'Username tidak ditemukan',
    };
  }

  if (MOCK_PASSWORDS[username] !== password) {
    return {
      success: false,
      message: 'Password salah',
    };
  }

  return {
    success: true,
    user,
  };
};
