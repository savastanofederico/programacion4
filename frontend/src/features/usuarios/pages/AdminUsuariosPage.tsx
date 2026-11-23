import { useMemo, useState } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { handleApiError } from '../../../shared/api/handleApiError';
import { EstadoError } from '../../../shared/components/EstadoError';
import { EstadoVacio } from '../../../shared/components/EstadoVacio';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { useAuthStore } from '../../../store/authStore';
import type { UserPublic } from '../../auth/types/auth';
import {
  useActivarUsuario,
  useDesactivarUsuario,
  useUsuarios,
} from '../hooks/useUsuarios';

const columnHelper = createColumnHelper<UserPublic>();

export function AdminUsuariosPage() {
  const usuarioActual = useAuthStore((s) => s.usuario);
  const { data: usuarios = [], isLoading, isError, error, refetch } = useUsuarios();
  const activarMutation = useActivarUsuario();
  const desactivarMutation = useDesactivarUsuario();
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  const handleActivar = async (id: number) => {
    setErrorAccion(null);
    try {
      await activarMutation.mutateAsync(id);
    } catch (err) {
      setErrorAccion(handleApiError(err, 'No se pudo activar el usuario'));
    }
  };

  const handleDesactivar = async (id: number) => {
    setErrorAccion(null);
    try {
      await desactivarMutation.mutateAsync(id);
    } catch (err) {
      setErrorAccion(handleApiError(err, 'No se pudo desactivar el usuario'));
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('username', {
        header: 'Usuario',
        cell: (info) => <span className="font-semibold text-slate-900">{info.getValue()}</span>,
      }),
      columnHelper.accessor('full_name', {
        header: 'Nombre completo',
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: (info) => <span className="text-slate-600">{info.getValue()}</span>,
      }),
      columnHelper.accessor('role', {
        header: 'Rol',
        cell: (info) => (
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
              info.getValue() === 'admin'
                ? 'bg-indigo-100 text-indigo-800'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('disabled', {
        header: 'Estado',
        cell: (info) => (
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              info.getValue()
                ? 'bg-red-100 text-red-700'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {info.getValue() ? 'Desactivado' : 'Activo'}
          </span>
        ),
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => {
          const u = row.original;
          const esSesionActual = usuarioActual?.id === u.id;
          return (
            <div className="flex justify-end gap-2">
              {u.disabled ? (
                <Button
                  variant="success"
                  className="px-3 py-1 text-xs"
                  disabled={activarMutation.isPending}
                  onClick={() => void handleActivar(u.id)}
                >
                  Activar
                </Button>
              ) : esSesionActual ? (
                <span className="text-xs text-slate-400 italic">Sesión actual</span>
              ) : (
                <Button
                  variant="danger"
                  className="px-3 py-1 text-xs"
                  disabled={desactivarMutation.isPending}
                  onClick={() => void handleDesactivar(u.id)}
                >
                  Desactivar
                </Button>
              )}
            </div>
          );
        },
      }),
    ],
    [usuarioActual?.id, activarMutation.isPending, desactivarMutation.isPending]
  );

  const table = useReactTable({
    data: usuarios,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Gestión de Usuarios</h1>
        <p className="text-sm text-slate-500">
          Activación y desactivación de cuentas registradas.
        </p>
      </div>

      {errorAccion && <EstadoError mensaje={errorAccion} />}

      {isLoading ? (
        <Card className="p-8 text-center text-sm text-slate-500 animate-pulse">
          Cargando usuarios...
        </Card>
      ) : isError ? (
        <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />
      ) : usuarios.length === 0 ? (
        <EstadoVacio
          titulo="Sin usuarios"
          descripcion="No se encontraron cuentas registradas en el sistema."
        />
      ) : (
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

          {table.getPageCount() > 1 && (
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <span>
                Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="px-3 py-1 text-xs"
                  disabled={!table.getCanPreviousPage()}
                  onClick={() => table.previousPage()}
                >
                  Anterior
                </Button>
                <Button
                  variant="secondary"
                  className="px-3 py-1 text-xs"
                  disabled={!table.getCanNextPage()}
                  onClick={() => table.nextPage()}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
