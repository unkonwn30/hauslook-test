import type { QuoteLine } from "../domain/quoteLine";

export type QuoteLineDraft = QuoteLine & { id?: string };

export function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function calcLineTotal(quantity: number, unitPrice: number) {
  return round2(Number(quantity) * Number(unitPrice));
}

export function calcTotals(lines: QuoteLineDraft[], vatRate: number) {
  const subtotal = round2(
    lines.reduce((acc, l) => acc + Number(l.line_total || 0), 0),
  );
  const vatAmount = round2(subtotal * Number(vatRate));
  const total = round2(subtotal + vatAmount);
  return { subtotal, vatAmount, total };
}

export function validateQuote(input: {
  customerId: string | null;
  vatRate: number;
  lines: QuoteLineDraft[];
}) {
  if (!input.customerId) return "Selecciona un cliente";
  if (Number.isNaN(input.vatRate) || input.vatRate < 0 || input.vatRate > 1)
    return "IVA inválido (0..1)";

  const validLines = input.lines.filter((l) => l.product_id);
  if (validLines.length === 0) return "Añade al menos una línea con producto";

  for (const l of validLines) {
    if (l.quantity <= 0) return "La cantidad debe ser > 0";
    if (l.unit_price < 0) return "El precio unitario no puede ser negativo";
  }
  return null;
}

export function setProductNoDuplicates(params: {
  lines: QuoteLineDraft[];
  index: number;
  productId: string;
  unitPriceFromProduct: number;
}) {
  const { lines, index, productId, unitPriceFromProduct } = params;
  const next = [...lines];
  const current = next[index];
  const existingIndex = next.findIndex(
    (l, i) => i !== index && l.product_id === productId,
  );
  if (existingIndex >= 0) {
    const existing = next[existingIndex];
    const mergedQty = Number(existing.quantity) + Number(current.quantity || 1);
    existing.quantity = mergedQty;
    existing.line_total = calcLineTotal(existing.quantity, existing.unit_price);
    next.splice(index, 1);
    return { lines: next, merged: true, removedLineId: current.id };
  }

  current.product_id = productId;
  current.unit_price = unitPriceFromProduct;
  current.line_total = calcLineTotal(current.quantity, current.unit_price);

  return {
    lines: next,
    merged: false,
    removedLineId: undefined as string | undefined,
  };
}

export function serializeEditorSnapshot(input: {
  customerId: string | null;
  status: string;
  vatRate: number;
  lines: QuoteLineDraft[];
}) {
  const slim = {
    customerId: input.customerId,
    status: input.status,
    vatRate: round2(input.vatRate),
    lines: input.lines.map((l) => ({
      id: l.id ?? null,
      product_id: l.product_id,
      quantity: Number(l.quantity),
      unit_price: round2(Number(l.unit_price)),
    })),
  };
  return JSON.stringify(slim);
}
