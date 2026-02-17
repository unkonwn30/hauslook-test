import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { CustomersSelect } from "../../../customers/ui/components/CustomersSelect";
import { ProductsSelect } from "../../../products/ui/components/ProductSelect";
import { useQuoteEditorStore } from "../../ui/store/quoteEditor.store";

export function QuoteEditorPage() {
  const { id } = useParams();

  const {
    quoteId,
    customerId,
    status,
    vatRate,
    lines,
    subtotal,
    vatAmount,
    total,
    loading,
    error,
    reset,
    load,
    setCustomer,
    setStatus,
    setVatRate,
    addLine,
    updateLine,
    removeLine,
    recalc,
    save,
    exportJson,
  } = useQuoteEditorStore();

  useEffect(() => {
    if (!id) return;
    if (id === "new") {
      reset();
      return;
    }
    load(id);
  }, [id, load, reset]);

  useEffect(() => {
    recalc();
  }, [lines.length, vatRate, recalc]);

  async function onExport() {
    const data = await exportJson();
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quote_${(quoteId ?? id ?? "new").slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/quotes"
            className="text-sm text-indigo-600 hover:underline"
          >
            ← Volver a la lista
          </Link>
          <h1 className="mt-2 text-2xl font-semibold">
            {id === "new"
              ? "Nuevo presupuesto"
              : `Presupuesto ${id?.slice(0, 8)}`}
          </h1>
        </div>

        <div className="flex gap-2">
          <button
            className="rounded-md border bg-white px-4 py-2 text-sm hover:bg-neutral-50"
            onClick={onExport}
            disabled={loading || !quoteId}
            title={!quoteId ? "Guarda primero para exportar" : ""}
          >
            Exportar
          </button>

          <button
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
            onClick={save}
            disabled={loading}
          >
            Guardar
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-md border bg-white p-4 space-y-3">
          <div>
            <div className="mb-2 text-sm font-medium">Cliente</div>
            <CustomersSelect value={customerId} onChange={setCustomer} />
          </div>

          <div>
            <div className="mb-2 text-sm font-medium">Estado</div>
            <select
              className="w-full rounded-md border bg-white px-3 py-2"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
            >
              <option value="draft">draft</option>
              <option value="sent">sent</option>
              <option value="accepted">accepted</option>
            </select>
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
        </div>

        <div className="md:col-span-2 rounded-md border bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold">Líneas</div>
            <button
              className="rounded-md border bg-white px-3 py-2 text-sm hover:bg-neutral-50"
              onClick={addLine}
            >
              Añadir línea
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-neutral-50 text-neutral-600">
                <tr>
                  <th className="px-3 py-2 text-left">Producto</th>
                  <th className="px-3 py-2 text-right">Cantidad</th>
                  <th className="px-3 py-2 text-right">Unit (€)</th>
                  <th className="px-3 py-2 text-right">Total</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>

              <tbody>
                {lines.map((l, i) => (
                  <tr key={l.id ?? i} className="border-b">
                    <td className="px-3 py-2 w-[45%]">
                      <ProductsSelect
                        value={l.product_id}
                        onChange={(productId, product) => {
                          // auto-fill unit_price desde base_price (histórico)
                          updateLine(i, {
                            product_id: productId,
                            unit_price: product
                              ? product.base_price
                              : l.unit_price,
                          });
                        }}
                      />
                    </td>

                    <td className="px-3 py-2 text-right">
                      <input
                        className="w-24 rounded-md border px-2 py-1 text-right"
                        type="number"
                        min={1}
                        value={l.quantity}
                        onChange={(e) =>
                          updateLine(i, { quantity: Number(e.target.value) })
                        }
                      />
                    </td>

                    <td className="px-3 py-2 text-right">
                      <input
                        className="w-28 rounded-md border px-2 py-1 text-right"
                        type="number"
                        step="0.01"
                        value={l.unit_price}
                        onChange={(e) =>
                          updateLine(i, { unit_price: Number(e.target.value) })
                        }
                      />
                    </td>

                    <td className="px-3 py-2 text-right font-medium">
                      {Number(l.line_total).toFixed(2)}
                    </td>

                    <td className="px-3 py-2 text-right">
                      <button
                        className="text-red-600 hover:underline"
                        onClick={() => removeLine(i)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}

                {lines.length === 0 && (
                  <tr>
                    <td className="px-3 py-6 text-neutral-500" colSpan={5}>
                      Añade una línea para empezar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-end">
            <div className="w-full max-w-sm rounded-md border bg-neutral-50 p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">Subtotal</span>
                <span className="font-medium">{subtotal.toFixed(2)}</span>
              </div>
              <div className="mt-2 flex justify-between">
                <span className="text-neutral-600">IVA</span>
                <span className="font-medium">{vatAmount.toFixed(2)}</span>
              </div>
              <div className="mt-2 flex justify-between border-t pt-2">
                <span className="text-neutral-600">Total</span>
                <span className="text-base font-semibold">
                  {total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 text-xs text-neutral-500">
            Nota: unit_price se guarda histórico por línea aunque cambie el
            base_price del producto.
          </div>
        </div>
      </div>
    </div>
  );
}
