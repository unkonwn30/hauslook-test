import { useState } from "react";
import { Button } from "../../../../shared/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../../../shared/ui/sheet";
import { ProductsSupabaseRepository } from "../../infrastructure/product.supabase.repository";

export function NewProductDrawer({ onCreated }: { onCreated?: () => void }) {
  const repo = new ProductsSupabaseRepository();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [basePrice, setBasePrice] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    if (!name.trim() || basePrice <= 0) return;
    setLoading(true);
    setError(null);
    try {
      await repo.create({
        name: name.trim(),
        base_price: basePrice,
        description: description.trim() || null,
      });
      setOpen(false);
      setName("");
      setBasePrice(0);
      setDescription("");
      onCreated?.();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error creating product");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="bg-black/75 text-white hover:bg-black/95">
          Nuevo producto
        </Button>
      </SheetTrigger>

      <SheetContent>
        <SheetHeader>
          <SheetTitle>Nuevo producto</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div>
            <div className="mb-2 text-sm font-medium">Nombre</div>
            <input
              className="w-full rounded-md border px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Pintura pared"
            />
          </div>

          <div>
            <div className="mb-2 text-sm font-medium">Precio base</div>
            <input
              className="w-full rounded-md border px-3 py-2"
              type="number"
              step="0.01"
              value={basePrice}
              onChange={(e) => setBasePrice(Number(e.target.value))}
              placeholder="100.00"
            />
          </div>

          <div>
            <div className="mb-2 text-sm font-medium">
              Descripción (opcional)
            </div>
            <textarea
              className="w-full rounded-md border px-3 py-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <Button
            className="w-full bg-indigo-600 hover:bg-indigo-700"
            disabled={!name.trim() || basePrice <= 0 || loading}
            onClick={create}
          >
            Crear
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
