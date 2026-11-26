import { handleApiError } from '../../../shared/api/handleApiError';
import { EstadoError } from '../../../shared/components/EstadoError';
import { Card } from '../../../shared/ui/Card';
import { TarjetaResumen } from '../components/TarjetaResumen';
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
      acento: 'border-l-amber-500',
      colorTexto: 'text-amber-700',
    },
    {
      titulo: 'En preparación',
      valor: String(data.en_preparacion),
      acento: 'border-l-blue-500',
      colorTexto: 'text-blue-700',
    },
    {
      titulo: 'Entregados',
      valor: String(data.entregados),
      acento: 'border-l-emerald-500',
      colorTexto: 'text-emerald-700',
    },
    {
      titulo: 'Cancelados',
      valor: String(data.cancelados),
      acento: 'border-l-red-500',
      colorTexto: 'text-red-700',
    },
    {
      titulo: 'Pedidos de hoy',
      valor: String(data.pedidos_hoy),
      acento: 'border-l-slate-700',
      colorTexto: 'text-slate-900',
    },
    {
      titulo: 'Ingresos entregados',
      valor: `$ ${data.ingresos_entregados.toLocaleString('es-AR', {
        minimumFractionDigits: 2,
      })}`,
      acento: 'border-l-emerald-600',
      colorTexto: 'text-emerald-700',
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
          <TarjetaResumen key={t.titulo} {...t} />
        ))}
      </div>
    </div>
  );
}
