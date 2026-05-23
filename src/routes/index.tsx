import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import heroImg from "@/assets/hero.jpg";
import textureImg from "@/assets/texture.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Alyora , Reprendre pied, doucement" },
      { name: "description", content: "Un compagnon de soutien émotionnel pour les jeunes actifs. Faites le point, suivez votre évolution, parlez à quelqu'un quand vous en avez besoin." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div>
      {/* Hero — layered, minimal copy */}
      <section className="relative overflow-hidden">
        {/* Ambient layers */}
        <motion.div
          aria-hidden
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 0.55, scale: 1 }}
          transition={{ duration: 1.6, ease: "easeOut" }}
          className="pointer-events-none absolute -top-32 -left-24 h-[420px] w-[420px] rounded-full blur-3xl"
          style={{ background: "radial-gradient(closest-side, var(--sage), transparent 70%)" }}
        />
        <motion.div
          aria-hidden
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 0.45, scale: 1 }}
          transition={{ duration: 1.8, ease: "easeOut", delay: 0.1 }}
          className="pointer-events-none absolute -bottom-40 -right-20 h-[480px] w-[480px] rounded-full blur-3xl"
          style={{ background: "radial-gradient(closest-side, var(--clay), transparent 70%)" }}
        />

        <div className="relative mx-auto max-w-6xl px-6 pt-20 pb-28 grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Soutien émotionnel
            </motion.div>

            <h1 className="font-serif text-5xl md:text-7xl leading-[1.02] text-foreground">
              {["Reprendre", "pied,", "doucement."].map((w, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 + i * 0.12 }}
                  className="inline-block mr-3"
                >
                  {w}
                </motion.span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.55 }}
              className="mt-6 text-lg text-muted-foreground max-w-md"
            >
              Faites le point. Suivez votre évolution.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.7 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link to="/auth" search={{ mode: "signup" }} className="px-6 py-3 bg-primary text-primary-foreground rounded-full text-sm hover:opacity-90 transition-opacity">
                Premier bilan
              </Link>
              <Link to="/therapists" className="px-6 py-3 border border-border rounded-full text-sm hover:bg-secondary transition-colors">
                Praticiens
              </Link>
            </motion.div>
          </div>

          <div className="md:col-span-6 relative">
            <motion.div
              aria-hidden
              initial={{ opacity: 0, rotate: -6, y: 20 }}
              animate={{ opacity: 1, rotate: -4, y: 0 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              className="absolute -top-6 -left-6 h-40 w-40 rounded-3xl border border-border bg-card/60 backdrop-blur-sm hidden md:block"
            />
            <motion.div
              aria-hidden
              initial={{ opacity: 0, rotate: 8, y: 20 }}
              animate={{ opacity: 1, rotate: 5, y: 0 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
              className="absolute -bottom-8 -right-4 h-48 w-32 rounded-3xl bg-accent/60 hidden md:block"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
              className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl"
            >
              <img src={heroImg} alt="Personne calme dans un environnement apaisant" className="w-full h-full object-cover" width={1200} height={1500} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="absolute -bottom-6 left-6 md:left-10 bg-card border border-border rounded-2xl px-4 py-3 shadow-lg flex items-center gap-3"
            >
              <div className="font-serif text-2xl leading-none">5 min</div>
              <div className="text-xs text-muted-foreground leading-tight">par bilan<br/>100% confidentiel</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features SaaS */}
      <section className="border-y border-border bg-card/40 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Ce que vous obtenez</div>
          <h2 className="font-serif text-3xl md:text-4xl mb-12 max-w-2xl">Un outil de suivi mental, simple et sérieux.</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { t: "Bilans cliniques", d: "Des questionnaires inspirés des outils validés en consultation : PHQ-9, GAD-7, MBI." },
              { t: "Historique daté", d: "Chaque bilan est horodaté et conservé dans votre espace. Vous voyez la courbe sur plusieurs mois." },
              { t: "Compagnon contextuel", d: "Un chat qui connaît vos derniers résultats et peut vous orienter au bon moment." },
              { t: "Annuaire de praticiens", d: "Psychologues et thérapeutes, filtrables par ville, spécialité, modalité." },
            ].map((b) => (
              <div key={b.t} className="bg-background border border-border rounded-2xl p-6">
                <h3 className="font-serif text-lg mb-2">{b.t}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Pour qui */}
      <section className="bg-secondary/40 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="font-serif text-3xl md:text-4xl mb-3">Ce n'est pas grave, mais ça pèse</h2>
          <p className="text-muted-foreground max-w-2xl">Vous fonctionnez, vous avancez. Mais quelque chose tire en arrière. C'est souvent là qu'on attend trop longtemps avant de poser des mots.</p>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {[
              { t: "La charge mentale qui ne s'éteint plus", d: "Vous pensez au boulot dans la douche, aux mails au coucher, à la liste de courses pendant un dîner avec un ami." },
              { t: "L'envie qui s'efface", d: "Les choses que vous aimiez d'habitude ne vous appellent plus vraiment. Vous le faites, mais le cœur n'y est pas." },
              { t: "La fatigue qui ne part pas avec le sommeil", d: "Vous dormez, parfois beaucoup, et vous vous levez quand même vidé." },
            ].map((b) => (
              <div key={b.t} className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-serif text-xl mb-2">{b.t}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="font-serif text-3xl md:text-4xl mb-12">Comment ça se passe</h2>
          <div className="space-y-12">
            {[
              { n: "01", t: "Vous faites un premier point", d: "Un questionnaire calme, inspiré d'outils utilisés en consultation. Il vous donne une lecture de là où vous en êtes : moral, anxiété, sommeil, énergie au travail." },
              { n: "02", t: "Vous voyez votre évolution", d: "Vos dossiers sont datés et conservés. Vous pouvez le refaire dans deux semaines, dans un mois, et regarder ce qui a bougé." },
              { n: "03", t: "Vous parlez à Alyora quand vous voulez", d: "Le compagnon de chat connaît votre dossier. Il peut vous proposer une piste pour la journée, ou vous orienter vers un praticien si ça pèse trop." },
              { n: "04", t: "Vous trouvez un praticien qui vous va", d: "Un annuaire filtrable par ville, spécialité, modalité. Pas de tri opaque, pas de promo déguisée." },
            ].map((s) => (
              <div key={s.n} className="flex gap-8">
                <div className="font-serif text-3xl text-muted-foreground w-16 flex-shrink-0">{s.n}</div>
                <div>
                  <h3 className="font-serif text-2xl mb-2">{s.t}</h3>
                  <p className="text-muted-foreground leading-relaxed max-w-2xl">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Articles */}
      <section className="bg-cream/60 py-20" style={{ backgroundImage: `url(${textureImg})`, backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="font-serif text-3xl md:text-4xl mb-3">À lire quand vous avez cinq minutes</h2>
          <p className="text-muted-foreground mb-12 max-w-xl">Des textes courts, pas de promesses.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { t: "Pourquoi on attend toujours trop longtemps avant de consulter", u: "https://www.psychologies.com/Therapies/Toutes-les-therapies/Choisir-une-therapie/Articles-et-Dossiers/Quand-consulter-un-psy" },
              { t: "Le burnout n'arrive pas du jour au lendemain", u: "https://www.has-sante.fr/jcms/c_2769318/fr/reperage-et-prise-en-charge-cliniques-du-syndrome-d-epuisement-professionnel-ou-burnout" },
              { t: "Petite anatomie de l'anxiété ordinaire", u: "https://www.inserm.fr/dossier/troubles-anxieux/" },
            ].map((a) => (
              <a key={a.t} href={a.u} target="_blank" rel="noreferrer" className="bg-card/90 backdrop-blur border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow block">
                <h3 className="font-serif text-xl">{a.t}</h3>
                <p className="text-xs mt-4 text-muted-foreground">Lire</p>
              </a>
            ))}
          </div>
          <div className="mt-8">
            <Link to="/articles" className="text-sm underline text-muted-foreground hover:text-foreground">Voir toutes les lectures</Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-serif text-4xl md:text-5xl mb-6">Vous pouvez commencer maintenant.</h2>
          <p className="text-muted-foreground mb-8">Pas de tunnel, pas de niveau à débloquer. Vous créez un compte, vous faites le premier point, vous voyez ce qui se passe.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/auth" search={{ mode: "signup" }} className="px-6 py-3 bg-primary text-primary-foreground rounded-full text-sm">
              Créer un compte
            </Link>
            <Link to="/therapists" className="px-6 py-3 border border-border rounded-full text-sm">
              Parcourir les praticiens
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        Alyora , Plateforme de soutien émotionnel non médical. En cas d'urgence : 3114 (prévention du suicide), 15 (SAMU).
      </footer>
    </div>
  );
}
