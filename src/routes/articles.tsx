import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/articles")({
  head: () => ({ meta: [{ title: "Lectures , Alyora" }, { name: "description", content: "Des lectures pour comprendre, pas pour s'auto-diagnostiquer." }] }),
  component: Articles,
});

const ARTICLES = [
  { t: "Quand consulter un psy", u: "https://www.psychologies.com/Therapies/Toutes-les-therapies/Choisir-une-therapie/Articles-et-Dossiers/Quand-consulter-un-psy", s: "Psychologies", d: "Les signaux qui peuvent indiquer qu'un accompagnement professionnel serait utile." },
  { t: "Le syndrome d'épuisement professionnel", u: "https://www.has-sante.fr/jcms/c_2769318/fr/reperage-et-prise-en-charge-cliniques-du-syndrome-d-epuisement-professionnel-ou-burnout", s: "Haute Autorité de Santé", d: "Repérage et prise en charge du burnout, recommandations officielles." },
  { t: "Les troubles anxieux", u: "https://www.inserm.fr/dossier/troubles-anxieux/", s: "Inserm", d: "Anxiété généralisée, phobies, attaques de panique : ce que dit la recherche." },
  { t: "Dormir mieux : ce qui marche, ce qui ne marche pas", u: "https://www.inserm.fr/dossier/sommeil/", s: "Inserm", d: "Comprendre les cycles du sommeil et les leviers réellement efficaces." },
  { t: "Stress chronique et santé mentale", u: "https://www.santepubliquefrance.fr/maladies-et-traumatismes/sante-mentale", s: "Santé publique France", d: "Le rôle du stress prolongé dans l'apparition de troubles psychiques." },
  { t: "Trouver un thérapeute : comment s'y prendre", u: "https://www.psycom.org/sorienter/la-psychiatrie-et-la-sante-mentale/qui-fait-quoi-en-sante-mentale/", s: "Psycom", d: "Psychologue, psychiatre, psychothérapeute : qui fait quoi en santé mentale." },
  { t: "La dépression : repères et traitements", u: "https://www.ameli.fr/assure/sante/themes/depression/definition-facteurs-favorisants", s: "Ameli", d: "Définition, facteurs favorisants et parcours de soin remboursé." },
  { t: "Mon Soutien Psy : 12 séances prises en charge", u: "https://www.service-public.fr/particuliers/actualites/A16608", s: "Service public", d: "Le dispositif national qui permet d'accéder à un psychologue conventionné." },
  { t: "Méditation de pleine conscience : pour qui, pour quoi", u: "https://www.psycom.org/comprendre/la-sante-mentale/aborder-la-sante-mentale/mindfulness/", s: "Psycom", d: "Ce que la pleine conscience peut, et ne peut pas, apporter." },
];

function Articles() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-serif text-5xl mb-4">Lectures</h1>
      <p className="text-muted-foreground mb-12">Des sources fiables, des textes mesurés. Rien qui essaye de vous vendre quelque chose.</p>
      <div className="grid sm:grid-cols-2 gap-4">
        {ARTICLES.map((a) => (
          <a key={a.u} href={a.u} target="_blank" rel="noreferrer" className="block bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-shadow">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{a.s}</div>
            <div className="font-serif text-xl mb-2">{a.t}</div>
            <p className="text-sm text-muted-foreground">{a.d}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
