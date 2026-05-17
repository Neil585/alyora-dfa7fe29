import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const listPractitioners = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        city: z.string().optional(),
        specialty: z.string().optional(),
        modality: z.string().optional(),
        maxPrice: z.number().int().optional(),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data }) => {
    let q = supabaseAdmin.from("practitioners").select("*").order("years_experience", { ascending: false });
    if (data.city) q = q.eq("city", data.city);
    if (data.specialty) q = q.contains("specialties", [data.specialty]);
    if (data.modality) q = q.contains("modalities", [data.modality]);
    if (data.maxPrice) q = q.lte("price_eur", data.maxPrice);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const getPractitioner = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { data: row, error } = await supabaseAdmin
      .from("practitioners")
      .select("*")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    return row;
  });
