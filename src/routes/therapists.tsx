import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listPractitioners } from "@/lib/practitioners.functions";

export const Route = createFileRoute("/therapists")({
  head: () => ({ meta: [{ title: "Praticiens , Alyora" }, { name: "description", content: "Trouvez un psychologue, un thérapeute ou un coach. Filtrez par ville, spécialité, modalité." }] }),
  component: Therapists,
});

function Therapists() {
  const [city, setCity] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [modality, setModality] = useState("");
  const fetchList = useServerFn(listPractitioners);
  const { data: list = [], isLoading } = useQuery({
    queryKey: ["practitioners", city, specialty, modality],
    queryFn: () => fetchList({ data: {
      city: city || undefined,
      specialty: specialty || undefined,
      modality: modality || undefined,
    }}),
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-serif text-5xl mb-3">Praticiens</h1>
      <p className="text-muted-foreground mb-10 max-w-2xl">Des psychologues, thérapeutes et coachs. Sans tri opaque. Choisissez celle ou celui dont la présentation vous parle.</p>

      <div className="grid sm:grid-cols-3 gap-3 mb-10">
        <input placeholder="Ville" value={city} onChange={(e) => setCity(e.target.value)} className="px-4 py-2.5 rounded-xl border border-border bg-card text-sm" />
        <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="px-4 py-2.5 rounded-xl border border-border bg-card text-sm">
          <option value="">Toutes les spécialités</option>
          <option value="anxiété">Anxiété</option>
          <option value="burnout">Burnout</option>
          <option value="stress professionnel">Stress professionnel</option>
          <option value="dépression légère">Dépression légère</option>
          <option value="sommeil">Sommeil</option>
          <option value="isolement">Isolement</option>
        </select>
        <select value={modality} onChange={(e) => setModality(e.target.value)} className="px-4 py-2.5 rounded-xl border border-border bg-card text-sm">
          <option value="">Cabinet ou visio</option>
          <option value="cabinet">Cabinet</option>
          <option value="visio">Visio</option>
        </select>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Chargement...</p>
      ) : list.length === 0 ? (
        <p className="text-muted-foreground">Aucun praticien ne correspond pour le moment.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {list.map((p) => (
            <Link key={p.id} to="/therapists/$id" params={{ id: p.id }} className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow flex gap-4">
              {p.photo_url && (
                <img src={p.photo_url} alt={p.full_name} className="h-20 w-20 rounded-full object-cover flex-shrink-0" loading="lazy" />
              )}
              <div className="min-w-0">
                <h3 className="font-serif text-xl">{p.full_name}</h3>
                <p className="text-sm text-muted-foreground">{p.title} · {p.city}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {p.specialties.slice(0, 3).map((s) => (
                    <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{s}</span>
                  ))}
                </div>
                <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{p.bio}</p>
                <p className="mt-2 text-xs text-muted-foreground">À partir de {p.price_eur} €</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
