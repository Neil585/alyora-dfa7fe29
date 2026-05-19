import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listAssessments } from "@/lib/assessment.functions";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

export const Route = createFileRoute("/_authenticated/app/history")({
  head: () => ({ meta: [{ title: "Mon évolution , Alyora" }] }),
  component: History,
});

function History() {
  const fetchList = useServerFn(listAssessments);
  const { data: items = [] } = useQuery({ queryKey: ["assessments"], queryFn: () => fetchList() });

  const chartData = [...items].reverse().map((a) => ({
    date: new Date(a.taken_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
    "Moral": a.phq9_score,
    "Anxiété": a.gad7_score,
    "Burnout": a.burnout_score,
  }));

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="font-serif text-4xl mb-2">Mon évolution</h1>
      <p className="text-muted-foreground mb-10">Chaque dossier est daté. Vous voyez ce qui bouge.</p>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-6">Aucun dossier pour le moment.</p>
          <Link to="/app/assessment" className="px-5 py-2.5 bg-primary text-primary-foreground rounded-full">Faire le premier point</Link>
        </div>
      ) : (
        <>
          {chartData.length > 1 && (
            <div className="bg-card border border-border rounded-2xl p-6 mb-8">
              <h2 className="font-serif text-xl mb-4">Scores au fil du temps</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis dataKey="date" stroke="oklch(0.5 0.02 70)" fontSize={12} />
                    <YAxis stroke="oklch(0.5 0.02 70)" fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Moral" stroke="oklch(0.42 0.05 145)" strokeWidth={2} />
                    <Line type="monotone" dataKey="Anxiété" stroke="oklch(0.65 0.12 50)" strokeWidth={2} />
                    <Line type="monotone" dataKey="Burnout" stroke="oklch(0.55 0.18 25)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {items.map((a) => (
              <div key={a.id} className="bg-card border border-border rounded-2xl p-6">
                <div className="text-sm text-muted-foreground mb-2">{new Date(a.taken_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</div>
                <p className="leading-relaxed">{a.summary}</p>
                <div className="mt-3 grid grid-cols-3 sm:grid-cols-5 gap-3 text-xs text-muted-foreground">
                  <div>Moral : <span className="text-foreground font-medium">{a.phq9_score}/27</span></div>
                  <div>Anxiété : <span className="text-foreground font-medium">{a.gad7_score}/21</span></div>
                  <div>Burnout : <span className="text-foreground font-medium">{a.burnout_score}/12</span></div>
                  <div>Stress : <span className="text-foreground font-medium">{a.stress_score}/9</span></div>
                  <div>Sommeil : <span className="text-foreground font-medium">{a.sleep_score}/9</span></div>
                </div>
                {a.categories.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {a.categories.map((c) => <span key={c} className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground">{c}</span>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
