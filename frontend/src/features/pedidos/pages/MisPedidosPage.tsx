import { useState } from 'react';
import { Link } from 'react-router-dom';
import { handleApiError } from '../../../shared/api/handleApiError';
import { EstadoError } from '../../../shared/components/EstadoError';
import { EstadoVacio } from '../../../shared/components/EstadoVacio';
import { Paginacion } from '../../../shared/components/Paginacion';
import { BadgeEstado } from '../../../shared/ui/BadgeEstado';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { DetallePedidoModal } from '../components/DetallePedidoModal';
import { useCancelarPedido, usePedidos } from '../hooks/usePedidos';
import type { Pedido } from '../types/pedido';

const LIMITE = 10;

export function MisPedidosPage() {
  const [pagina, setPagina] = useState(0);
  const [pedidoDetalle, setPedidoDetalle] = useState<Pedido | null>(null);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = usePedidos({
    skip: pagina * LIMITE,
    limit: LIMITE,
  });
  const cancelarMutation = useCancelarPedido();

  const pedidos = data?.items ?? [];
  const totalPaginas = Math.ceil((data?.total ?? 0) / LIMITE);

  const handleCancelar = async (id: number) => {
    setErrorAccion(null);
    try {
      await cancelarMutation.mutateAsync(id);
    } catch (err) {
      setErrorAccion(handleApiError(err, 'No se pudo cancelar el pedido'));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mis Pedidos</h1>
        <p className="text-sm text-slate-500">
          Seguí el estado de tus pedidos. Podés cancelar mientras esté en estado Pendiente.
        </p>
      </div>

      {errorAccion && <EstadoError mensaje={errorAccion} />}

      {isLoading ? (
        <Card className="p-8 text-center text-sm text-slate-500 animate-pulse">
          Cargando tus pedidos...
        </Card>
      ) : isError ? (
        <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />
      ) : pedidos.length === 0 ? (
        <EstadoVacio
          titulo="Todavía no realizaste pedidos"
          descripcion="Cuando confirmes tu primera compra, aparecerá listada en esta pantalla."
          accion={
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-5 py-2.5 transition-colors"
            >
              Ver catálogo
            </Link>
          }
        />
      ) : (
        <>
          <div className="space-y-4">
            {pedidos.map((pedido) => (
              <Card
                key={pedido.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-bold text-slate-900">Pedido #{pedido.id}</span>
                    <BadgeEstado estado={pedido.estado} />
                    <span className="text-xs text-slate-500">
                      {new Date(pedido.created_at).toLocaleString('es-AR')}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">
                    Entrega: <span className="font-medium">{pedido.direccion_entrega}</span> · Pago:{' '}
                    <span className="font-medium">{pedido.forma_pago}</span>
                  </p>
                  <p className="text-sm font-bold text-emerald-700">
                    Total: $ {pedido.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })} (
                    {pedido.items.length} {pedido.items.length === 1 ? 'ítem' : 'ítems'})
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="secondary"
                    className="text-xs px-3 py-1.5"
                    onClick={() => setPedidoDetalle(pedido)}
                  >
                    Ver detalle
                  </Button>
                  {pedido.estado === 'PENDIENTE' && (
                    <Button
                      variant="danger"
                      className="text-xs px-3 py-1.5"
                      disabled={cancelarMutation.isPending}
                      onClick={() => void handleCancelar(pedido.id)}
                    >
                      Cancelar pedido
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <Paginacion
            pagina={pagina}
            totalPaginas={totalPaginas}
            onCambiarPagina={setPagina}
          />
        </>
      )}

      <DetallePedidoModal pedido={pedidoDetalle} onClose={() => setPedidoDetalle(null)} />
    </div>
  );
}
