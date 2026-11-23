import { axiosInstance } from '../../../shared/api/axiosInstance';
import type { Categoria, CategoriaPayload } from '../types/categoria';

export async function getCategoriasApi(): Promise<Categoria[]> {
  const { data } = await axiosInstance.get<Categoria[]>('/categorias');
  return data;
}

export async function crearCategoriaApi(payload: CategoriaPayload): Promise<Categoria> {
  const { data } = await axiosInstance.post<Categoria>('/categorias', payload);
  return data;
}

export async function actualizarCategoriaApi(
  id: number,
  payload: CategoriaPayload
): Promise<Categoria> {
  const { data } = await axiosInstance.put<Categoria>(`/categorias/${id}`, payload);
  return data;
}

export async function eliminarCategoriaApi(id: number): Promise<void> {
  await axiosInstance.delete(`/categorias/${id}`);
}
