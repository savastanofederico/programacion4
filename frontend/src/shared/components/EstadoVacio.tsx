import type { ReactNode } from 'react';

interface EstadoVacioProps {
  titulo: string;
  descripcion: string;
  accion?: ReactNode;
}

export function EstadoVacio({ titulo, descripcion, accion }: EstadoVacioProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-10 text-center space-y-3">
      <h3 className="text-lg font-bold text-slate-800">{titulo}</h3>
      <p className="text-sm text-slate-500 max-w-md mx-auto">{descripcion}</p>
      {accion && <div className="pt-2">{accion}</div>}
    </div>
  );
}
