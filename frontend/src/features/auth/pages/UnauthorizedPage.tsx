import { Link } from 'react-router-dom';
import { Card } from '../../../shared/ui/Card';

export function UnauthorizedPage() {
  return (
    <div className="max-w-lg mx-auto py-12">
      <Card className="p-8 text-center space-y-4">
        <span className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">
          403 · Acceso restringido
        </span>
        <h1 className="text-2xl font-bold text-slate-900">
          No tenés permisos para ver esta página
        </h1>
        <p className="text-sm text-slate-600">
          Esta sección es exclusiva para administradores del negocio.
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-5 py-2.5 transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </Card>
    </div>
  );
}
