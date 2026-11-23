import { axiosInstance } from '../../../shared/api/axiosInstance';
import type { UserPublic } from '../../auth/types/auth';

export async function getUsuariosApi(): Promise<UserPublic[]> {
  const { data } = await axiosInstance.get<UserPublic[]>('/admin/usuarios');
  return data;
}

export async function activarUsuarioApi(id: number): Promise<UserPublic> {
  const { data } = await axiosInstance.post<UserPublic>(`/admin/usuarios/${id}/activar`);
  return data;
}

export async function desactivarUsuarioApi(id: number): Promise<UserPublic> {
  const { data } = await axiosInstance.post<UserPublic>(`/admin/usuarios/${id}/desactivar`);
  return data;
}
