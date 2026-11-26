import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  actualizarProductoApi,
  actualizarStockApi,
  crearProductoApi,
  eliminarProductoApi,
  getProductosApi,
} from '../api/productos';
import type {
  ProductoPayload,
  ProductosFiltros,
  ProductoStockPayload,
} from '../types/producto';

export function useProductos(filtros: ProductosFiltros) {
  return useQuery({
    queryKey: ['productos', filtros],
    queryFn: () => getProductosApi(filtros),
    placeholderData: keepPreviousData,
  });
}

export function useCrearProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProductoPayload) => crearProductoApi(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });
}

export function useActualizarProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ProductoPayload }) =>
      actualizarProductoApi(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });
}

export function useActualizarStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ProductoStockPayload }) =>
      actualizarStockApi(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });
}

export function useEliminarProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => eliminarProductoApi(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
  });
}
