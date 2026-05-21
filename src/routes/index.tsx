import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, BadgeCheck, Sparkles, LineChart, Users, BookOpen, Headphones, Play } from "lucide-react";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Alyora, votre bien-être mental, notre priorité" },
      { name: "description", content: "Alyora vous accompagne au quotidien, vous met en lien avec les meilleurs praticiens et vous aide à avancer, à votre rythme." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 pt-16 pb-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-5">Prenez soin de vous, sérieusement.</div>
            <h1 className="font-serif text-5xl md:text-6xl leading-[1.05]">
              Votre <span className="text-primary">bien-être mental</span>,<br /> notre priorité.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-lg">
              Alyora vous accompagne au quotidien, vous met en lien avec les meilleurs <span className="text-foreground font-medium">praticiens</span> et vous aide à avancer, à votre rythme.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/auth" search={{ mode: "signup" }} className="px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm hover:opacity-90 transition-opacity">
                Commencer gratuitement
              </Link>
              <Link to="/therapists" className="px-6 py-3 border border-border bg-card rounded-xl text-sm hover:bg-secondary transition-colors">
                Découvrir Alyora
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-primary" /> Connexion sécurisée</span>
              <span className="inline-flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-primary" /> Praticiens vérifiés</span>
              <span className="inline-flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-primary" /> Conseils personnalisés</span>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-8 bg-gradient-to-br from-primary/20 via-accent/30 to-secondary rounded-[3rem] blur-2xl" />
            <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-gradient-to-br from-accent/40 to-primary/20 border border-border">
              <img src={heroImg} alt="Sérénité" className="w-full h-full object-cover mix-blend-luminosity opacity-90" />
            </div>
          </div>
        </div>
      </section>

      {/* Features SaaS */}
      <section className="py-20 bg-background">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-serif text-3xl md:text-4xl text-center mb-12">Tout ce dont vous avez besoin,<br />au même endroit.</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { icon: LineChart, t: "Suivi quotidien", d: "Suivez votre état d'esprit et vos habitudes avec le tracker Alyora." },
              { icon: Users, t: "Mise en relation", d: "Trouvez le praticien qui vous correspond vraiment." },
              { icon: BookOpen, t: "Conseils & contenus", d: "Podcasts, vidéos et conseils personnalisés pour aller mieux." },
              { icon: Sparkles, t: "Tableau de bord", d: "Visualisez vos progrès et comprenez-vous mieux." },
            ].map((b) => (
              <div key={b.t} className="bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-shadow">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <b.icon className="h-5 w-5" />
                </div>
                <h3 className="font-serif text-lg mb-2">{b.t}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Podcast band */}
      <section className="py-16 bg-secondary/40">
        <div className="mx-auto max-w-6xl px-6 grid md:grid-cols-2 gap-8 items-center">
          <div className="bg-foreground text-background rounded-3xl p-8 md:p-10 relative overflow-hidden">
            <Headphones className="h-6 w-6 mb-6 opacity-70" />
            <div className="text-xs uppercase tracking-widest opacity-70 mb-3">Le podcast Alyora</div>
            <h3 className="font-serif text-3xl md:text-4xl leading-tight">Des conversations vraies, inspirantes, sans filtre.</h3>
            <button className="mt-8 px-5 py-2.5 bg-background text-foreground rounded-full text-sm inline-flex items-center gap-2">
              <Play className="h-3.5 w-3.5" /> Écouter le dernier épisode
            </button>
          </div>
          <div className="bg-card border border-border rounded-3xl p-6">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/30 to-accent flex items-center justify-center">
                <Headphones className="h-7 w-7 text-primary" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-muted-foreground">Épisode 24</div>
                <div className="font-serif text-xl">Gérer l'anxiété au quotidien</div>
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>24:35</span>
                  <button className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center"><Play className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="font-serif text-3xl md:text-4xl mb-12">Comment ça se passe</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { n: "01", t: "Vous faites un premier point", d: "Un questionnaire calme, inspiré d'outils utilisés en consultation. Toutes les questions sont skippables." },
              { n: "02", t: "Vous voyez votre évolution", d: "Vos résultats sont conservés dans le cloud. Vous suivez la courbe sur plusieurs semaines." },
              { n: "03", t: "Vous parlez à Alyora Genius", d: "Un compagnon contextuel qui connaît votre dossier et peut vous orienter." },
              { n: "04", t: "Vous trouvez un praticien", d: "Un annuaire filtrable par ville, spécialité, modalité. Sans tri opaque." },
            ].map((s) => (
              <div key={s.n} className="bg-card border border-border rounded-2xl p-6">
                <div className="font-serif text-2xl text-primary">{s.n}</div>
                <h3 className="font-serif text-xl mt-2 mb-2">{s.t}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-primary/10 via-accent/20 to-secondary">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-serif text-4xl md:text-5xl mb-6">Vous pouvez commencer maintenant.</h2>
          <p className="text-muted-foreground mb-8">Pas de tunnel, pas de niveau à débloquer. Vous créez un compte, vous faites le premier point, vous voyez ce qui se passe.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/auth" search={{ mode: "signup" }} className="px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm">Créer un compte</Link>
            <Link to="/therapists" className="px-6 py-3 border border-border bg-card rounded-xl text-sm">Parcourir les praticiens</Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground space-y-2">
        <div>Alyora, plateforme de soutien émotionnel non médical. En cas d'urgence : 3114 (prévention du suicide), 15 (SAMU).</div>
        <div><Link to="/practitioner-space" className="hover:text-foreground underline-offset-4 hover:underline">Espace praticien ›</Link></div>
      </footer>
    </div>
  );
}
