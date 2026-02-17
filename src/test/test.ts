import { supabase } from "../shared/supabase/supabaseClient";

export async function testConnection() {
  const { data, error } = await supabase

    .from("customers")

    .select("*");

  console.log(data, error);
}
