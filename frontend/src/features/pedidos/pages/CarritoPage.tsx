import { Link, useNavigate } from 'react-router-dom';
import { EstadoVacio } from '../../../shared/components/EstadoVacio';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { useCartStore } from '../../../store/cartStore';

export function CarritoPage() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const quitar = useCartStore((s) => s.quitar);
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad);
  const vaciar = useCartStore((s) => s.vaciar);
  const total = useCartStore((s) => s.total());

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto">
        <EstadoVacio
          titulo="Tu carrito está vacío"
          descripcion="Recorré el catálogo y agregá los productos que quieras pedir."
          accion={
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-5 py-2.5 transition-colors"
            >
              Ir al catálogo
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mi Carrito</h1>
          <p className="text-sm text-slate-500">Revisá las cantidades antes de confirmar.</p>
        </div>
        <Button variant="secondary" onClick={vaciar}>
          Vaciar carrito
        </Button>
      </div>

      <Card className="divide-y divide-slate-100 overflow-hidden">
        {items.map((item) => {
          const subtotal = item.precio_unitario * item.cantidad;
          return (
            <div
              key={item.producto_id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                {item.imagen_url ? (
                  <img
                    src={item.imagen_url}
                    alt={item.nombre}
                    className="w-16 h-16 rounded-lg object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                    Sin foto
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-slate-900">{item.nombre}</h3>
                  <p className="text-xs text-slate-500">
                    Unitario: ${' '}
                    {item.precio_unitario.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4">
                <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
                    className="px-3 py-1.5 text-sm font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    −
                  </button>
                  <span className="px-3 py-1.5 text-sm font-semibold text-slate-900 min-w-[2.25rem] text-center">
                    {item.cantidad}
                  </span>
                  <button
                    type="button"
                    disabled={item.cantidad >= item.stock_max}
                    onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
                    className="px-3 py-1.5 text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>

                <span className="font-bold text-slate-900 min-w-[6.5rem] text-right">
                  $ {subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </span>

                <Button
                  variant="ghost"
                  className="text-red-600 hover:bg-red-50 px-2.5 py-1.5 text-xs"
                  onClick={() => quitar(item.producto_id)}
                >
                  Quitar
                </Button>
              </div>
            </div>
          );
        })}
      </Card>

      <Card className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
            Total a pagar
          </p>
          <p className="text-2xl font-extrabold text-emerald-700">
            $ {total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold px-4 py-2.5 transition-colors"
          >
            Seguir comprando
          </Link>
          <Button onClick={() => navigate('/checkout')} className="px-6 py-2.5">
            Confirmar pedido →
          </Button>
        </div>
      </Card>
    </div>
  );
}
