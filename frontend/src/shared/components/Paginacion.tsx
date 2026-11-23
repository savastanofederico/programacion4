import { Button } from '../ui/Button';

interface PaginacionProps {
  pagina: number;
  totalPaginas: number;
  onCambiarPagina: (nuevaPagina: number) => void;
}

export function Paginacion({ pagina, totalPaginas, onCambiarPagina }: PaginacionProps) {
  if (totalPaginas <= 1) return null;

  return (
    <div className="mt-6 flex items-center justify-center gap-3">
      <Button
        variant="secondary"
        disabled={pagina <= 0}
        onClick={() => onCambiarPagina(pagina - 1)}
      >
        ← Anterior
      </Button>
      <span className="text-sm font-medium text-slate-600">
        Página {pagina + 1} de {totalPaginas}
      </span>
      <Button
        variant="secondary"
        disabled={pagina + 1 >= totalPaginas}
        onClick={() => onCambiarPagina(pagina + 1)}
      >
        Siguiente →
      </Button>
    </div>
  );
}
