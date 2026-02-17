import { useState } from "react";
import { Button } from "../../../../shared/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../../../shared/ui/sheet";
import { CustomersSupabaseRepository } from "../../infrastructure/customers.supabase.repository";

export function NewCustomerDrawer({ onCreated }: { onCreated?: () => void }) {
  const repo = new CustomersSupabaseRepository();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await repo.create({ name: name.trim(), email: email.trim() || null });
      setOpen(false);
      setName("");
      setEmail("");
      onCreated?.();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error creating customer");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="bg-black/75 text-white hover:bg-black/95">
          Nuevo cliente
        </Button>
      </SheetTrigger>

      <SheetContent>
        <SheetHeader>
          <SheetTitle>Nuevo cliente</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div>
            <div className="mb-2 text-sm font-medium">Nombre</div>
            <input
              className="w-full rounded-md border px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Cliente S.L."
            />
          </div>

          <div>
            <div className="mb-2 text-sm font-medium">Email (opcional)</div>
            <input
              className="w-full rounded-md border px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="cliente@correo.com"
            />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <Button
            className="w-full bg-indigo-600 hover:bg-indigo-700"
            disabled={!name.trim() || loading}
            onClick={create}
          >
            Crear
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
