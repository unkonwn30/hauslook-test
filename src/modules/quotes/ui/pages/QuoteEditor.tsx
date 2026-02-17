import { useParams } from "react-router-dom";

export function QuoteEditorPage() {
  const { id } = useParams();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">
        {id === "new" ? "Nuevo presupuesto" : `Editar presupuesto: ${id}`}
      </h1>

      <div className="rounded-md border bg-white p-4 text-sm text-neutral-600">
        Aquí irá: cliente, estado, IVA, líneas, resumen, guardar, exportar.
      </div>
    </div>
  );
}
