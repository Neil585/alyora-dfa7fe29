import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getPractitioner } from "@/lib/practitioners.functions";

export const Route = createFileRoute("/therapists/$id")({
  component: PractitionerPage,
});

function PractitionerPage() {
  const { id } = Route.useParams();
  const fetchOne = useServerFn(getPractitioner);
  const { data: p, isLoading } = useQuery({
    queryKey: ["practitioner", id],
    queryFn: () => fetchOne({ data: { id } }),
  });

  if (isLoading) return <div className="p-12 text-center text-muted-foreground">Chargement...</div>;
  if (!p) return <div className="p-12 text-center">Introuvable.</div>;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link to="/therapists" className="text-sm text-muted-foreground hover:text-foreground">← Tous les praticiens</Link>
      <div className="mt-6 flex gap-6 items-start">
        {p.photo_url && <img src={p.photo_url} alt={p.full_name} className="h-32 w-32 rounded-full object-cover" />}
        <div>
          <h1 className="font-serif text-4xl">{p.full_name}</h1>
          <p className="text-muted-foreground mt-1">{p.title} · {p.city}, {p.country}</p>
          <p className="text-sm text-muted-foreground mt-1">{p.years_experience} ans de pratique · à partir de {p.price_eur} €</p>
        </div>
      </div>

      <div className="mt-10 space-y-8">
        <section>
          <h2 className="font-serif text-2xl mb-3">Présentation</h2>
          <p className="text-foreground leading-relaxed whitespace-pre-line">{p.bio}</p>
        </section>
        {p.approach && (
          <section>
            <h2 className="font-serif text-2xl mb-3">Approche</h2>
            <p className="text-foreground leading-relaxed">{p.approach}</p>
          </section>
        )}
        <section>
          <h2 className="font-serif text-2xl mb-3">Spécialités</h2>
          <div className="flex flex-wrap gap-2">{p.specialties.map((s) => <span key={s} className="text-sm px-3 py-1 rounded-full bg-secondary">{s}</span>)}</div>
        </section>
        <section className="grid sm:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm uppercase tracking-wider text-muted-foreground mb-2">Modalités</h3>
            <p>{p.modalities.join(", ")}</p>
          </div>
          <div>
            <h3 className="text-sm uppercase tracking-wider text-muted-foreground mb-2">Langues</h3>
            <p>{p.languages.join(", ")}</p>
          </div>
        </section>
        <div className="pt-6">
          <button className="px-6 py-3 bg-primary text-primary-foreground rounded-full">Demander un premier rendez-vous</button>
          <p className="text-xs text-muted-foreground mt-3">Le système de réservation sera disponible prochainement.</p>
        </div>
      </div>
    </div>
  );
}
