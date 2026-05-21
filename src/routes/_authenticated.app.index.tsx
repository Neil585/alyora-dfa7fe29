import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "motion/react";
import { Flame, Sparkles, Target, TrendingUp } from "lucide-react";
import { listAssessments } from "@/lib/assessment.functions";
import { listThreads, createThread } from "@/lib/chat.functions";

export const Route = createFileRoute("/_authenticated/app/")({
  head: () => ({ meta: [{ title: "Mon espace , Alyora" }] }),
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

// Monday-based week key
function weekKey(date: Date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo}`;
}

function computeStreak(dates: Date[]) {
  if (dates.length === 0) return 0;
  const weeks = new Set(dates.map(weekKey));
  let streak = 0;
  const cursor = new Date();
  while (weeks.has(weekKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 7);
  }
  if (streak === 0) {
    // Allow last week to count if user hasn't done one yet this week
    const last = new Date();
    last.setDate(last.getDate() - 7);
    while (weeks.has(weekKey(last))) {
      streak++;
      last.setDate(last.getDate() - 7);
    }
  }
  return streak;
}

function AppDashboard() {
  const qc = useQueryClient();
  const fetchList = useServerFn(listAssessments);
  const fetchThreads = useServerFn(listThreads);
  const newThread = useServerFn(createThread);

  const { data: assessments = [] } = useQuery({ queryKey: ["assessments"], queryFn: () => fetchList() });
  const { data: threads = [] } = useQuery({ queryKey: ["threads"], queryFn: () => fetchThreads() });

  const latest = assessments[0];
  const tipIndex = new Date().getDay() % DAILY_TIPS.length;

  const dates = assessments.map((a) => new Date(a.taken_at));
  const streak = computeStreak(dates);
  const total = assessments.length;
  const daysSince = latest
    ? Math.floor((Date.now() - new Date(latest.taken_at).getTime()) / 86400000)
    : null;

  // Next milestone
  const milestones = [1, 3, 5, 10, 20];
  const nextMilestone = milestones.find((m) => m > total) ?? total + 5;
  const milestoneProgress = Math.min(100, Math.round((total / nextMilestone) * 100));

  const createThreadMutation = useMutation({
    mutationFn: () => newThread({ data: {} }),
    onSuccess: (t) => { window.location.href = `/chat/${t.id}`; qc.invalidateQueries({ queryKey: ["threads"] }); },
  });

  return (
    <div className="relative">
      {/* Ambient background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl"
          animate={{ x: [0, 40, 0], y: [0, 20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-40 -right-32 h-96 w-96 rounded-full bg-accent/20 blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative mx-auto max-w-5xl px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-serif text-4xl mb-2">Mon espace</h1>
          <p className="text-muted-foreground mb-10">Un endroit calme pour faire le point.</p>
        </motion.div>

        {/* Streak hero card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-card to-accent/15 p-6 md:p-8 mb-6"
        >
          <div className="grid md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2">
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Votre régularité</div>
              <div className="flex items-end gap-6 flex-wrap">
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 180, damping: 14, delay: 0.2 }}
                  className="flex items-center gap-3"
                >
                  <div className="relative">
                    <Flame className={`h-10 w-10 ${streak > 0 ? "text-orange-500" : "text-muted-foreground"}`} />
                    {streak > 0 && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-orange-500/30 blur-xl"
                        animate={{ opacity: [0.4, 0.8, 0.4] }}
                        transition={{ duration: 2.4, repeat: Infinity }}
                      />
                    )}
                  </div>
                  <div>
                    <div className="font-serif text-4xl leading-none">{streak}</div>
                    <div className="text-xs text-muted-foreground mt-1">semaine{streak > 1 ? "s" : ""} d'affilée</div>
                  </div>
                </motion.div>

                <div className="flex items-center gap-3">
                  <Target className="h-7 w-7 text-primary" />
                  <div>
                    <div className="font-serif text-3xl leading-none">{total}</div>
                    <div className="text-xs text-muted-foreground mt-1">bilan{total > 1 ? "s" : ""} au total</div>
                  </div>
                </div>

                {daysSince !== null && (
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-7 w-7 text-muted-foreground" />
                    <div>
                      <div className="font-serif text-3xl leading-none">{daysSince}j</div>
                      <div className="text-xs text-muted-foreground mt-1">depuis le dernier</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span>Prochain palier : {nextMilestone} bilans</span>
                  <span>{total}/{nextMilestone}</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-accent"
                    initial={{ width: 0 }}
                    animate={{ width: `${milestoneProgress}%` }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>

            <div className="flex md:justify-end">
              <Link to="/app/assessment" className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-full text-sm hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">
                <Sparkles className="h-4 w-4" />
                {latest ? (daysSince !== null && daysSince < 7 ? "Refaire un point" : "Garder le streak") : "Faire mon premier point"}
              </Link>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Conseil du jour */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-secondary/50 border border-border rounded-2xl p-6"
          >
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Conseil du jour</div>
            <p className="font-serif text-xl leading-snug">{DAILY_TIPS[tipIndex]}</p>
          </motion.div>

          {/* Dossier */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Dernier dossier</div>
            {latest ? (
              <>
                <p className="text-sm text-muted-foreground">{new Date(latest.taken_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
                <p className="mt-3 leading-relaxed text-sm">{latest.summary}</p>
                {latest.categories.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {latest.categories.map((c) => <span key={c} className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground">{c}</span>)}
                  </div>
                )}
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  <Link to="/app/history" className="underline text-muted-foreground">Voir l'évolution</Link>
                  <button onClick={() => createThreadMutation.mutate()} className="underline text-muted-foreground hover:text-foreground">
                    En parler avec Alyora Genius
                  </button>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">Vous n'avez pas encore fait de point. C'est le bon moment.</p>
            )}
          </motion.div>

          {/* Suggestions praticien */}
          {latest && latest.categories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-card border border-border rounded-2xl p-6 md:col-span-2"
            >
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Praticiens recommandés</div>
              <p className="text-sm text-muted-foreground mb-4">D'après votre dossier, certains praticiens spécialisés pourraient vous correspondre.</p>
              <div className="flex flex-wrap gap-2">
                {latest.categories.map((c) => (
                  <Link key={c} to="/therapists" className="text-sm px-3 py-1.5 rounded-full bg-secondary hover:bg-accent transition-colors">
                    Voir pour {c} →
                  </Link>
                ))}
              </div>
            </motion.div>
          )}

          {/* Conversations */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="bg-card border border-border rounded-2xl p-6 md:col-span-2"
          >
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
          </motion.div>
        </div>
      </div>
    </div>
  );
}
