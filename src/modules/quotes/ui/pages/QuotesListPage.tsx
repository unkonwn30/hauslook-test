import { Link } from "react-router-dom";

export function QuotesListPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Presupuestos</h1>
        <Link
          to="/quotes/new"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm text-white"
        >
          Nuevo presupuesto
        </Link>
      </div>

      <div className="rounded-md border bg-white p-4 text-sm text-neutral-600">
        Aquí irá la tabla + filtro por estado (draft/sent/accepted).
      </div>
    </div>
  );
}
