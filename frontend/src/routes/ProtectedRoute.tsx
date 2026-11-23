import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import type { RolUsuario } from '../features/auth/types/auth';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: RolUsuario[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const usuario = useAuthStore((s) => s.usuario);
  const cargando = useAuthStore((s) => s.cargando);

  if (cargando) {
    return (
      <div className="py-16 text-center text-sm font-medium text-slate-500 animate-pulse">
        Verificando sesión...
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(usuario.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
