import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  computeScores,
  deriveCategories,
  buildSummary,
  type Answers,
} from "./questionnaire";

const SaveSchema = z.object({
  answers: z.record(z.string(), z.number().int().min(0).max(3)),
});

export const saveAssessment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => SaveSchema.parse(input))
  .handler(async ({ data, context }) => {
    const scores = computeScores(data.answers as Answers);
    const categories = deriveCategories(scores);
    const summary = buildSummary(scores, categories);

    const { data: row, error } = await context.supabase
      .from("assessments")
      .insert({
        user_id: context.userId,
        ...scores,
        answers: data.answers,
        categories,
        summary,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return row;
  });

export const listAssessments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("assessments")
      .select("*")
      .order("taken_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const upsertCheckIn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ mood: z.number().int().min(1).max(5), note: z.string().max(500).optional() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const today = new Date().toISOString().slice(0, 10);
    const { error } = await context.supabase
      .from("daily_check_ins")
      .upsert(
        { user_id: context.userId, day: today, mood: data.mood, note: data.note ?? null },
        { onConflict: "user_id,day" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listCheckIns = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("daily_check_ins")
      .select("*")
      .order("day", { ascending: false })
      .limit(30);
    if (error) throw new Error(error.message);
    return data ?? [];
  });
