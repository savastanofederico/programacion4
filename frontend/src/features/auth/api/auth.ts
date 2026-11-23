import { axiosInstance } from '../../../shared/api/axiosInstance';
import type { RegisterPayload, UserPublic } from '../types/auth';

export async function loginApi(username: string, password: string): Promise<void> {
  const params = new URLSearchParams();
  params.append('username', username);
  params.append('password', password);

  await axiosInstance.post('/auth/token', params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
}

export async function registerApi(payload: RegisterPayload): Promise<UserPublic> {
  const { data } = await axiosInstance.post<UserPublic>('/auth/register', payload);
  return data;
}

export async function logoutApi(): Promise<void> {
  await axiosInstance.post('/auth/logout');
}

export async function getMeApi(): Promise<UserPublic> {
  const { data } = await axiosInstance.get<UserPublic>('/auth/me');
  return data;
}
