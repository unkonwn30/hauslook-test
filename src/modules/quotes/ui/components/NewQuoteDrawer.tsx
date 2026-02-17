import { useState } from "react";
import { useTranslation } from "react-i18next";

import { CustomersSelect } from "../../../customers/ui/components/CustomersSelect";
import { QuotesSupabaseRepository } from "../../../quotes/infrastructure/quotes.supabase.repository";

import { Button } from "../../../../shared/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../../../shared/ui/sheet";

export function NewQuoteDrawer({ onCreated }: { onCreated?: () => void }) {
  const { t } = useTranslation();
  const repo = new QuotesSupabaseRepository();

  const [open, setOpen] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [vatRate, setVatRate] = useState(0.21);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    if (!customerId) return;
    setLoading(true);
    setError(null);
    try {
      await repo.createQuote({ customer_id: customerId, vat_rate: vatRate });
      setOpen(false);
      setCustomerId(null);
      setVatRate(0.21);
      onCreated?.();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error creating quote");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          {t("newQuote")}
        </Button>
      </SheetTrigger>

      <SheetContent>
        <SheetHeader>
          <SheetTitle>{t("newQuote")}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div>
            <div className="mb-2 text-sm font-medium">{t("customer")}</div>
            <CustomersSelect value={customerId} onChange={setCustomerId} />
          </div>

          <div>
            <div className="mb-2 text-sm font-medium">IVA (vat_rate)</div>
            <input
              className="w-full rounded-md border px-3 py-2"
              type="number"
              step="0.01"
              value={vatRate}
              onChange={(e) => setVatRate(Number(e.target.value))}
            />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <Button
            className="w-full bg-indigo-600 hover:bg-indigo-700"
            disabled={!customerId || loading}
            onClick={create}
          >
            Crear
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
