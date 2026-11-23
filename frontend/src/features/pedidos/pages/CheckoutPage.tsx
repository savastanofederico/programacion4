import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { Link, useNavigate } from 'react-router-dom';
import { handleApiError } from '../../../shared/api/handleApiError';
import { EstadoVacio } from '../../../shared/components/EstadoVacio';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { Input } from '../../../shared/ui/Input';
import { useCartStore } from '../../../store/cartStore';
import { useCrearPedido } from '../hooks/usePedidos';
import type { FormaPago } from '../types/pedido';

export function CheckoutPage() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total());
  const vaciar = useCartStore((s) => s.vaciar);
  const crearPedidoMutation = useCrearPedido();
  const [errorServidor, setErrorServidor] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      direccion_entrega: '',
      forma_pago: 'EFECTIVO' as FormaPago,
      notas: '',
    },
    onSubmit: async ({ value }) => {
      setErrorServidor(null);
      try {
        await crearPedidoMutation.mutateAsync({
          items: items.map((item) => ({
            producto_id: item.producto_id,
            cantidad: item.cantidad,
          })),
          direccion_entrega: value.direccion_entrega.trim(),
          forma_pago: value.forma_pago,
          notas: value.notas.trim(),
        });
        vaciar();
        navigate('/mis-pedidos');
      } catch (err) {
        setErrorServidor(handleApiError(err, 'No se pudo crear el pedido'));
      }
    },
  });

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <EstadoVacio
          titulo="No hay productos para confirmar"
          descripcion="Agregá al menos un producto al carrito antes de pasar por el checkout."
          accion={
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-5 py-2.5 transition-colors"
            >
              Volver al catálogo
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
      <Card className="p-6 lg:col-span-3 space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Confirmar Pedido</h1>
          <p className="text-sm text-slate-500">
            Indicá la dirección de entrega y cómo vas a abonar.
          </p>
        </div>

        {errorServidor && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium">
            {errorServidor}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field
            name="direccion_entrega"
            validators={{
              onChange: ({ value }) => {
                const len = value.trim().length;
                if (len < 5 || len > 200) {
                  return 'La dirección debe tener entre 5 y 200 caracteres';
                }
                return undefined;
              },
            }}
          >
            {(field) => {
              const firstErr = field.state.meta.errors.find(Boolean);
              return (
                <Input
                  id="direccion_entrega"
                  label="Dirección de entrega *"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Ej: Av. Rivadavia 1450, Piso 3B"
                  error={firstErr ? String(firstErr) : undefined}
                />
              );
            }}
          </form.Field>

          <form.Field name="forma_pago">
            {(field) => (
              <div className="space-y-1">
                <label
                  htmlFor="forma_pago"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Forma de pago *
                </label>
                <select
                  id="forma_pago"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value as FormaPago)}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="EFECTIVO">Efectivo al recibir</option>
                  <option value="TRANSFERENCIA">Transferencia bancaria</option>
                </select>
              </div>
            )}
          </form.Field>

          <form.Field name="notas">
            {(field) => (
              <div className="space-y-1">
                <label htmlFor="notas" className="block text-sm font-semibold text-slate-700">
                  Notas adicionales (opcional)
                </label>
                <textarea
                  id="notas"
                  rows={3}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Ej: Sin cebolla, tocar timbre 3B..."
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            )}
          </form.Field>

          <div className="pt-2 flex flex-wrap justify-end gap-3">
            <Button variant="secondary" onClick={() => navigate('/carrito')}>
              Volver al carrito
            </Button>
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  variant="success"
                  disabled={!canSubmit || isSubmitting}
                >
                  {isSubmitting ? 'Procesando pedido...' : 'Confirmar y enviar pedido'}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </Card>

      <Card className="p-5 lg:col-span-2 space-y-4">
        <h2 className="font-bold text-slate-900 text-base border-b border-slate-200 pb-2">
          Resumen de compra
        </h2>
        <div className="space-y-2.5 text-sm">
          {items.map((item) => (
            <div key={item.producto_id} className="flex justify-between gap-2">
              <span className="text-slate-700">
                {item.cantidad}x {item.nombre}
              </span>
              <span className="font-semibold text-slate-900 whitespace-nowrap">
                ${' '}
                {(item.precio_unitario * item.cantidad).toLocaleString('es-AR', {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          ))}
        </div>
        <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-base">
          <span className="font-bold text-slate-700">Total</span>
          <span className="font-extrabold text-emerald-700">
            $ {total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </Card>
    </div>
  );
}
