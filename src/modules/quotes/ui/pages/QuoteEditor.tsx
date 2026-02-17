import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import type { QuoteStatus } from "../../domain/quoteStatus";

import { toast } from "../../../../shared/ui/toast";
import { CustomersSelect } from "../../../customers/ui/components/CustomersSelect";
import { ProductsSelect } from "../../../products/ui/components/ProductSelect";
import { exportQuoteJsonDownload } from "../../application/exportQuoteJson.download";
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

    canSave,
    isDirty,
    isValid,

    reset,
    load,
    setCustomer,
    setStatus,
    setVatRate,

    addLine,
    setLineProduct,
    updateLine,
    removeLine,
    incQty,
    decQty,

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

  async function onExport() {
    await exportQuoteJsonDownload({
      exportFn: exportJson,
      filename: `quote_${(quoteId ?? id ?? "new").slice(0, 8)}.json`,
    });
  }

  function onSave() {
    return toast.promise(save(), {
      loading: "Guardando…",
      success: "Presupuesto guardado",
      error: "No se pudo guardar",
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/quotes"
            className="text-sm text-black/85 hover:text-black/80"
          >
            ← Volver
          </Link>
          <h1 className="mt-2 text-2xl font-semibold">
            {id === "new"
              ? "Nuevo presupuesto"
              : `Presupuesto ${id?.slice(0, 8)}`}
          </h1>
          <div className="mt-1 text-xs text-white/50">
            {!isValid
              ? "Completa lo requerido."
              : !isDirty
                ? "Sin cambios."
                : "Cambios pendientes."}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90 disabled:opacity-50"
            onClick={onExport}
            disabled={loading || !quoteId}
            title={!quoteId ? "Guarda primero para exportar" : ""}
          >
            Exportar
          </button>

          <button
            className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90 disabled:opacity-50"
            onClick={onSave}
            disabled={!canSave}
            title={
              !isValid
                ? "Completa lo requerido"
                : !isDirty
                  ? "No hay cambios"
                  : ""
            }
          >
            Guardar
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-md border border-black/10 bg-gray-100/50 p-4 space-y-3">
          <div>
            <div className="mb-2 text-sm font-medium text-black/85">
              Cliente
            </div>
            <CustomersSelect value={customerId} onChange={setCustomer} />
          </div>

          <div>
            <div className="mb-2 text-sm font-medium text-black/85">Estado</div>
            <select
              className="w-full rounded-md border border-white/10 bg-white px-3 py-2 text-black"
              value={status}
              onChange={(e) => setStatus(e.target.value as QuoteStatus)}
            >
              <option value="draft">draft</option>
              <option value="sent">sent</option>
              <option value="accepted">accepted</option>
            </select>
          </div>

          <div>
            <div className="mb-2 text-sm font-medium text-black/85s">
              IVA (vat_rate)
            </div>
            <input
              className="w-full rounded-md border border-white/10 bg-white px-3 py-2 text-blakc"
              type="number"
              step="0.01"
              value={vatRate}
              onChange={(e) => setVatRate(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="md:col-span-2 rounded-md border  border-black/10 bg-gray-100/50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold">Líneas</div>
            <button
              className="rounded-md border border-black/10 bg-gray-100 px-3 py-2 text-sm text-black hover:bg-gray-200"
              onClick={addLine}
              type="button"
            >
              Añadir línea
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-black/10 text-black/85">
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
                  <tr key={l.id ?? i} className="border-b border-black/10">
                    <td className="px-3 py-2 w-[45%]">
                      <ProductsSelect
                        value={l.product_id}
                        onChange={(productId, product) => {
                          setLineProduct(
                            i,
                            productId,
                            product ? product.base_price : l.unit_price,
                          );
                        }}
                      />
                    </td>

                    <td className="px-3 py-2 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          className="h-8 w-8 rounded-md border border-white/10 bg-white/5 text-black hover:bg-white/10"
                          onClick={() => decQty(i)}
                          type="button"
                        >
                          −
                        </button>

                        <input
                          className="w-20 rounded-md border border-white/10 bg-black/75 px-2 py-1 text-right text-white"
                          type="number"
                          min={1}
                          value={l.quantity}
                          onChange={(e) =>
                            updateLine(i, { quantity: Number(e.target.value) })
                          }
                        />

                        <button
                          className="h-8 w-8 rounded-md border border-white/10 bg-white/5 text-black hover:bg-white/10"
                          onClick={() => incQty(i)}
                          type="button"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    <td className="px-3 py-2 text-right">
                      <input
                        className="w-28 rounded-md border border-white/10 bg-black/75 px-2 py-1 text-right text-white"
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
                        className="text-red-500 hover:text-red-700"
                        onClick={() => removeLine(i)}
                        type="button"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}

                {lines.length === 0 && (
                  <tr>
                    <td className="px-3 py-6 text-white/40" colSpan={5}>
                      Añade una línea para empezar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-end">
            <div className="w-full max-w-sm rounded-md border border-white/10 bg-black/75 p-4 text-sm">
              <div className="flex justify-between text-white/70">
                <span>Subtotal</span>
                <span className="font-medium text-white">
                  {subtotal.toFixed(2)}
                </span>
              </div>
              <div className="mt-2 flex justify-between text-white/70">
                <span>IVA</span>
                <span className="font-medium text-white">
                  {vatAmount.toFixed(2)}
                </span>
              </div>
              <div className="mt-2 flex justify-between border-t border-white/10 pt-2 text-white/70">
                <span>Total</span>
                <span className="text-base font-semibold text-white">
                  {total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 text-xs text-white/40">
            unit_price se guarda histórico por línea aunque cambie el base_price
            del producto.
          </div>
        </div>
      </div>
    </div>
  );
}
