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
import { useCategorias } from '../../categorias/hooks/useCategorias';
import type { Categoria } from '../../categorias/types/categoria';
import {
  useActualizarProducto,
  useActualizarStock,
  useCrearProducto,
  useEliminarProducto,
  useProductos,
} from '../hooks/useProductos';
import type { Producto } from '../types/producto';

const columnHelper = createColumnHelper<Producto>();

interface ProductoModalFormProps {
  productoEditar: Producto | null;
  categorias: Categoria[];
  onCerrar: () => void;
}

function ProductoModalForm({
  productoEditar,
  categorias,
  onCerrar,
}: ProductoModalFormProps) {
  const crearMutation = useCrearProducto();
  const actualizarMutation = useActualizarProducto();
  const [errorForm, setErrorForm] = useState<string | null>(null);

  const defaultCategoriaId = productoEditar?.categoria_id ?? categorias[0]?.id ?? 1;

  const form = useForm({
    defaultValues: {
      nombre: productoEditar?.nombre ?? '',
      descripcion: productoEditar?.descripcion ?? '',
      precio_base: String(productoEditar?.precio_base ?? ''),
      imagen_url: productoEditar?.imagen_url ?? '',
      stock: String(productoEditar?.stock ?? 0),
      disponible: productoEditar?.disponible ?? true,
      categoria_id: String(defaultCategoriaId),
    },
    onSubmit: async ({ value }) => {
      setErrorForm(null);
      try {
        const payload = {
          nombre: value.nombre.trim(),
          descripcion: value.descripcion.trim(),
          precio_base: Number(value.precio_base),
          imagen_url: value.imagen_url.trim(),
          stock: Number(value.stock),
          disponible: value.disponible,
          categoria_id: Number(value.categoria_id),
        };
        if (productoEditar) {
          await actualizarMutation.mutateAsync({ id: productoEditar.id, payload });
        } else {
          await crearMutation.mutateAsync(payload);
        }
        onCerrar();
      } catch (err) {
        setErrorForm(handleApiError(err, 'No se pudo guardar el producto'));
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
          onChange: ({ value }) =>
            value.trim().length < 2 ? 'El nombre debe tener al menos 2 caracteres' : undefined,
        }}
      >
        {(field) => {
          const firstErr = field.state.meta.errors.find(Boolean);
          return (
            <Input
              id="prod-nombre"
              label="Nombre *"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Ej: Pizza Fugazzeta"
              error={firstErr ? String(firstErr) : undefined}
            />
          );
        }}
      </form.Field>

      <form.Field name="descripcion">
        {(field) => (
          <div className="space-y-1">
            <label htmlFor="prod-desc" className="block text-sm font-semibold text-slate-700">
              Descripción
            </label>
            <textarea
              id="prod-desc"
              rows={2}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        )}
      </form.Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <form.Field
          name="categoria_id"
          validators={{
            onChange: ({ value }) => (!value ? 'Seleccioná una categoría' : undefined),
          }}
        >
          {(field) => {
            const firstErr = field.state.meta.errors.find(Boolean);
            return (
              <div className="space-y-1">
                <label htmlFor="prod-cat" className="block text-sm font-semibold text-slate-700">
                  Categoría *
                </label>
                <select
                  id="prod-cat"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
                {firstErr && <p className="text-xs font-medium text-red-600">{String(firstErr)}</p>}
              </div>
            );
          }}
        </form.Field>

        <form.Field
          name="precio_base"
          validators={{
            onChange: ({ value }) => {
              const num = Number(value);
              if (value === '' || Number.isNaN(num) || num < 0) {
                return 'Ingresá un precio mayor o igual a 0';
              }
              return undefined;
            },
          }}
        >
          {(field) => {
            const firstErr = field.state.meta.errors.find(Boolean);
            return (
              <Input
                id="prod-precio"
                type="number"
                min="0"
                step="0.01"
                label="Precio base ($) *"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="0.00"
                error={firstErr ? String(firstErr) : undefined}
              />
            );
          }}
        </form.Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        <form.Field
          name="stock"
          validators={{
            onChange: ({ value }) => {
              const num = Number(value);
              if (value === '' || Number.isNaN(num) || num < 0 || !Number.isInteger(num)) {
                return 'Debe ser un entero mayor o igual a 0';
              }
              return undefined;
            },
          }}
        >
          {(field) => {
            const firstErr = field.state.meta.errors.find(Boolean);
            return (
              <Input
                id="prod-stock"
                type="number"
                min="0"
                step="1"
                label="Stock *"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={firstErr ? String(firstErr) : undefined}
              />
            );
          }}
        </form.Field>

        <form.Field name="disponible">
          {(field) => (
            <label className="inline-flex items-center gap-2.5 pt-5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={field.state.value}
                onChange={(e) => field.handleChange(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
              />
              <span className="text-sm font-medium text-slate-800">Disponible para venta</span>
            </label>
          )}
        </form.Field>
      </div>

      <form.Field name="imagen_url">
        {(field) => (
          <Input
            id="prod-img"
            type="url"
            label="URL de imagen"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            placeholder="https://..."
          />
        )}
      </form.Field>

      <div className="pt-2 flex justify-end gap-3">
        <Button variant="secondary" onClick={onCerrar}>
          Cancelar
        </Button>
        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar producto'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}

interface StockModalFormProps {
  producto: Producto;
  onCerrar: () => void;
}

function StockModalForm({ producto, onCerrar }: StockModalFormProps) {
  const stockMutation = useActualizarStock();
  const [errorForm, setErrorForm] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      stock: String(producto.stock),
      disponible: producto.disponible,
    },
    onSubmit: async ({ value }) => {
      setErrorForm(null);
      try {
        await stockMutation.mutateAsync({
          id: producto.id,
          payload: {
            stock: Number(value.stock),
            disponible: value.disponible,
          },
        });
        onCerrar();
      } catch (err) {
        setErrorForm(handleApiError(err, 'No se pudo actualizar el stock'));
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
      <p className="text-sm text-slate-600">
        Actualizando existencias y disponibilidad de{' '}
        <span className="font-bold text-slate-900">{producto.nombre}</span>.
      </p>

      {errorForm && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium">
          {errorForm}
        </div>
      )}

      <form.Field
        name="stock"
        validators={{
          onChange: ({ value }) => {
            const num = Number(value);
            if (value === '' || Number.isNaN(num) || num < 0 || !Number.isInteger(num)) {
              return 'Ingresá un número entero mayor o igual a 0';
            }
            return undefined;
          },
        }}
      >
        {(field) => {
          const firstErr = field.state.meta.errors.find(Boolean);
          return (
            <Input
              id="stock-nuevo"
              type="number"
              min="0"
              step="1"
              label="Stock actual *"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              error={firstErr ? String(firstErr) : undefined}
            />
          );
        }}
      </form.Field>

      <form.Field name="disponible">
        {(field) => (
          <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={field.state.value}
              onChange={(e) => field.handleChange(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
            />
            <span className="text-sm font-medium text-slate-800">Disponible para venta</span>
          </label>
        )}
      </form.Field>

      <div className="pt-2 flex justify-end gap-3">
        <Button variant="secondary" onClick={onCerrar}>
          Cancelar
        </Button>
        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? 'Actualizando...' : 'Guardar stock'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}

export function AdminProductosPage() {
  const { data: categorias = [] } = useCategorias();
  const { data, isLoading, isError, error, refetch } = useProductos({ skip: 0, limit: 100 });
  const eliminarMutation = useEliminarProducto();

  const [modalProductoAbierto, setModalProductoAbierto] = useState(false);
  const [productoEditar, setProductoEditar] = useState<Producto | null>(null);
  const [productoStock, setProductoStock] = useState<Producto | null>(null);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  const productos = data?.items ?? [];

  const abrirCrear = () => {
    setProductoEditar(null);
    setModalProductoAbierto(true);
  };

  const abrirEditar = (prod: Producto) => {
    setProductoEditar(prod);
    setModalProductoAbierto(true);
  };

  const handleEliminar = async (id: number) => {
    setErrorAccion(null);
    try {
      await eliminarMutation.mutateAsync(id);
    } catch (err) {
      setErrorAccion(handleApiError(err, 'No se pudo eliminar el producto'));
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('nombre', {
        header: 'Producto',
        cell: ({ row }) => (
          <div>
            <p className="font-semibold text-slate-900">{row.original.nombre}</p>
            <p className="text-xs text-slate-500">
              {row.original.categoria?.nombre ?? `Cat #${row.original.categoria_id}`}
            </p>
          </div>
        ),
      }),
      columnHelper.accessor('precio_base', {
        header: 'Precio',
        cell: (info) => (
          <span className="font-semibold text-slate-800">
            $ {info.getValue().toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </span>
        ),
      }),
      columnHelper.accessor('stock', {
        header: 'Stock',
        cell: (info) => (
          <span
            className={`font-bold ${info.getValue() > 0 ? 'text-slate-800' : 'text-red-600'}`}
          >
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('disponible', {
        header: 'Disponibilidad',
        cell: (info) => (
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              info.getValue()
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {info.getValue() ? 'Disponible' : 'Pausado'}
          </span>
        ),
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => (
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              variant="secondary"
              className="px-2.5 py-1 text-xs"
              onClick={() => setProductoStock(row.original)}
            >
              Stock
            </Button>
            <Button
              variant="secondary"
              className="px-2.5 py-1 text-xs"
              onClick={() => abrirEditar(row.original)}
            >
              Editar
            </Button>
            <Button
              variant="danger"
              className="px-2.5 py-1 text-xs"
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
    data: productos,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestión de Productos</h1>
          <p className="text-sm text-slate-500">
            ABM de catálogo, control de stock y disponibilidad.
          </p>
        </div>
        <Button onClick={abrirCrear} disabled={categorias.length === 0}>
          + Nuevo producto
        </Button>
      </div>

      {errorAccion && <EstadoError mensaje={errorAccion} />}

      {isLoading ? (
        <Card className="p-8 text-center text-sm text-slate-500 animate-pulse">
          Cargando productos...
        </Card>
      ) : isError ? (
        <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />
      ) : productos.length === 0 ? (
        <EstadoVacio
          titulo="No hay productos activos"
          descripcion="Creá el primer producto para mostrarlo en el catálogo."
          accion={<Button onClick={abrirCrear}>+ Crear producto</Button>}
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
        isOpen={modalProductoAbierto}
        title={productoEditar ? 'Editar producto' : 'Nuevo producto'}
        onClose={() => setModalProductoAbierto(false)}
      >
        <ProductoModalForm
          key={productoEditar ? productoEditar.id : 'nuevo'}
          productoEditar={productoEditar}
          categorias={categorias}
          onCerrar={() => setModalProductoAbierto(false)}
        />
      </Modal>

      <Modal
        isOpen={productoStock !== null}
        title="Actualizar stock y disponibilidad"
        onClose={() => setProductoStock(null)}
      >
        {productoStock && (
          <StockModalForm
            key={productoStock.id}
            producto={productoStock}
            onCerrar={() => setProductoStock(null)}
          />
        )}
      </Modal>
    </div>
  );
}
