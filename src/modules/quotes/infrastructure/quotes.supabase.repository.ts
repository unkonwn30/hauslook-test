import { supabase } from "../../../shared/supabase/supabaseClient";
import type { Quote } from "../domain/quote";
import type { QuoteLine } from "../domain/quoteLine";
import type { QuoteStatus } from "../domain/quoteStatus";

type QuoteRow = {
  id: string;
  customer_id: string;
  status: QuoteStatus;
  vat_rate: number;
  subtotal: number;
  vat_amount: number;
  total: number;
  created_at: string;
};

type QuoteLineRow = {
  id: string;
  quote_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  line_total: number;
};

const toQuote = (r: QuoteRow): Quote => ({
  ...r,
  vat_rate: Number(r.vat_rate),
  subtotal: Number(r.subtotal),
  vat_amount: Number(r.vat_amount),
  total: Number(r.total),
});

const toLine = (r: QuoteLineRow): QuoteLine => ({
  ...r,
  quantity: Number(r.quantity),
  unit_price: Number(r.unit_price),
  line_total: Number(r.line_total),
});

export class QuotesSupabaseRepository {
  async list(status?: QuoteStatus): Promise<Quote[]> {
    let q = supabase
      .from("quotes")
      .select(
        "id,customer_id,status,vat_rate,subtotal,vat_amount,total,created_at",
      )
      .order("created_at", { ascending: false });

    if (status) q = q.eq("status", status);

    const { data, error } = await q;
    if (error) throw error;

    return (data ?? []).map((r) => toQuote(r as QuoteRow));
  }

  async getById(id: string): Promise<Quote> {
    const { data, error } = await supabase
      .from("quotes")
      .select(
        "id,customer_id,status,vat_rate,subtotal,vat_amount,total,created_at",
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    return toQuote(data as QuoteRow);
  }

  async listLines(quoteId: string): Promise<QuoteLine[]> {
    const { data, error } = await supabase
      .from("quote_lines")
      .select("id,quote_id,product_id,quantity,unit_price,line_total")
      .eq("quote_id", quoteId);

    if (error) throw error;
    return (data ?? []).map((r) => toLine(r as QuoteLineRow));
  }

  async createQuote(input: {
    customer_id: string;
    vat_rate: number;
  }): Promise<string> {
    const { data, error } = await supabase
      .from("quotes")
      .insert({
        customer_id: input.customer_id,
        status: "draft",
        vat_rate: input.vat_rate,
        subtotal: 0,
        vat_amount: 0,
        total: 0,
      })
      .select("id")
      .single();

    if (error) throw error;
    return (data as { id: string }).id;
  }

  async updateQuote(
    id: string,
    patch: Partial<
      Pick<
        Quote,
        | "customer_id"
        | "status"
        | "vat_rate"
        | "subtotal"
        | "vat_amount"
        | "total"
      >
    >,
  ): Promise<void> {
    const { error } = await supabase.from("quotes").update(patch).eq("id", id);
    if (error) throw error;
  }

  async upsertLine(
    line: Omit<QuoteLine, "id"> & { id?: string },
  ): Promise<void> {
    if (line.id) {
      const { error } = await supabase
        .from("quote_lines")
        .update({
          product_id: line.product_id,
          quantity: line.quantity,
          unit_price: line.unit_price,
          line_total: line.line_total,
        })
        .eq("id", line.id);
      if (error) throw error;
      return;
    }

    const { error } = await supabase.from("quote_lines").insert({
      quote_id: line.quote_id,
      product_id: line.product_id,
      quantity: line.quantity,
      unit_price: line.unit_price,
      line_total: line.line_total,
    });
    if (error) throw error;
  }

  async deleteLine(lineId: string): Promise<void> {
    const { error } = await supabase
      .from("quote_lines")
      .delete()
      .eq("id", lineId);
    if (error) throw error;
  }
}
