import { useEffect, useMemo, useState } from "react";
import { getErrorMessage } from "../../../../shared/lib/errors";
import { ListCustomersUseCase } from "../../application/listCustomers.usecase";
import type { Customer } from "../../domain/customer";
import { CustomersSupabaseRepository } from "../../infrastructure/customers.supabase.repository";

type Props = {
  value: string | null;
  onChange: (customerId: string) => void;
};

export function CustomersSelect({ value, onChange }: Props) {
  const [items, setItems] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const useCase = useMemo(() => {
    const repo = new CustomersSupabaseRepository();
    return new ListCustomersUseCase(repo);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await useCase.execute();
        setItems(data);
      } catch (e: unknown) {
        setError(getErrorMessage(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [useCase]);

  if (loading) return <div>Cargando clientes...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <select
      className="border rounded px-3 py-2"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="" disabled>
        Selecciona cliente
      </option>

      {items.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name} {c.email ? `(${c.email})` : ""}
        </option>
      ))}
    </select>
  );
}
