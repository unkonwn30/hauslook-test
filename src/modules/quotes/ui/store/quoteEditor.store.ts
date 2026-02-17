import { create } from "zustand";
import { getErrorMessage } from "../../../../shared/lib/errors";
import type { QuoteLine } from "../../domain/quoteLine";
import type { QuoteStatus } from "../../domain/quoteStatus";
import { QuotesSupabaseRepository } from "../../infrastructure/quotes.supabase.repository";

type QuoteLineDraft = QuoteLine & { id?: string };

type State = {
  quoteId: string | null;
  customerId: string | null;
  status: QuoteStatus;
  vatRate: number;
  lines: QuoteLineDraft[];
  subtotal: number;
  vatAmount: number;
  total: number;
  loading: boolean;
  error: string | null;
};

type Actions = {
  reset(): void;
  load(quoteId: string): Promise<void>;
  setCustomer(customerId: string): void;
  setVatRate(v: number): void;
  setStatus(s: QuoteStatus): void;
  addLine(): void;
  updateLine(
    index: number,
    patch: Partial<Pick<QuoteLine, "product_id" | "quantity" | "unit_price">>,
  ): void;
  removeLine(index: number): void;
  recalc(): void;
  save(): Promise<void>;
  exportJson(): Promise<{ quote: unknown; lines: unknown[] } | null>;
};

const repo = new QuotesSupabaseRepository();

const round2 = (n: number) => Math.round(n * 100) / 100;

export const useQuoteEditorStore = create<State & Actions>((set, get) => ({
  quoteId: null,
  customerId: null,
  status: "draft",
  vatRate: 0.21,
  lines: [],
  subtotal: 0,
  vatAmount: 0,
  total: 0,
  loading: false,
  error: null,

  reset() {
    set({
      quoteId: null,
      customerId: null,
      status: "draft",
      vatRate: 0.21,
      lines: [],
      subtotal: 0,
      vatAmount: 0,
      total: 0,
      loading: false,
      error: null,
    });
  },

  async load(quoteId: string) {
    set({ loading: true, error: null });
    try {
      const q = await repo.getById(quoteId);
      const lines = await repo.listLines(quoteId);

      set({
        quoteId,
        customerId: q.customer_id,
        status: q.status,
        vatRate: Number(q.vat_rate),
        lines,
        subtotal: Number(q.subtotal),
        vatAmount: Number(q.vat_amount),
        total: Number(q.total),
      });
    } catch (e: unknown) {
      set({ error: getErrorMessage(e) });
    } finally {
      set({ loading: false });
    }
  },

  setCustomer(customerId: string) {
    set({ customerId });
  },

  setVatRate(v: number) {
    set({ vatRate: v });
    get().recalc();
  },

  setStatus(s: QuoteStatus) {
    set({ status: s });
  },

  addLine() {
    const st = get();
    set({
      lines: [
        ...st.lines,
        {
          id: undefined,
          quote_id: st.quoteId ?? "",
          product_id: "",
          quantity: 1,
          unit_price: 0,
          line_total: 0,
        },
      ],
    });
  },

  updateLine(index, patch) {
    set((st) => {
      const lines = [...st.lines];
      const curr = lines[index];
      const next: QuoteLineDraft = { ...curr, ...patch };

      if (next.quantity <= 0) next.quantity = 1;
      next.line_total = round2(Number(next.quantity) * Number(next.unit_price));

      lines[index] = next;
      return { lines };
    });
    get().recalc();
  },

  removeLine(index) {
    set((st) => ({ lines: st.lines.filter((_, i) => i !== index) }));
    get().recalc();
  },

  recalc() {
    const st = get();
    const subtotal = round2(
      st.lines.reduce((acc, l) => acc + Number(l.line_total || 0), 0),
    );
    const vatAmount = round2(subtotal * Number(st.vatRate));
    const total = round2(subtotal + vatAmount);
    set({ subtotal, vatAmount, total });
  },

  async save() {
    const st = get();
    if (!st.customerId) {
      set({ error: "Selecciona un cliente" });
      return;
    }

    set({ loading: true, error: null });
    try {
      let quoteId = st.quoteId;
      if (!quoteId) {
        quoteId = await repo.createQuote({
          customer_id: st.customerId,
          vat_rate: st.vatRate,
        });
        set({ quoteId });
      }

      await repo.updateQuote(quoteId!, {
        customer_id: st.customerId,
        status: st.status,
        vat_rate: st.vatRate,
        subtotal: st.subtotal,
        vat_amount: st.vatAmount,
        total: st.total,
      });

      for (const line of st.lines) {
        if (!line.product_id) continue;
        await repo.upsertLine({
          id: line.id,
          quote_id: quoteId!,
          product_id: line.product_id,
          quantity: Number(line.quantity),
          unit_price: Number(line.unit_price),
          line_total: Number(line.line_total),
        });
      }
    } catch (e: unknown) {
      set({ error: getErrorMessage(e) });
    } finally {
      set({ loading: false });
    }
  },

  async exportJson() {
    const st = get();
    if (!st.quoteId) return null;
    const quote = await repo.getById(st.quoteId);
    const lines = await repo.listLines(st.quoteId);
    return { quote, lines };
  },
}));
