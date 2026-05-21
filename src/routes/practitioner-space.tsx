import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "motion/react";
import { Users, CalendarCheck, CheckCircle2, Star, ArrowUpRight, MessageSquare } from "lucide-react";
import { listPractitioners } from "@/lib/practitioners.functions";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/alyora-mark.png";

export const Route = createFileRoute("/practitioner-space")({
  head: () => ({ meta: [{ title: "Espace praticien, Alyora" }] }),
  component: PractitionerSpace,
});

function PractitionerSpace() {
  const { user } = useAuth();
  const fetchList = useServerFn(listPractitioners);
  const { data: list = [] } = useQuery({ queryKey: ["pract-space"], queryFn: () => fetchList({ data: {} }) });

  const me = list[0];
  const clients = list.slice(1, 5);
  const tabs = ["Vue d'ensemble", "Mes clients", "Rendez-vous", "Messages", "Statistiques"];

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="bg-card border-b border-border">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Alyora" className="h-8 w-8" />
            <span className="font-serif text-2xl">alyora</span>
            <span className="ml-3 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">Espace praticien</span>
          </Link>
          <div className="flex items-center gap-3">
            {me?.photo_url && <img src={me.photo_url} alt="" className="h-9 w-9 rounded-full object-cover" />}
            <div className="text-sm">
              <div className="font-medium">{me?.full_name ?? user?.email}</div>
              <div className="text-xs text-muted-foreground">{me?.title ?? "Praticien"}</div>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-6 flex gap-1 -mb-px">
          {tabs.map((t, i) => (
            <button key={t} className={`px-4 py-3 text-sm border-b-2 ${i === 0 ? "border-primary text-foreground font-medium" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {t}
            </button>
          ))}
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { t: "Clients actifs", v: "24", d: "+12% ce mois", icon: Users },
            { t: "Rendez-vous aujourd'hui", v: "5", d: "Voir mon agenda ›", icon: CalendarCheck },
            { t: "Suivis complétés", v: "87%", d: "+8% ce mois", icon: CheckCircle2 },
            { t: "Satisfaction clients", v: "4.9/5", d: "Voir les avis ›", icon: Star },
          ].map((k, i) => (
            <motion.div key={k.t} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">{k.t}</div>
                <k.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="mt-2 font-serif text-4xl">{k.v}</div>
              <div className="mt-1 text-xs text-primary">{k.d}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Clients activity */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-serif text-lg mb-4">Activité de vos clients</h3>
            <ul className="divide-y divide-border">
              {clients.length === 0 ? (
                <li className="py-3 text-sm text-muted-foreground">Aucun client à afficher.</li>
              ) : clients.map((c, i) => {
                const score = 60 + ((i * 17) % 38);
                const delta = ((i * 7) % 25) - 5;
                return (
                  <li key={c.id} className="py-3 flex items-center gap-3">
                    {c.photo_url ? (
                      <img src={c.photo_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-secondary" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{c.full_name.split(" ").slice(0, 2).join(" ")}</div>
                      <div className="text-xs text-muted-foreground">Score actuel : {score}/100</div>
                    </div>
                    <div className={`text-xs font-medium ${delta >= 0 ? "text-primary" : "text-destructive"}`}>
                      Progression : {delta >= 0 ? "+" : ""}{delta}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Messages */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-serif text-lg mb-4">Derniers messages</h3>
            <ul className="space-y-4">
              {clients.slice(0, 3).map((c, i) => (
                <li key={c.id} className="flex items-start gap-3">
                  {c.photo_url ? (
                    <img src={c.photo_url} alt="" className="h-9 w-9 rounded-full object-cover" />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-secondary" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-medium truncate">{c.full_name.split(" ").slice(0, 2).join(" ")}</div>
                      <div className="text-xs text-muted-foreground">il y a {(i + 1) * 2}h</div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{i === 0 ? "Merci pour notre séance, cela m'a beaucoup aidée." : i === 1 ? "Je vais essayer les exercices que vous m'avez conseillés." : "Pouvons-nous décaler le rendez-vous de demain ?"}</p>
                  </div>
                </li>
              ))}
            </ul>
            <button className="mt-4 w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm inline-flex items-center justify-center gap-2">
              <MessageSquare className="h-4 w-4" /> Voir tous les messages
            </button>
          </div>
        </div>

        <div className="mt-6 bg-gradient-to-br from-primary/10 via-accent/20 to-secondary rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-1">
            <h3 className="font-serif text-xl">Vous êtes praticien ?</h3>
            <p className="text-sm text-muted-foreground mt-1">Rejoignez Alyora et recevez de nouveaux clients qualifiés selon vos spécialités.</p>
          </div>
          <a href="mailto:hello@alyora.app" className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm inline-flex items-center gap-2">
            Nous contacter <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
