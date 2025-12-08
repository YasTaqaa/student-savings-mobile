import { User } from '../types';

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  user?: User;
  message?: string;
  token?: string; // Untuk future implementation
}

// Mock Users Database
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

// Mock Passwords (In production: use hashed passwords!)
const MOCK_PASSWORDS: { [key: string]: string } = {
  'admin': 'admin123',
  'guru': 'guru123',
  'guru2': 'guru123',
};

// Simple hash function (For demo only - use bcrypt in production!)
const simpleHash = (password: string): string => {
  // This is NOT secure! Use bcrypt or similar in production
  return btoa(password);
};

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const { username, password } = credentials;

  // Validation
  if (!username.trim() || !password.trim()) {
    return {
      success: false,
      message: 'Username dan password harus diisi',
    };
  }

  // Find user
  const user = MOCK_USERS.find((u) => u.username === username);

  if (!user) {
    return {
      success: false,
      message: 'Username tidak ditemukan',
    };
  }

  // Check password
  if (MOCK_PASSWORDS[username] !== password) {
    return {
      success: false,
      message: 'Password salah',
    };
  }

  // Generate mock token (In production: use JWT)
  const token = simpleHash(`${username}:${Date.now()}`);

  return {
    success: true,
    user,
    token,
    message: 'Login berhasil',
  };
};

// Verify token (For future implementation)
export const verifyToken = async (token: string): Promise<boolean> => {
  // In production: verify JWT token
  return token ? true : false;
};

// Change password (For future implementation)
export const changePassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> => {
  // In production: verify old password and update in database
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (newPassword.length < 6) {
    return {
      success: false,
      message: 'Password baru harus minimal 6 karakter',
    };
  }

  return {
    success: true,
    message: 'Password berhasil diubah',
  };
};