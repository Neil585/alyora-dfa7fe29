import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "motion/react";
import { Bell, Plus, Smile, TrendingUp, Target, Play, Flame, Brain, Moon, Activity as ActivityIcon } from "lucide-react";
import { listAssessments } from "@/lib/assessment.functions";
import { listPractitioners } from "@/lib/practitioners.functions";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/app/")({
  head: () => ({ meta: [{ title: "Mon espace, Alyora" }] }),
  component: AppDashboard,
});

const MAX_TOTAL = 78; // phq9 27 + gad7 21 + burnout 12 + stress 9 + sleep 9

function alyoraScore(a: { phq9_score: number; gad7_score: number; burnout_score: number; stress_score: number; sleep_score: number } | undefined) {
  if (!a) return null;
  const sum = a.phq9_score + a.gad7_score + a.burnout_score + a.stress_score + a.sleep_score;
  return Math.max(0, Math.min(100, Math.round(100 - (sum / MAX_TOTAL) * 100)));
}

function weekKey(d: Date) {
  const x = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = x.getUTCDay() || 7;
  x.setUTCDate(x.getUTCDate() + 4 - day);
  const ys = new Date(Date.UTC(x.getUTCFullYear(), 0, 1));
  return `${x.getUTCFullYear()}-${Math.ceil(((x.getTime() - ys.getTime()) / 86400000 + 1) / 7)}`;
}

function streakOf(dates: Date[]) {
  const set = new Set(dates.map(weekKey));
  let s = 0;
  const cur = new Date();
  while (set.has(weekKey(cur))) { s++; cur.setDate(cur.getDate() - 7); }
  if (s === 0) {
    const last = new Date(); last.setDate(last.getDate() - 7);
    while (set.has(weekKey(last))) { s++; last.setDate(last.getDate() - 7); }
  }
  return s;
}

function AppDashboard() {
  const { user } = useAuth();
  const fetchList = useServerFn(listAssessments);
  const fetchPractitioners = useServerFn(listPractitioners);
  const { data: assessments = [] } = useQuery({ queryKey: ["assessments"], queryFn: () => fetchList() });
  const { data: practitioners = [] } = useQuery({ queryKey: ["practitioners-dash"], queryFn: () => fetchPractitioners({ data: {} }) });

  const latest = assessments[0];
  const previous = assessments[1];
  const score = alyoraScore(latest);
  const prevScore = alyoraScore(previous);
  const delta = score !== null && prevScore !== null ? score - prevScore : null;

  const streak = streakOf(assessments.map((a) => new Date(a.taken_at)));
  const total = assessments.length;
  const milestones = [1, 3, 5, 10, 20];
  const next = milestones.find((m) => m > total) ?? total + 5;
  const milestoneProgress = Math.min(100, Math.round((total / next) * 100));

  // Weekly activity (last 7 days, count of assessments per day)
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const dayLabels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - 6);
  const counts = days.map((d) => {
    const dayKey = d.toISOString().slice(0, 10);
    return assessments.filter((a) => new Date(a.taken_at).toISOString().slice(0, 10) === dayKey).length;
  });
  const maxCount = Math.max(1, ...counts);

  const firstName = (user?.user_metadata?.full_name || user?.email?.split("@")[0] || "vous").split(" ")[0];

  const recommended = practitioners.slice(0, 3);

  return (
    <div className="px-4 md:px-8 lg:px-10 py-6 md:py-8 max-w-[1400px] mx-auto">
      {/* Top bar */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl">Bonjour {firstName} <span className="inline-block">👋</span></h1>
          <p className="text-muted-foreground mt-1">Prêt·e à prendre soin de vous aujourd'hui ?</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="h-10 w-10 rounded-full border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground" aria-label="Notifications">
            <Bell className="h-4 w-4" />
          </button>
          <Link to="/app/assessment" className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm hover:opacity-90">
            <Plus className="h-4 w-4" /> Nouveau suivi
          </Link>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-5">
          <div className="text-xs text-muted-foreground">Score Alyora</div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-serif text-5xl">{score ?? "—"}</span>
            <span className="text-sm text-muted-foreground">/100</span>
          </div>
          <div className="mt-2 text-xs text-primary">{score !== null ? (score >= 70 ? "Bonne dynamique !" : score >= 50 ? "À surveiller" : "Prenez soin de vous") : "Faites un premier point"}</div>
          {/* Mini sparkline */}
          <Sparkline values={assessments.slice(0, 8).map((a) => alyoraScore(a) ?? 0).reverse()} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card border border-border rounded-2xl p-5">
          <div className="text-xs text-muted-foreground">Suivi</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-4xl">{total}</span>
            <span className="text-sm text-muted-foreground">points complétés</span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">Vos données sont sauvegardées dans le cloud.</div>
          <Link to="/app/assessment" className="mt-3 block text-xs text-primary hover:underline">Faire un nouveau point ›</Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-2xl p-5">
          <div className="text-xs text-muted-foreground">Progression</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`font-serif text-4xl ${delta !== null && delta >= 0 ? "text-primary" : ""}`}>{delta !== null ? (delta >= 0 ? "+" : "") + delta : "—"}</span>
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div className="mt-1 text-xs text-muted-foreground">points cette semaine</div>
          <Link to="/app/history" className="mt-3 block text-xs text-primary hover:underline">Voir le détail ›</Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card border border-border rounded-2xl p-5">
          <div className="text-xs text-muted-foreground">Objectif actuel</div>
          <div className="mt-2 flex items-center gap-3">
            <ProgressRing value={Math.min(100, total * 20)} />
            <div>
              <div className="font-serif text-lg leading-tight">Garder le rythme</div>
              <div className="text-xs text-muted-foreground">{streak} sem. d'affilée</div>
            </div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">Palier {next} : {total}/{next}</div>
          <div className="mt-1 h-1.5 rounded-full bg-secondary overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${milestoneProgress}%` }} className="h-full bg-primary" />
          </div>
        </motion.div>
      </div>

      {/* Recommended */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif text-xl">Recommandé pour vous</h2>
          <Link to="/articles" className="text-xs text-muted-foreground hover:text-foreground">Voir tout ›</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { t: "Respiration 4-7-8", k: "Exercice · 3 min", icon: Brain, grad: "from-sage/30 to-primary/20" },
            { t: "5 clés pour mieux gérer le stress", k: "Vidéo · 6 min", icon: Play, grad: "from-clay/30 to-accent/30" },
            { t: "Épisode podcast Lâcher prise", k: "Podcast · 28 min", icon: Play, grad: "from-primary/20 to-accent/30" },
          ].map((c) => (
            <div key={c.t} className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className={`h-28 bg-gradient-to-br ${c.grad} flex items-center justify-center`}>
                <div className="h-10 w-10 rounded-full bg-card/90 flex items-center justify-center">
                  <c.icon className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div className="p-4">
                <div className="font-medium text-sm">{c.t}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{c.k}</div>
              </div>
            </div>
          ))}
          {/* Next appointment */}
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Prochain rendez-vous</div>
            {recommended[0] ? (
              <Link to="/therapists/$id" params={{ id: recommended[0].id }} className="flex items-center gap-3">
                {recommended[0].photo_url ? (
                  <img src={recommended[0].photo_url} alt={recommended[0].full_name} className="h-12 w-12 rounded-full object-cover" />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-secondary" />
                )}
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">{recommended[0].full_name}</div>
                  <div className="text-xs text-muted-foreground truncate">{recommended[0].title}</div>
                  <div className="text-xs text-primary mt-1">Voir le profil ›</div>
                </div>
              </Link>
            ) : (
              <p className="text-sm text-muted-foreground">Aucun rendez-vous planifié.</p>
            )}
          </div>
        </div>
      </section>

      {/* Activity + habits */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg">Votre activité cette semaine</h3>
            <div className="text-xs text-muted-foreground inline-flex items-center gap-1"><Flame className="h-3.5 w-3.5 text-primary" /> {streak} sem. d'affilée</div>
          </div>
          <WeekChart counts={counts} maxCount={maxCount} labels={dayLabels} />
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-serif text-lg mb-4">Vos habitudes</h3>
          <div className="space-y-4">
            {[
              { icon: Brain, name: "Méditation", v: 3, m: 5 },
              { icon: ActivityIcon, name: "Activité physique", v: 2, m: 5 },
              { icon: Moon, name: "Sommeil", v: 4, m: 5 },
            ].map((h) => (
              <div key={h.name}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <h.icon className="h-4 w-4" />
                    {h.name}
                  </div>
                  <span className="text-xs font-medium">{h.v}/{h.m} jours</span>
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${(h.v / h.m) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return <div className="mt-3 h-8" />;
  const w = 120, h = 30;
  const min = Math.min(...values), max = Math.max(...values);
  const range = Math.max(1, max - min);
  const points = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-3 w-full h-8">
      <polyline fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" points={points} />
    </svg>
  );
}

function ProgressRing({ value }: { value: number }) {
  const r = 18, c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <svg viewBox="0 0 44 44" className="h-12 w-12 -rotate-90">
      <circle cx="22" cy="22" r={r} fill="none" stroke="var(--secondary)" strokeWidth="4" />
      <circle cx="22" cy="22" r={r} fill="none" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset} />
    </svg>
  );
}

function WeekChart({ counts, maxCount, labels }: { counts: number[]; maxCount: number; labels: string[] }) {
  const w = 600, h = 140, pad = 20;
  const points = counts.map((c, i) => {
    const x = pad + (i * (w - pad * 2)) / (counts.length - 1);
    const y = h - pad - (c / maxCount) * (h - pad * 2);
    return { x, y, c };
  });
  const path = points.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(" ");
  const area = `${path} L${points[points.length - 1].x},${h - pad} L${points[0].x},${h - pad} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-36">
      <defs>
        <linearGradient id="wkgrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#wkgrad)" />
      <path d={path} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3.5" fill="var(--primary)" />
          <text x={p.x} y={h - 4} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 10 }}>{labels[i]}</text>
        </g>
      ))}
    </svg>
  );
}
