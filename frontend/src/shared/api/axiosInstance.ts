import axios from 'axios';

type UnauthorizedHandler = () => void;
let unauthorizedHandler: UnauthorizedHandler | null = null;

export function registerUnauthorizedHandler(handler: UnauthorizedHandler): void {
  unauthorizedHandler = handler;
}

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const url = error.config?.url ?? '';
      const data = error.response?.data as { detail?: unknown } | undefined;
      const detail = typeof data?.detail === 'string' ? data.detail : '';

      const esEndpointAuth = url.includes('/auth/token') || url.includes('/auth/me');
      const sesionExpirada = status === 401 && !esEndpointAuth;
      const cuentaDesactivada = status === 400 && detail === 'Cuenta de usuario desactivada';

      if ((sesionExpirada || cuentaDesactivada) && unauthorizedHandler) {
        unauthorizedHandler();
      }
    }
    return Promise.reject(error);
  }
);
