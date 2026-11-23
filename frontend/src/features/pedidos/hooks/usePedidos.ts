import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cambiarEstadoPedidoApi,
  cancelarPedidoApi,
  crearPedidoApi,
  getPedidosApi,
  getResumenPedidosApi,
} from '../api/pedidos';
import type {
  EstadoPedido,
  PedidoCreatePayload,
  PedidosFiltros,
} from '../types/pedido';

export function usePedidos(filtros: PedidosFiltros = {}) {
  return useQuery({
    queryKey: ['pedidos', filtros],
    queryFn: () => getPedidosApi(filtros),
  });
}

export function useCrearPedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PedidoCreatePayload) => crearPedidoApi(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      void queryClient.invalidateQueries({ queryKey: ['productos'] });
      void queryClient.invalidateQueries({ queryKey: ['resumen-pedidos'] });
    },
  });
}

export function useCambiarEstadoPedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) =>
      cambiarEstadoPedidoApi(id, estado),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      void queryClient.invalidateQueries({ queryKey: ['productos'] });
      void queryClient.invalidateQueries({ queryKey: ['resumen-pedidos'] });
    },
  });
}

export function useCancelarPedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => cancelarPedidoApi(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      void queryClient.invalidateQueries({ queryKey: ['productos'] });
      void queryClient.invalidateQueries({ queryKey: ['resumen-pedidos'] });
    },
  });
}

export function useResumenPedidos() {
  return useQuery({
    queryKey: ['resumen-pedidos'],
    queryFn: getResumenPedidosApi,
  });
}
