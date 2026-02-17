import { supabase } from "../../../shared/supabase/supabaseClient";
import type { Customer } from "../domain/customer";
import type { CustomersRepository } from "../domain/customers.repository";

export class CustomersSupabaseRepository implements CustomersRepository {
  async create(input: {
    name: string;
    email?: string | null;
  }): Promise<string> {
    const { data, error } = await supabase
      .from("customers")
      .insert({ name: input.name, email: input.email ?? null })
      .select("id")
      .single();

    if (error) throw error;
    return (data as { id: string }).id;
  }

  async findAll(): Promise<Customer[]> {
    const { data, error } = await supabase
      .from("customers")
      .select("id,name,email,created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data ?? [];
  }

  async findById(id: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from("customers")
      .select("id,name,email,created_at")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data ?? null;
  }
}
