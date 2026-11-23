import { BadgeEstado } from '../../../shared/ui/BadgeEstado';
import { Modal } from '../../../shared/ui/Modal';
import type { Pedido } from '../types/pedido';

interface DetallePedidoModalProps {
  pedido: Pedido | null;
  onClose: () => void;
}

export function DetallePedidoModal({ pedido, onClose }: DetallePedidoModalProps) {
  return (
    <Modal
      isOpen={pedido !== null}
      title={pedido ? `Detalle del Pedido #${pedido.id}` : 'Detalle del Pedido'}
      onClose={onClose}
    >
      {pedido && (
        <div className="space-y-4 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
            <BadgeEstado estado={pedido.estado} />
            <span className="text-xs text-slate-500">
              {new Date(pedido.created_at).toLocaleString('es-AR')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-100">
            <div>
              <p className="text-xs text-slate-500">Dirección de entrega</p>
              <p className="font-semibold text-slate-900">{pedido.direccion_entrega}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Forma de pago</p>
              <p className="font-semibold text-slate-900">{pedido.forma_pago}</p>
            </div>
            {pedido.notas && (
              <div className="sm:col-span-2">
                <p className="text-xs text-slate-500">Notas</p>
                <p className="text-slate-700">{pedido.notas}</p>
              </div>
            )}
          </div>

          <div>
            <h3 className="font-bold text-slate-800 mb-2">Ítems del pedido</h3>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
              {pedido.items.map((item) => (
                <div
                  key={item.producto_id}
                  className="px-3.5 py-2.5 flex items-center justify-between gap-3 bg-white"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{item.nombre_producto}</p>
                    <p className="text-xs text-slate-500">
                      {item.cantidad} x ${' '}
                      {item.precio_unitario.toLocaleString('es-AR', {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <span className="font-bold text-slate-900">
                    $ {item.subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-base">
            <span className="font-bold text-slate-700">Total</span>
            <span className="font-extrabold text-emerald-700">
              $ {pedido.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      )}
    </Modal>
  );
}
