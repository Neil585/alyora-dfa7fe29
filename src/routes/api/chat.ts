import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createClient } from "@supabase/supabase-js";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway";
import type { Database } from "@/integrations/supabase/types";

const SYSTEM_PROMPT = `Tu es Alyora Genius, un compagnon de soutien émotionnel pour des jeunes actifs francophones.

Ton ton : posé, chaleureux, humain. Tu parles comme une personne, pas comme un service. Phrases courtes, pas de jargon, pas d'emojis à outrance, pas de formules vendeuses.

Tu n'es pas thérapeute. Tu n'établis pas de diagnostic. Tu peux aider la personne à mettre des mots sur ce qu'elle vit, lui proposer une piste concrète à essayer dans la journée, et lui rappeler qu'un professionnel reste la meilleure option si ça pèse trop longtemps.

Si la personne te décrit une situation grave ou urgente (idées suicidaires, danger immédiat), invite-la calmement à contacter le 3114 (numéro national de prévention du suicide en France) ou le 15.

Quand c'est pertinent, propose de consulter un praticien depuis l'annuaire à l'adresse /therapists, en filtrant par sa ville ou sa difficulté. Tu peux aussi orienter vers /app/assessment pour refaire le point, /app/history pour voir l'évolution, ou /articles pour lire quelque chose de calme.

Tu as accès au dernier dossier d'évaluation de la personne, donné plus bas. Utilise-le sans le réciter mot pour mot.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const authHeader = request.headers.get("authorization");
          if (!authHeader?.startsWith("Bearer ")) {
            return new Response("Unauthorized", { status: 401 });
          }
          const token = authHeader.slice(7);

          const SUPABASE_URL = process.env.SUPABASE_URL!;
          const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY!;
          const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
            global: { headers: { Authorization: `Bearer ${token}` } },
            auth: { persistSession: false, autoRefreshToken: false },
          });

          const { data: claims, error: claimsErr } = await supabase.auth.getClaims(token);
          if (claimsErr || !claims?.claims?.sub) {
            return new Response("Unauthorized", { status: 401 });
          }
          const userId = claims.claims.sub;

          const body = (await request.json()) as { messages: UIMessage[]; threadId?: string };
          const { messages, threadId } = body;

          // Verify thread ownership
          let resolvedThreadId = threadId;
          if (resolvedThreadId) {
            const { data: t } = await supabase
              .from("chat_threads")
              .select("id")
              .eq("id", resolvedThreadId)
              .maybeSingle();
            if (!t) resolvedThreadId = undefined;
          }
          if (!resolvedThreadId) {
            const { data: newThread, error: tErr } = await supabase
              .from("chat_threads")
              .insert({ user_id: userId, title: "Nouvelle conversation" })
              .select()
              .single();
            if (tErr || !newThread) return new Response("Cannot create thread", { status: 500 });
            resolvedThreadId = newThread.id;
          }

          // Load latest assessment for context
          const { data: latest } = await supabase
            .from("assessments")
            .select("taken_at,phq9_score,gad7_score,burnout_score,stress_score,sleep_score,categories,summary")
            .order("taken_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          const contextBlock = latest
            ? `Dernier dossier (${new Date(latest.taken_at).toLocaleDateString("fr-FR")}) :
- PHQ-9 : ${latest.phq9_score}/27
- GAD-7 : ${latest.gad7_score}/21
- Burnout : ${latest.burnout_score}/12
- Stress : ${latest.stress_score}/9
- Sommeil : ${latest.sleep_score}/9
- Catégories : ${(latest.categories ?? []).join(", ") || "aucune"}
- Résumé : ${latest.summary ?? ""}`
            : "Aucun dossier d'évaluation enregistré pour le moment. Tu peux suggérer de faire le questionnaire à /app/assessment quand c'est pertinent.";

          // Persist the last user message
          const last = messages[messages.length - 1];
          if (last && last.role === "user") {
            const text = last.parts
              .map((p) => (p.type === "text" ? p.text : ""))
              .join("");
            await supabase.from("chat_messages").insert({
              thread_id: resolvedThreadId,
              user_id: userId,
              role: "user",
              content: text,
              parts: last.parts as never,
            });
            await supabase
              .from("chat_threads")
              .update({ updated_at: new Date().toISOString() })
              .eq("id", resolvedThreadId);
          }

          const apiKey = process.env.LOVABLE_API_KEY;
          if (!apiKey) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

          const gateway = createLovableAiGatewayProvider(apiKey);
          const model = gateway("google/gemini-3-flash-preview");

          const result = streamText({
            model,
            system: `${SYSTEM_PROMPT}\n\n${contextBlock}`,
            messages: await convertToModelMessages(messages),
          });

          return result.toUIMessageStreamResponse({
            originalMessages: messages,
            headers: { "x-thread-id": resolvedThreadId },
            onFinish: async ({ responseMessage }) => {
              const text = responseMessage.parts
                .map((p) => (p.type === "text" ? p.text : ""))
                .join("");
              await supabase.from("chat_messages").insert({
                thread_id: resolvedThreadId!,
                user_id: userId,
                role: "assistant",
                content: text,
                parts: responseMessage.parts as never,
              });
              await supabase
                .from("chat_threads")
                .update({ updated_at: new Date().toISOString() })
                .eq("id", resolvedThreadId!);
            },
          });
        } catch (e) {
          console.error("Chat error", e);
          return new Response(
            JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }),
            { status: 500, headers: { "content-type": "application/json" } },
          );
        }
      },
    },
  },
});
