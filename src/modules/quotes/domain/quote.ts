import type { QuoteStatus } from "./quoteStatus";

export type Quote = {
  id: string;
  customer_id: string;
  status: QuoteStatus;
  vat_rate: number;
  subtotal: number;
  vat_amount: number;
  total: number;
  created_at: string;
};

export type QuoteRow = {
  id: string;
  customer_id: string;
  status: QuoteStatus;
  vat_rate: number;
  subtotal: number;
  vat_amount: number;
  total: number;
  created_at: string;
};
