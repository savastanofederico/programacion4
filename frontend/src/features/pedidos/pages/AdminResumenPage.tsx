import { handleApiError } from '../../../shared/api/handleApiError';
import { EstadoError } from '../../../shared/components/EstadoError';
import { Card } from '../../../shared/ui/Card';
import { useResumenPedidos } from '../hooks/usePedidos';

export function AdminResumenPage() {
  const { data, isLoading, isError, error, refetch } = useResumenPedidos();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, idx) => (
          <Card key={idx} className="p-6 h-28 animate-pulse bg-slate-100">
            <div />
          </Card>
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <EstadoError
        mensaje={handleApiError(error, 'No se pudo cargar el resumen')}
        onReintentar={() => void refetch()}
      />
    );
  }

  const tarjetas = [
    {
      titulo: 'Pendientes',
      valor: String(data.pendientes),
      acento: 'border-l-4 border-l-amber-500',
      texto: 'text-amber-700',
    },
    {
      titulo: 'En preparación',
      valor: String(data.en_preparacion),
      acento: 'border-l-4 border-l-blue-500',
      texto: 'text-blue-700',
    },
    {
      titulo: 'Entregados',
      valor: String(data.entregados),
      acento: 'border-l-4 border-l-emerald-500',
      texto: 'text-emerald-700',
    },
    {
      titulo: 'Cancelados',
      valor: String(data.cancelados),
      acento: 'border-l-4 border-l-red-500',
      texto: 'text-red-700',
    },
    {
      titulo: 'Pedidos de hoy',
      valor: String(data.pedidos_hoy),
      acento: 'border-l-4 border-l-slate-700',
      texto: 'text-slate-900',
    },
    {
      titulo: 'Ingresos entregados',
      valor: `$ ${data.ingresos_entregados.toLocaleString('es-AR', {
        minimumFractionDigits: 2,
      })}`,
      acento: 'border-l-4 border-l-emerald-600',
      texto: 'text-emerald-700',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Resumen del Negocio</h1>
        <p className="text-sm text-slate-500">
          Indicadores generales de operación y facturación de Food Store.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tarjetas.map((t) => (
          <Card key={t.titulo} className={`p-6 ${t.acento}`}>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t.titulo}
            </p>
            <p className={`text-3xl font-extrabold mt-2 ${t.texto}`}>{t.valor}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
