import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { Button } from '../ui/Button';

export function Navbar() {
  const navigate = useNavigate();
  const usuario = useAuthStore((s) => s.usuario);
  const logout = useAuthStore((s) => s.logout);
  const itemsCarrito = useCartStore((s) => s.items);
  const totalItems = itemsCarrito.reduce((acc, item) => acc + item.cantidad, 0);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const linkStyle = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${
      isActive ? 'text-amber-400' : 'text-slate-300 hover:text-white'
    }`;

  return (
    <header className="bg-slate-900 text-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center text-base">
            FS
          </span>
          <span className="text-lg font-bold tracking-tight">Food Store</span>
        </Link>

        <nav className="flex flex-wrap items-center gap-4 sm:gap-6">
          <NavLink to="/" end className={linkStyle}>
            Catálogo
          </NavLink>

          <NavLink to="/carrito" className={linkStyle}>
            Carrito
            {totalItems > 0 && (
              <span className="ml-1.5 bg-amber-500 text-slate-950 text-xs font-bold px-2 py-0.5 rounded-full">
                {totalItems}
              </span>
            )}
          </NavLink>

          {usuario && (
            <NavLink to="/mis-pedidos" className={linkStyle}>
              Mis pedidos
            </NavLink>
          )}

          {usuario?.role === 'admin' && (
            <div className="flex flex-wrap items-center gap-3 pl-3 border-l border-slate-700">
              <NavLink to="/admin/resumen" className={linkStyle}>
                Resumen
              </NavLink>
              <NavLink to="/admin/categorias" className={linkStyle}>
                Categorías
              </NavLink>
              <NavLink to="/admin/productos" className={linkStyle}>
                Productos
              </NavLink>
              <NavLink to="/admin/pedidos" className={linkStyle}>
                Pedidos
              </NavLink>
              <NavLink to="/admin/usuarios" className={linkStyle}>
                Usuarios
              </NavLink>
            </div>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {usuario ? (
            <>
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-white leading-tight">
                  {usuario.full_name}
                </p>
                <p className="text-[11px] uppercase tracking-wider text-amber-400">
                  {usuario.role}
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={() => void handleLogout()}
                className="text-xs px-3 py-1.5"
              >
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Ingresar
              </Link>
              <Link
                to="/register"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-semibold px-3.5 py-1.5 rounded-lg transition-colors"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
