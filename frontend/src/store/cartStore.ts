import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  imagen_url: string;
  stock_max: number;
}

interface ProductoParaCarrito {
  id: number;
  nombre: string;
  precio_base: number;
  imagen_url: string;
  stock: number;
}

interface CartState {
  items: CartItem[];
  agregar: (producto: ProductoParaCarrito) => void;
  quitar: (producto_id: number) => void;
  cambiarCantidad: (producto_id: number, cantidad: number) => void;
  vaciar: () => void;
  total: () => number;
  cantidadTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      agregar: (producto) => {
        set((state) => {
          const existente = state.items.find((i) => i.producto_id === producto.id);
          if (existente) {
            const nuevaCantidad = Math.min(existente.cantidad + 1, producto.stock);
            return {
              items: state.items.map((i) =>
                i.producto_id === producto.id
                  ? { ...i, cantidad: nuevaCantidad, stock_max: producto.stock }
                  : i
              ),
            };
          }
          if (producto.stock <= 0) return state;
          return {
            items: [
              ...state.items,
              {
                producto_id: producto.id,
                nombre: producto.nombre,
                precio_unitario: producto.precio_base,
                cantidad: 1,
                imagen_url: producto.imagen_url,
                stock_max: producto.stock,
              },
            ],
          };
        });
      },

      quitar: (producto_id) => {
        set((state) => ({
          items: state.items.filter((i) => i.producto_id !== producto_id),
        }));
      },

      cambiarCantidad: (producto_id, cantidad) => {
        if (cantidad <= 0) {
          get().quitar(producto_id);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.producto_id === producto_id
              ? { ...i, cantidad: Math.min(cantidad, i.stock_max) }
              : i
          ),
        }));
      },

      vaciar: () => set({ items: [] }),

      total: () =>
        get().items.reduce((acc, item) => acc + item.precio_unitario * item.cantidad, 0),

      cantidadTotal: () => get().items.reduce((acc, item) => acc + item.cantidad, 0),
    }),
    {
      name: 'foodstore-cart',
    }
  )
);
