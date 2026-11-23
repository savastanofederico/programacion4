import { useMemo, useState } from 'react';
import { useForm } from '@tanstack/react-form';
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
import { Input } from '../../../shared/ui/Input';
import { Modal } from '../../../shared/ui/Modal';
import {
  useActualizarCategoria,
  useCategorias,
  useCrearCategoria,
  useEliminarCategoria,
} from '../hooks/useCategorias';
import type { Categoria } from '../types/categoria';

const columnHelper = createColumnHelper<Categoria>();

interface CategoriaModalFormProps {
  categoriaEditar: Categoria | null;
  onCerrar: () => void;
}

function CategoriaModalForm({ categoriaEditar, onCerrar }: CategoriaModalFormProps) {
  const crearMutation = useCrearCategoria();
  const actualizarMutation = useActualizarCategoria();
  const [errorForm, setErrorForm] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      nombre: categoriaEditar?.nombre ?? '',
      descripcion: categoriaEditar?.descripcion ?? '',
    },
    onSubmit: async ({ value }) => {
      setErrorForm(null);
      try {
        const payload = {
          nombre: value.nombre.trim(),
          descripcion: value.descripcion.trim(),
        };
        if (categoriaEditar) {
          await actualizarMutation.mutateAsync({ id: categoriaEditar.id, payload });
        } else {
          await crearMutation.mutateAsync(payload);
        }
        onCerrar();
      } catch (err) {
        setErrorForm(handleApiError(err, 'No se pudo guardar la categoría'));
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
      className="space-y-4"
    >
      {errorForm && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium">
          {errorForm}
        </div>
      )}

      <form.Field
        name="nombre"
        validators={{
          onChange: ({ value }) => {
            const len = value.trim().length;
            if (len < 2 || len > 100) return 'Debe tener entre 2 y 100 caracteres';
            return undefined;
          },
        }}
      >
        {(field) => {
          const firstErr = field.state.meta.errors.find(Boolean);
          return (
            <Input
              id="cat-nombre"
              label="Nombre *"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Ej: Postres"
              error={firstErr ? String(firstErr) : undefined}
            />
          );
        }}
      </form.Field>

      <form.Field name="descripcion">
        {(field) => (
          <div className="space-y-1">
            <label htmlFor="cat-desc" className="block text-sm font-semibold text-slate-700">
              Descripción
            </label>
            <textarea
              id="cat-desc"
              rows={3}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Descripción opcional de la categoría"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        )}
      </form.Field>

      <div className="pt-2 flex justify-end gap-3">
        <Button variant="secondary" onClick={onCerrar}>
          Cancelar
        </Button>
        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}

export function AdminCategoriasPage() {
  const { data: categorias = [], isLoading, isError, error, refetch } = useCategorias();
  const eliminarMutation = useEliminarCategoria();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [categoriaEditar, setCategoriaEditar] = useState<Categoria | null>(null);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  const abrirCrear = () => {
    setCategoriaEditar(null);
    setModalAbierto(true);
  };

  const abrirEditar = (cat: Categoria) => {
    setCategoriaEditar(cat);
    setModalAbierto(true);
  };

  const handleEliminar = async (id: number) => {
    setErrorAccion(null);
    try {
      await eliminarMutation.mutateAsync(id);
    } catch (err) {
      setErrorAccion(handleApiError(err, 'No se pudo eliminar la categoría'));
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'ID',
        cell: (info) => <span className="font-mono text-slate-500">#{info.getValue()}</span>,
      }),
      columnHelper.accessor('nombre', {
        header: 'Nombre',
        cell: (info) => <span className="font-semibold text-slate-900">{info.getValue()}</span>,
      }),
      columnHelper.accessor('descripcion', {
        header: 'Descripción',
        cell: (info) => <span className="text-slate-600">{info.getValue() || '—'}</span>,
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              className="px-3 py-1 text-xs"
              onClick={() => abrirEditar(row.original)}
            >
              Editar
            </Button>
            <Button
              variant="danger"
              className="px-3 py-1 text-xs"
              disabled={eliminarMutation.isPending}
              onClick={() => void handleEliminar(row.original.id)}
            >
              Eliminar
            </Button>
          </div>
        ),
      }),
    ],
    [eliminarMutation.isPending]
  );

  const table = useReactTable({
    data: categorias,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestión de Categorías</h1>
          <p className="text-sm text-slate-500">ABM de rubros activos del catálogo.</p>
        </div>
        <Button onClick={abrirCrear}>+ Nueva categoría</Button>
      </div>

      {errorAccion && <EstadoError mensaje={errorAccion} />}

      {isLoading ? (
        <Card className="p-8 text-center text-sm text-slate-500 animate-pulse">
          Cargando categorías...
        </Card>
      ) : isError ? (
        <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />
      ) : categorias.length === 0 ? (
        <EstadoVacio
          titulo="No hay categorías activas"
          descripcion="Creá la primera categoría para poder asociar productos."
          accion={<Button onClick={abrirCrear}>+ Crear categoría</Button>}
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

      <Modal
        isOpen={modalAbierto}
        title={categoriaEditar ? 'Editar categoría' : 'Nueva categoría'}
        onClose={() => setModalAbierto(false)}
      >
        <CategoriaModalForm
          key={categoriaEditar ? categoriaEditar.id : 'nueva'}
          categoriaEditar={categoriaEditar}
          onCerrar={() => setModalAbierto(false)}
        />
      </Modal>
    </div>
  );
}
