import { Button } from '../ui/Button';

interface EstadoErrorProps {
  mensaje: string;
  onReintentar?: () => void;
}

export function EstadoError({ mensaje, onReintentar }: EstadoErrorProps) {
  return (
    <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center space-y-3">
      <p className="text-sm font-semibold text-red-700">{mensaje}</p>
      {onReintentar && (
        <Button variant="secondary" onClick={onReintentar}>
          Reintentar
        </Button>
      )}
    </div>
  );
}
