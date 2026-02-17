import { create } from "zustand";
import { getErrorMessage } from "../../../../shared/lib/errors";
import {
  type QuoteLineDraft,
  calcLineTotal,
  calcTotals,
  serializeEditorSnapshot,
  setProductNoDuplicates,
  validateQuote,
} from "../../application/quoteEditor.logic";
import type { QuoteLine } from "../../domain/quoteLine";
import type { QuoteStatus } from "../../domain/quoteStatus";
import { QuotesSupabaseRepository } from "../../infrastructure/quotes.supabase.repository";

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
  deletedLineIds: string[];
  baseline: string;
  isDirty: boolean;
  isValid: boolean;
  canSave: boolean;
};

type Actions = {
  reset(): void;
  load(quoteId: string): Promise<void>;

  setCustomer(customerId: string): void;
  setVatRate(v: number): void;
  setStatus(s: QuoteStatus): void;

  addLine(): void;

  setLineProduct(
    index: number,
    productId: string,
    unitPriceFromProduct: number,
  ): void;
  updateLine(
    index: number,
    patch: Partial<Pick<QuoteLine, "quantity" | "unit_price">>,
  ): void;

  incQty(index: number): void;
  decQty(index: number): void;

  removeLine(index: number): void;

  recalc(): void;
  recomputeMeta(): void;

  save(): Promise<string>;
  exportJson(): Promise<{ quote: unknown; lines: unknown[] } | null>;
};

const repo = new QuotesSupabaseRepository();

function computeMeta(
  st: Pick<
    State,
    "customerId" | "status" | "vatRate" | "lines" | "baseline" | "loading"
  >,
) {
  const current = serializeEditorSnapshot({
    customerId: st.customerId,
    status: st.status,
    vatRate: st.vatRate,
    lines: st.lines,
  });
  const isDirty = current !== st.baseline;
  const validationError = validateQuote({
    customerId: st.customerId,
    vatRate: st.vatRate,
    lines: st.lines,
  });
  const isValid = validationError === null;
  const canSave = !st.loading && isDirty && isValid;
  return { isDirty, isValid, canSave };
}

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
  deletedLineIds: [],
  baseline: "",
  isDirty: false,
  isValid: false,
  canSave: false,

  reset() {
    const baseline = serializeEditorSnapshot({
      customerId: null,
      status: "draft",
      vatRate: 0.21,
      lines: [],
    });

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
      deletedLineIds: [],
      baseline,
      ...computeMeta({
        customerId: null,
        status: "draft",
        vatRate: 0.21,
        lines: [],
        baseline,
        loading: false,
      }),
    });
  },

  async load(quoteId: string) {
    set({ loading: true, error: null });
    try {
      const q = await repo.getById(quoteId);
      const lines = await repo.listLines(quoteId);

      const vatRate = Number(q.vat_rate);
      const totals = calcTotals(lines, vatRate);

      const baseline = serializeEditorSnapshot({
        customerId: q.customer_id,
        status: q.status,
        vatRate,
        lines,
      });

      set({
        quoteId,
        customerId: q.customer_id,
        status: q.status,
        vatRate,
        lines,
        subtotal: totals.subtotal,
        vatAmount: totals.vatAmount,
        total: totals.total,
        deletedLineIds: [],
        baseline,
        ...computeMeta({
          customerId: q.customer_id,
          status: q.status,
          vatRate,
          lines,
          baseline,
          loading: false,
        }),
      });
    } catch (e: unknown) {
      set({ error: getErrorMessage(e) });
    } finally {
      set({ loading: false });
      get().recomputeMeta();
    }
  },

  setCustomer(customerId: string) {
    set({ customerId });
    get().recomputeMeta();
  },

  setVatRate(v: number) {
    set({ vatRate: v });
    get().recalc();
    get().recomputeMeta();
  },

  setStatus(s: QuoteStatus) {
    set({ status: s });
    get().recomputeMeta();
  },

  addLine() {
    const st = get();
    set({
      lines: [
        ...st.lines,
        {
          id: "",
          quote_id: st.quoteId ?? "",
          product_id: "",
          quantity: 1,
          unit_price: 0,
          line_total: 0,
        },
      ],
    });
    get().recalc();
    get().recomputeMeta();
  },

  setLineProduct(index, productId, unitPriceFromProduct) {
    const st = get();
    const { lines, removedLineId } = setProductNoDuplicates({
      lines: st.lines,
      index,
      productId,
      unitPriceFromProduct,
    });

    const deletedLineIds = removedLineId
      ? [...st.deletedLineIds, removedLineId]
      : st.deletedLineIds;

    set({ lines, deletedLineIds });
    get().recalc();
    get().recomputeMeta();
  },

  updateLine(index, patch) {
    set((st) => {
      const lines = [...st.lines];
      const curr = lines[index];
      if (!curr) return st;

      const next: QuoteLineDraft = { ...curr, ...patch };

      if (next.quantity <= 0) next.quantity = 1;
      next.line_total = calcLineTotal(
        Number(next.quantity),
        Number(next.unit_price),
      );

      lines[index] = next;
      return { ...st, lines };
    });
    get().recalc();
    get().recomputeMeta();
  },

  incQty(index: number) {
    const st = get();
    const l = st.lines[index];
    if (!l) return;
    get().updateLine(index, { quantity: Number(l.quantity) + 1 });
  },

  decQty(index: number) {
    const st = get();
    const l = st.lines[index];
    if (!l) return;
    const next = Number(l.quantity) - 1;
    get().updateLine(index, { quantity: next <= 0 ? 1 : next });
  },

  removeLine(index) {
    set((st) => {
      const removed = st.lines[index];
      const lines = st.lines.filter((_, i) => i !== index);
      const deletedLineIds = removed?.id
        ? [...st.deletedLineIds, removed.id]
        : st.deletedLineIds;
      return { ...st, lines, deletedLineIds };
    });
    get().recalc();
    get().recomputeMeta();
  },

  recalc() {
    const st = get();
    const totals = calcTotals(st.lines, st.vatRate);
    set({
      subtotal: totals.subtotal,
      vatAmount: totals.vatAmount,
      total: totals.total,
    });
  },

  recomputeMeta() {
    const st = get();
    set(computeMeta(st));
  },

  async save() {
    const st = get();
    const validationError = validateQuote({
      customerId: st.customerId,
      vatRate: st.vatRate,
      lines: st.lines,
    });
    if (validationError) {
      set({ error: validationError });
      get().recomputeMeta();
      throw new Error(validationError);
    }

    set({ loading: true, error: null });
    try {
      let quoteId = st.quoteId;
      if (!quoteId) {
        quoteId = await repo.createQuote({
          customer_id: st.customerId!,
          vat_rate: st.vatRate,
        });
        set({ quoteId });
      }

      await repo.updateQuote(quoteId!, {
        customer_id: st.customerId!,
        status: st.status,
        vat_rate: st.vatRate,
        subtotal: st.subtotal,
        vat_amount: st.vatAmount,
        total: st.total,
      });

      for (const id of st.deletedLineIds) {
        await repo.deleteLine(id);
      }

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

      const baseline = serializeEditorSnapshot({
        customerId: st.customerId,
        status: st.status,
        vatRate: st.vatRate,
        lines: st.lines,
      });

      set({ deletedLineIds: [], baseline });
      get().recomputeMeta();

      return quoteId!;
    } catch (e: unknown) {
      const msg = getErrorMessage(e);
      set({ error: msg });
      get().recomputeMeta();
      throw e;
    } finally {
      set({ loading: false });
      get().recomputeMeta();
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
