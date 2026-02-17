import { useEffect, useMemo, useState } from "react";
import type { Product } from "../../domain/product";
import { ProductsSupabaseRepository } from "../../infrastructure/product.supabase.repository";

export function ProductsSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (productId: string, product?: Product) => void;
}) {
  const repo = useMemo(() => new ProductsSupabaseRepository(), []);
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await repo.findAll();
      setItems(data);
      setLoading(false);
    })();
  }, [repo]);

  return (
    <select
      className="w-full rounded-md border bg-white px-3 py-2"
      value={value}
      onChange={(e) => {
        const id = e.target.value;
        const p = items.find((x) => x.id === id);
        onChange(id, p);
      }}
      disabled={loading}
    >
      <option value="" disabled>
        {loading ? "Cargando..." : "Selecciona producto"}
      </option>
      {items.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name} — {p.base_price.toFixed(2)}
        </option>
      ))}
    </select>
  );
}
