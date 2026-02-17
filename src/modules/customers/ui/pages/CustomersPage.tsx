import { useEffect, useMemo, useState } from "react";
import type { Customer } from "../../domain/customer";
import { CustomersSupabaseRepository } from "../../infrastructure/customers.supabase.repository";
import { NewCustomerDrawer } from "../components/NewCustomerDrawer";

export function CustomersPage() {
  const repo = useMemo(() => new CustomersSupabaseRepository(), []);
  const [items, setItems] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await repo.findAll();
      setItems(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error loading customers");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Clientes</h1>
          <p className="text-sm text-neutral-600">Listado y creación rápida.</p>
        </div>
        <NewCustomerDrawer onCreated={load} />
      </div>

      <div className="rounded-md border bg-white">
        {loading && (
          <div className="p-4 text-sm text-neutral-600">Cargando...</div>
        )}
        {error && <div className="p-4 text-sm text-red-600">{error}</div>}

        {!loading && !error && (
          <table className="w-full text-sm">
            <thead className="border-b bg-neutral-50 text-neutral-600">
              <tr>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Creado</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="border-b hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-neutral-700">
                    {c.email ?? "-"}
                  </td>
                  <td className="px-4 py-3">
                    {new Date(c.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}

              {items.length === 0 && (
                <tr>
                  <td className="px-4 py-8 text-neutral-500" colSpan={3}>
                    No hay clientes
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
