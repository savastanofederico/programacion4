import { useMemo, useState } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { handleApiError } from '../../../shared/api/handleApiError';
import { EstadoError } from '../../../shared/components/EstadoError';
import { EstadoVacio } from '../../../shared/components/EstadoVacio';
import { Paginacion } from '../../../shared/components/Paginacion';
import { BadgeEstado } from '../../../shared/ui/BadgeEstado';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { DetallePedidoModal } from '../components/DetallePedidoModal';
import { useCambiarEstadoPedido, usePedidos } from '../hooks/usePedidos';
import type { EstadoPedido, Pedido } from '../types/pedido';

const columnHelper = createColumnHelper<Pedido>();
const LIMITE = 10;

export function AdminPedidosPage() {
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoPedido | ''>('');
  const [pagina, setPagina] = useState(0);
  const [pedidoDetalle, setPedidoDetalle] = useState<Pedido | null>(null);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = usePedidos({
    skip: pagina * LIMITE,
    limit: LIMITE,
    estado: estadoFiltro || undefined,
  });
  const cambiarEstadoMutation = useCambiarEstadoPedido();

  const pedidos = data?.items ?? [];
  const totalPaginas = Math.ceil((data?.total ?? 0) / LIMITE);

  const handleCambiarEstado = async (id: number, estado: EstadoPedido) => {
    setErrorAccion(null);
    try {
      await cambiarEstadoMutation.mutateAsync({ id, estado });
    } catch (err) {
      setErrorAccion(handleApiError(err, 'No se pudo cambiar el estado del pedido'));
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'Pedido',
        cell: (info) => <span className="font-bold text-slate-900">#{info.getValue()}</span>,
      }),
      columnHelper.accessor('created_at', {
        header: 'Fecha',
        cell: (info) => (
          <span className="text-xs text-slate-600">
            {new Date(info.getValue()).toLocaleString('es-AR')}
          </span>
        ),
      }),
      columnHelper.accessor('direccion_entrega', {
        header: 'Entrega / Pago',
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-slate-800">{row.original.direccion_entrega}</p>
            <p className="text-xs text-slate-500">
              Usuario #{row.original.usuario_id} · {row.original.forma_pago}
            </p>
          </div>
        ),
      }),
      columnHelper.accessor('total', {
        header: 'Total',
        cell: (info) => (
          <span className="font-bold text-emerald-700">
            $ {info.getValue().toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </span>
        ),
      }),
      columnHelper.accessor('estado', {
        header: 'Estado',
        cell: (info) => <BadgeEstado estado={info.getValue()} />,
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => {
          const p = row.original;
          return (
            <div className="flex flex-wrap justify-end gap-1.5">
              <Button
                variant="secondary"
                className="px-2.5 py-1 text-xs"
                onClick={() => setPedidoDetalle(p)}
              >
                Detalle
              </Button>
              {p.estado === 'PENDIENTE' && (
                <Button
                  variant="primary"
                  className="px-2.5 py-1 text-xs"
                  disabled={cambiarEstadoMutation.isPending}
                  onClick={() => void handleCambiarEstado(p.id, 'EN_PREPARACION')}
                >
                  Preparar
                </Button>
              )}
              {p.estado === 'EN_PREPARACION' && (
                <Button
                  variant="success"
                  className="px-2.5 py-1 text-xs"
                  disabled={cambiarEstadoMutation.isPending}
                  onClick={() => void handleCambiarEstado(p.id, 'ENTREGADO')}
                >
                  Entregar
                </Button>
              )}
              {(p.estado === 'PENDIENTE' || p.estado === 'EN_PREPARACION') && (
                <Button
                  variant="danger"
                  className="px-2.5 py-1 text-xs"
                  disabled={cambiarEstadoMutation.isPending}
                  onClick={() => void handleCambiarEstado(p.id, 'CANCELADO')}
                >
                  Cancelar
                </Button>
              )}
            </div>
          );
        },
      }),
    ],
    [cambiarEstadoMutation.isPending]
  );

  const table = useReactTable({
    data: pedidos,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestión de Pedidos</h1>
          <p className="text-sm text-slate-500">
            Avanzá pedidos según la máquina de estados o cancelá con restitución automática de
            stock.
          </p>
        </div>

        <div className="space-y-1">
          <label htmlFor="filtro-estado" className="block text-xs font-semibold text-slate-600">
            Filtrar por estado
          </label>
          <select
            id="filtro-estado"
            value={estadoFiltro}
            onChange={(e) => {
              setEstadoFiltro(e.target.value as EstadoPedido | '');
              setPagina(0);
            }}
            className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">Todos los estados</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="EN_PREPARACION">En preparación</option>
            <option value="ENTREGADO">Entregado</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </div>
      </div>

      {errorAccion && <EstadoError mensaje={errorAccion} />}

      {isLoading ? (
        <Card className="p-8 text-center text-sm text-slate-500 animate-pulse">
          Cargando pedidos...
        </Card>
      ) : isError ? (
        <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />
      ) : pedidos.length === 0 ? (
        <EstadoVacio
          titulo="No hay pedidos para mostrar"
          descripcion="Todavía no hay pedidos registrados con el filtro seleccionado."
        />
      ) : (
        <>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                  {table.getHeaderGroups().map((hg) => (
                    <tr key={hg.id}>
                      {hg.headers.map((header) => (
                        <th
                          key={header.id}
                          className={`px-5 py-3 font-semibold ${
                            header.id === 'acciones' ? 'text-right' : ''
                          }`}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/70">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-5 py-3.5">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

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
