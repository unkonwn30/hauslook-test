export type Product = {
  id: string;
  name: string;
  base_price: number;
  description?: string | null;
  created_at: string;
};

export type ProductRow = {
  id: string;
  name: string;
  base_price: number;
  description: string | null;
  created_at: string;
};
