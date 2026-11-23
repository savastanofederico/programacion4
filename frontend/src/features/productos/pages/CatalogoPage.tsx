import { useState } from 'react';
import { handleApiError } from '../../../shared/api/handleApiError';
import { EstadoError } from '../../../shared/components/EstadoError';
import { EstadoVacio } from '../../../shared/components/EstadoVacio';
import { Paginacion } from '../../../shared/components/Paginacion';
import { Skeleton } from '../../../shared/components/Skeleton';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { useCategorias } from '../../categorias/hooks/useCategorias';
import { ProductoCard } from '../components/ProductoCard';
import { useProductos } from '../hooks/useProductos';

const LIMITE_POR_PAGINA = 6;

export function CatalogoPage() {
  const [search, setSearch] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined);
  const [pagina, setPagina] = useState(0);

  const { data: categorias = [] } = useCategorias();
  const { data, isLoading, isError, error, refetch } = useProductos({
    skip: pagina * LIMITE_POR_PAGINA,
    limit: LIMITE_POR_PAGINA,
    search: search.trim() || undefined,
    categoria_id: categoriaId,
  });

  const productos = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPaginas = Math.ceil(total / LIMITE_POR_PAGINA);

  const limpiarFiltros = () => {
    setSearch('');
    setCategoriaId(undefined);
    setPagina(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Catálogo de Comidas</h1>
          <p className="text-sm text-slate-500">
            Elegí tus platos favoritos y armá tu pedido al instante.
          </p>
        </div>
        <span className="text-xs font-medium text-slate-500">
          {total} {total === 1 ? 'producto encontrado' : 'productos encontrados'}
        </span>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2 space-y-1">
            <label htmlFor="busqueda" className="block text-xs font-semibold text-slate-600">
              Buscar por nombre
            </label>
            <input
              id="busqueda"
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPagina(0);
              }}
              placeholder="Ej: Pizza, Hamburguesa, Empanadas..."
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="filtro-cat" className="block text-xs font-semibold text-slate-600">
              Filtrar por categoría
            </label>
            <select
              id="filtro-cat"
              value={categoriaId ?? ''}
              onChange={(e) => {
                const val = e.target.value;
                setCategoriaId(val ? Number(val) : undefined);
                setPagina(0);
              }}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Todas las categorías</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <Skeleton cantidad={6} />
      ) : isError ? (
        <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />
      ) : productos.length === 0 ? (
        <EstadoVacio
          titulo="No encontramos productos"
          descripcion="Probá cambiando el término de búsqueda o seleccionando otra categoría."
          accion={
            (search || categoriaId !== undefined) && (
              <Button variant="secondary" onClick={limpiarFiltros}>
                Limpiar filtros
              </Button>
            )
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {productos.map((producto) => (
              <ProductoCard key={producto.id} producto={producto} />
            ))}
          </div>

          <Paginacion
            pagina={pagina}
            totalPaginas={totalPaginas}
            onCambiarPagina={setPagina}
          />
        </>
      )}
    </div>
  );
}
