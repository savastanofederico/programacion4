import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  actualizarCategoriaApi,
  crearCategoriaApi,
  eliminarCategoriaApi,
  getCategoriasApi,
} from '../api/categorias';
import type { CategoriaPayload } from '../types/categoria';

export function useCategorias() {
  return useQuery({
    queryKey: ['categorias'],
    queryFn: getCategoriasApi,
  });
}

export function useCrearCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CategoriaPayload) => crearCategoriaApi(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['categorias'] });
    },
  });
}

export function useActualizarCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CategoriaPayload }) =>
      actualizarCategoriaApi(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['categorias'] });
      void queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });
}

export function useEliminarCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => eliminarCategoriaApi(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['categorias'] });
    },
  });
}
