import axios from 'axios';

interface ValidationErrorItem {
  msg?: string;
}

export function handleApiError(error: unknown, fallback = 'Ocurrió un error inesperado'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { detail?: string | ValidationErrorItem[] } | undefined;
    if (typeof data?.detail === 'string' && data.detail.trim().length > 0) {
      return data.detail;
    }
    if (Array.isArray(data?.detail) && data.detail.length > 0) {
      return data.detail.map((item) => item.msg ?? 'Dato inválido').join(', ');
    }
    if (error.message === 'Network Error') {
      return 'No se pudo conectar con el servidor. Verificá que el backend esté encendido.';
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
