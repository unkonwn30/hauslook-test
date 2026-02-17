import { supabase } from "../lib/supabase/supabase";

export async function testConnection() {
  const { data, error } = await supabase

    .from("customers")

    .select("*");

  console.log(data, error);
}
