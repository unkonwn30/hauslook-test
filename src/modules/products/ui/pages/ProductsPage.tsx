import { useEffect, useMemo, useState } from "react";
import type { Product } from "../../domain/product";
import { ProductsSupabaseRepository } from "../../infrastructure/product.supabase.repository";
import { NewProductDrawer } from "../components/NewProductDrawer";

export function ProductsPage() {
  const repo = useMemo(() => new ProductsSupabaseRepository(), []);
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await repo.findAll();
      setItems(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error loading products");
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
          <h1 className="text-2xl font-semibold">Productos</h1>
          <p className="text-sm text-neutral-600">Listado y creación rápida.</p>
        </div>
        <NewProductDrawer onCreated={load} />
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
                <th className="px-4 py-3 text-right">Precio base</th>
                <th className="px-4 py-3 text-left">Creado</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-b hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-right">
                    {p.base_price.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    {new Date(p.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}

              {items.length === 0 && (
                <tr>
                  <td className="px-4 py-8 text-neutral-500" colSpan={3}>
                    No hay productos
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
