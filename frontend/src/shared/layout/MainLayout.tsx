import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>
      <footer className="bg-slate-900 text-slate-400 py-4 text-center text-xs border-t border-slate-800">
        Food Store — Trabajo Práctico Integrador · Programación 4 (UTN)
      </footer>
    </div>
  );
}
