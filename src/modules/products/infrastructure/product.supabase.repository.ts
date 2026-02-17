import { supabase } from "../../../shared/supabase/supabaseClient";
import type { Product, ProductRow } from "../domain/product";

const toProduct = (r: ProductRow): Product => ({
  id: r.id,
  name: r.name,
  base_price: Number(r.base_price),
  description: r.description,
  created_at: r.created_at,
});

export class ProductsSupabaseRepository {
  async findAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select("id,name,base_price,description,created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []).map((r) => toProduct(r as ProductRow));
  }

  async create(input: {
    name: string;
    base_price: number;
    description?: string | null;
  }): Promise<string> {
    const { data, error } = await supabase
      .from("products")
      .insert({
        name: input.name,
        base_price: input.base_price,
        description: input.description ?? null,
      })
      .select("id")
      .single();

    if (error) throw error;
    return (data as { id: string }).id;
  }
}
