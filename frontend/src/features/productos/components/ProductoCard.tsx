import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { useCartStore } from '../../../store/cartStore';
import type { Producto } from '../types/producto';

interface ProductoCardProps {
  producto: Producto;
}

export function ProductoCard({ producto }: ProductoCardProps) {
  const agregar = useCartStore((s) => s.agregar);
  const itemEnCarrito = useCartStore((s) =>
    s.items.find((i) => i.producto_id === producto.id)
  );

  const cantidadEnCarrito = itemEnCarrito?.cantidad ?? 0;
  const puedeAgregar =
    producto.disponible && producto.stock > 0 && cantidadEnCarrito < producto.stock;

  const precioFormateado = producto.precio_base.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <Card className="overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        <div className="h-48 bg-slate-100 relative overflow-hidden">
          {producto.imagen_url ? (
            <img
              src={producto.imagen_url}
              alt={producto.nombre}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
              Sin imagen
            </div>
          )}

          {producto.categoria && (
            <span className="absolute top-3 left-3 bg-slate-900/85 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              {producto.categoria.nombre}
            </span>
          )}
        </div>

        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-bold text-slate-900 leading-snug">
              {producto.nombre}
            </h3>
            <span className="text-base font-extrabold text-emerald-700 whitespace-nowrap">
              $ {precioFormateado}
            </span>
          </div>

          <p className="text-xs text-slate-600 line-clamp-2 min-h-[2rem]">
            {producto.descripcion || 'Sin descripción.'}
          </p>

          <div className="flex items-center justify-between pt-1 text-xs">
            <span
              className={`font-semibold ${
                producto.stock > 0 ? 'text-slate-600' : 'text-red-600'
              }`}
            >
              {producto.stock > 0 ? `Stock disponible: ${producto.stock}` : 'Sin stock'}
            </span>
            {!producto.disponible && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                No disponible
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 pt-0">
        <Button
          className="w-full"
          disabled={!puedeAgregar}
          onClick={() =>
            agregar({
              id: producto.id,
              nombre: producto.nombre,
              precio_base: producto.precio_base,
              imagen_url: producto.imagen_url,
              stock: producto.stock,
            })
          }
        >
          {!producto.disponible
            ? 'Pausado'
            : producto.stock <= 0
              ? 'Sin stock'
              : cantidadEnCarrito >= producto.stock
                ? `Máximo en carrito (${cantidadEnCarrito})`
                : cantidadEnCarrito > 0
                  ? `Agregar al carrito (${cantidadEnCarrito})`
                  : 'Agregar al carrito'}
        </Button>
      </div>
    </Card>
  );
}
