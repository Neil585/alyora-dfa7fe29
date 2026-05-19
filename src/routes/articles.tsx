import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/articles")({
  head: () => ({ meta: [{ title: "Lectures , Alyora" }, { name: "description", content: "Des lectures pour comprendre, pas pour s'auto-diagnostiquer." }] }),
  component: Articles,
});

const ARTICLES = [
  { t: "Quand consulter un psy", u: "https://www.psychologies.com/Therapies/Toutes-les-therapies/Choisir-une-therapie/Articles-et-Dossiers/Quand-consulter-un-psy", s: "Psychologies" },
  { t: "Le syndrome d'épuisement professionnel", u: "https://www.has-sante.fr/jcms/c_2769318/fr/reperage-et-prise-en-charge-cliniques-du-syndrome-d-epuisement-professionnel-ou-burnout", s: "HAS" },
  { t: "Les troubles anxieux", u: "https://www.inserm.fr/dossier/troubles-anxieux/", s: "Inserm" },
  { t: "Dormir mieux : ce qui marche, ce qui ne marche pas", u: "https://www.inserm.fr/dossier/sommeil/", s: "Inserm" },
  { t: "Stress chronique et santé mentale", u: "https://www.santepubliquefrance.fr/maladies-et-traumatismes/sante-mentale", s: "Santé publique France" },
  { t: "Trouver un thérapeute : comment s'y prendre", u: "https://www.psycom.org/sorienter/la-psychiatrie-et-la-sante-mentale/qui-fait-quoi-en-sante-mentale/", s: "Psycom" },
];

function Articles() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-serif text-5xl mb-4">Lectures</h1>
      <p className="text-muted-foreground mb-12">Des sources fiables, des textes mesurés. Rien qui essaye de vous vendre quelque chose.</p>
      <div className="space-y-4">
        {ARTICLES.map((a) => (
          <a key={a.u} href={a.u} target="_blank" rel="noreferrer" className="block bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-shadow">
            <div className="text-xs text-muted-foreground mb-1">{a.s}</div>
            <div className="font-serif text-xl">{a.t}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
