import client from './client';
import type { User, RegisterPayload } from '../types';

interface AuthResponse {
  user: User;
  token: string;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await client.post<any>('/auth/login', { email, password });
  // Laravel JsonResource wraps user in data if nested
  return {
    token: data.token,
    user: data.user.data || data.user
  };
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await client.post<any>('/auth/register', payload);
  return {
    token: data.token,
    user: data.user.data || data.user
  };
}

export async function logout(): Promise<void> {
  await client.post('/auth/logout');
}

export async function me(): Promise<User> {
  const { data } = await client.get<{ data: User }>('/auth/me');
  return data.data;
}

export async function verifyEmail(token: string): Promise<void> {
  await client.post(`/auth/verify-email?token=${token}`);
}