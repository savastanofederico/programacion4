import { Card } from '../../../shared/ui/Card';

interface TarjetaResumenProps {
  titulo: string;
  valor: string;
  acento: string;
  colorTexto: string;
}

export function TarjetaResumen({ titulo, valor, acento, colorTexto }: TarjetaResumenProps) {
  return (
    <Card className={`p-6 border-l-4 ${acento}`}>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{titulo}</p>
      <p className={`text-3xl font-extrabold mt-2 ${colorTexto}`}>{valor}</p>
    </Card>
  );
}
