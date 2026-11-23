import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { activarUsuarioApi, desactivarUsuarioApi, getUsuariosApi } from '../api/usuarios';

export function useUsuarios() {
  return useQuery({
    queryKey: ['usuarios'],
    queryFn: getUsuariosApi,
  });
}

export function useActivarUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => activarUsuarioApi(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });
}

export function useDesactivarUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => desactivarUsuarioApi(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });
}
