import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listAssessments, listCheckIns, upsertCheckIn } from "@/lib/assessment.functions";
import { listThreads, createThread } from "@/lib/chat.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app")({
  head: () => ({ meta: [{ title: "Mon espace — Alyora" }] }),
  component: AppDashboard,
});

const DAILY_TIPS = [
  "Aujourd'hui, essayez de couper les notifications pendant le déjeuner. Juste ce moment.",
  "Notez trois choses qui se sont bien passées hier, même petites. Ça reprogramme l'attention.",
  "Si vous sentez monter quelque chose, posez-vous et respirez : 4 secondes inspirer, 6 secondes expirer, pendant deux minutes.",
  "Marchez dix minutes sans téléphone. Vraiment sans.",
  "Avant de dormir, écrivez ce qui n'est pas terminé. Sortir les choses de la tête aide à les lâcher.",
  "Identifiez une chose que vous faites par habitude et qui ne vous nourrit plus. Pas besoin de l'arrêter, juste de la voir.",
  "Buvez un verre d'eau maintenant. C'est petit, ça compte.",
];

function AppDashboard() {
  const qc = useQueryClient();
  const fetchList = useServerFn(listAssessments);
  const fetchCheck = useServerFn(listCheckIns);
  const fetchThreads = useServerFn(listThreads);
  const newThread = useServerFn(createThread);
  const saveMood = useServerFn(upsertCheckIn);

  const { data: assessments = [] } = useQuery({ queryKey: ["assessments"], queryFn: () => fetchList() });
  const { data: checks = [] } = useQuery({ queryKey: ["checkins"], queryFn: () => fetchCheck() });
  const { data: threads = [] } = useQuery({ queryKey: ["threads"], queryFn: () => fetchThreads() });

  const latest = assessments[0];
  const tipIndex = new Date().getDay() % DAILY_TIPS.length;

  const [note, setNote] = useState("");
  const moodMutation = useMutation({
    mutationFn: (mood: number) => saveMood({ data: { mood, note: note || undefined } }),
    onSuccess: () => { toast.success("Noté."); qc.invalidateQueries({ queryKey: ["checkins"] }); setNote(""); },
  });

  const createThreadMutation = useMutation({
    mutationFn: () => newThread({ data: {} }),
    onSuccess: (t) => { window.location.href = `/chat/${t.id}`; },
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="font-serif text-4xl mb-2">Mon espace</h1>
      <p className="text-muted-foreground mb-10">Un endroit calme pour faire le point.</p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Conseil du jour */}
        <div className="bg-secondary/50 border border-border rounded-2xl p-6">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Conseil du jour</div>
          <p className="font-serif text-xl leading-snug">{DAILY_TIPS[tipIndex]}</p>
        </div>

        {/* Check-in */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Comment ça va aujourd'hui ?</div>
          <div className="flex gap-2 mb-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => moodMutation.mutate(n)} disabled={moodMutation.isPending} className="flex-1 py-3 rounded-xl border border-border hover:bg-secondary text-2xl">
                {["😞", "😕", "😐", "🙂", "😊"][n - 1]}
              </button>
            ))}
          </div>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Une note, si vous voulez..." className="w-full text-sm bg-secondary rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring" />
          <p className="text-xs text-muted-foreground mt-2">{checks.length} check-in{checks.length > 1 ? "s" : ""} enregistré{checks.length > 1 ? "s" : ""}.</p>
        </div>

        {/* Dossier */}
        <div className="bg-card border border-border rounded-2xl p-6 md:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Dernier dossier</div>
              {latest ? (
                <>
                  <p className="text-sm text-muted-foreground">{new Date(latest.taken_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
                  <p className="mt-3 leading-relaxed">{latest.summary}</p>
                  {latest.categories.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {latest.categories.map((c) => <span key={c} className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground">{c}</span>)}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground">Vous n'avez pas encore fait de point. C'est le bon moment.</p>
              )}
            </div>
            <Link to="/app/assessment" className="flex-shrink-0 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm">
              {latest ? "Refaire le point" : "Faire le point"}
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <Link to="/app/history" className="underline text-muted-foreground">Voir l'évolution</Link>
            {latest && (
              <button
                onClick={() => createThreadMutation.mutate()}
                className="underline text-muted-foreground hover:text-foreground"
              >
                En parler avec Alyora
              </button>
            )}
          </div>
        </div>

        {/* Suggestions praticien */}
        {latest && latest.categories.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-6 md:col-span-2">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Praticiens recommandés</div>
            <p className="text-sm text-muted-foreground mb-4">D'après votre dossier, certains praticiens spécialisés pourraient vous correspondre.</p>
            <div className="flex flex-wrap gap-2">
              {latest.categories.map((c) => (
                <Link key={c} to="/therapists" className="text-sm px-3 py-1.5 rounded-full bg-secondary hover:bg-accent transition-colors">
                  Voir pour {c} →
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Conversations */}
        <div className="bg-card border border-border rounded-2xl p-6 md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Mes conversations</div>
            <button onClick={() => createThreadMutation.mutate()} className="text-sm px-3 py-1.5 bg-primary text-primary-foreground rounded-full">
              Nouvelle conversation
            </button>
          </div>
          {threads.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune conversation pour le moment.</p>
          ) : (
            <ul className="divide-y divide-border">
              {threads.map((t) => (
                <li key={t.id}>
                  <Link to="/chat/$threadId" params={{ threadId: t.id }} className="block py-3 hover:text-primary">
                    <div className="font-medium">{t.title}</div>
                    <div className="text-xs text-muted-foreground">{new Date(t.updated_at).toLocaleString("fr-FR")}</div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
