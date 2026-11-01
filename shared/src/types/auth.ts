export type UserRole = 'admin' | 'member';

export interface User {
  id: number | string;
  name: string;
  surname?: string | null;
  username?: string | null;
  email: string;
  status?: 'pending' | 'active' | 'suspended';
  role?: UserRole;
  roles?: string[];
  phone?: string | null;
  address?: string | null;
  avatar?: string | null;
  created_at?: string;
  updated_at?: string;
  is_pending?: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  token_type: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  device_name?: string;
}

export interface RegisterData {
  name: string;
  surname: string;
  email: string;
  password: string;
  password_confirmation: string;
  device_name?: string;
}

export interface UpdateProfileData {
  name: string;
  surname: string;
  username?: string | null;
  email: string;
  phone?: string | null;
  address?: string | null;
}

export interface UpdatePasswordData {
  current_password: string;
  password: string;
  password_confirmation: string;
}
