import { apiFetch } from './api';

export type UserRole = 'user' | 'admin';

export interface AuthUser {
  userId: string;
  email: string;
  role: UserRole;
}

export interface RegistroInput {
  email: string;
  nombreCompleto: string;
  dni: string;
  direccion: string;
  telefono: string;
  password: string;
}

export interface RegistroResponse {
  id: string;
  email: string;
  nombreCompleto: string;
}

export interface LoginResponse {
  accessToken: string;
}

export function login(email: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/usuarios/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function registro(data: RegistroInput): Promise<RegistroResponse> {
  return apiFetch<RegistroResponse>('/usuarios/registro', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function fetchMe(token?: string): Promise<AuthUser> {
  return apiFetch<AuthUser>('/auth/me', { token });
}
