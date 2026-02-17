import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import type { Quote } from "../../domain/quote";
import type { QuoteStatus } from "../../domain/quoteStatus";
import { QuotesSupabaseRepository } from "../../infrastructure/quotes.supabase.repository";
import { NewQuoteDrawer } from "../../ui/components/NewQuoteDrawer";

const statusOptions: Array<{ label: string; value?: QuoteStatus }> = [
  { label: "Todos", value: undefined },
  { label: "draft", value: "draft" },
  { label: "sent", value: "sent" },
  { label: "accepted", value: "accepted" },
];

export function QuotesListPage() {
  const repo = useMemo(() => new QuotesSupabaseRepository(), []);

  const [status, setStatus] = useState<QuoteStatus | undefined>(undefined);
  const [items, setItems] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await repo.list(status);
      setItems(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error loading quotes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Presupuestos</h1>
          <p className="text-sm text-neutral-600">
            Listado con filtro por estado y acceso al detalle.
          </p>
        </div>

        <NewQuoteDrawer onCreated={load} />
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-neutral-600">Estado</span>
        <select
          className="rounded-md border bg-white px-3 py-2 text-sm"
          value={status ?? ""}
          onChange={(e) =>
            setStatus((e.target.value || undefined) as QuoteStatus | undefined)
          }
        >
          {statusOptions.map((s) => (
            <option key={s.label} value={s.value ?? ""}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-md border bg-white">
        {loading && (
          <div className="p-4 text-sm text-neutral-600">Cargando...</div>
        )}

        {error && (
          <div className="p-4 text-sm text-red-600">
            {error}
            <button className="ml-3 underline" onClick={load}>
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && (
          <table className="w-full text-sm">
            <thead className="border-b bg-neutral-50 text-neutral-600">
              <tr>
                <th className="px-4 py-3 text-left">Nº</th>
                <th className="px-4 py-3 text-left">Cliente</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-left">Creado</th>
              </tr>
            </thead>

            <tbody>
              {items.map((q) => (
                <tr key={q.id} className="border-b hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <Link
                      className="text-lime-700 hover:underline"
                      to={`/quotes/${q.id}`}
                    >
                      {q.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-neutral-700">
                    {q.customer_id.slice(0, 8)}
                  </td>
                  <td className="px-4 py-3">{q.status}</td>
                  <td className="px-4 py-3 text-right">
                    {Number(q.total).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    {new Date(q.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}

              {items.length === 0 && (
                <tr>
                  <td className="px-4 py-8 text-neutral-500" colSpan={5}>
                    No hay presupuestos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
