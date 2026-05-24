"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfileAction(data: { full_name: string; phone: string; country: string; address: string; avatar_url: string; }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("No autenticado");

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: data.full_name,
        phone: data.phone,
        country: data.country,
        // TODO: Agregar estas columnas ('address', 'avatar_url') en la DB en Supabase.
        // address: data.address,
        // avatar_url: data.avatar_url,
        updated_at: new Date().toISOString()
      })
      .eq("id", user.id);

    if (error) throw error;

    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Error al actualizar perfil." };
  }
}
