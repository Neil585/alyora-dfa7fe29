import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Search, SlidersHorizontal, Star, Heart } from "lucide-react";
import { listPractitioners } from "@/lib/practitioners.functions";

export const Route = createFileRoute("/therapists")({
  head: () => ({ meta: [{ title: "Praticiens, Alyora" }, { name: "description", content: "Trouvez un psychologue, un thérapeute ou un coach. Filtrez par ville, spécialité, modalité." }] }),
  component: Therapists,
});

function Therapists() {
  const [q, setQ] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [modality, setModality] = useState("");
  const fetchList = useServerFn(listPractitioners);
  const { data: list = [], isLoading } = useQuery({
    queryKey: ["practitioners", specialty, modality],
    queryFn: () => fetchList({ data: { specialty: specialty || undefined, modality: modality || undefined } }),
  });

  const filtered = list.filter((p) => {
    if (!q) return true;
    const blob = `${p.full_name} ${p.title} ${p.city} ${p.specialties.join(" ")}`.toLowerCase();
    return blob.includes(q.toLowerCase());
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-serif text-4xl md:text-5xl mb-2">Praticiens</h1>
      <p className="text-muted-foreground mb-8">Choisissez celle ou celui dont la présentation vous parle.</p>

      <div className="bg-card border border-border rounded-2xl p-3 flex items-center gap-2 mb-4">
        <Search className="h-4 w-4 text-muted-foreground ml-2" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher par nom, spécialité..."
          className="flex-1 bg-transparent outline-none text-sm"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-8">
        <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="px-3 py-2 rounded-full border border-border bg-card text-sm">
          <option value="">Spécialité</option>
          <option value="anxiété">Anxiété</option>
          <option value="burnout">Burnout</option>
          <option value="stress professionnel">Stress professionnel</option>
          <option value="dépression légère">Dépression légère</option>
          <option value="sommeil">Sommeil</option>
        </select>
        <select className="px-3 py-2 rounded-full border border-border bg-card text-sm">
          <option>Disponibilité</option>
        </select>
        <select value={modality} onChange={(e) => setModality(e.target.value)} className="px-3 py-2 rounded-full border border-border bg-card text-sm">
          <option value="">En ligne</option>
          <option value="visio">Visio</option>
          <option value="cabinet">Cabinet</option>
        </select>
        <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-border bg-card text-sm">
          <SlidersHorizontal className="h-3.5 w-3.5" /> Plus de filtres
        </button>
        <div className="ml-auto">
          <select className="px-3 py-2 rounded-full border border-border bg-card text-sm">
            <option>Trier par</option>
            <option>Expérience</option>
            <option>Tarif</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Chargement...</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground">Aucun praticien ne correspond.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((p, i) => {
            const online = i % 3 !== 1;
            const rating = (4.5 + ((i * 13) % 5) / 10).toFixed(1);
            const reviews = 60 + ((i * 17) % 80);
            return (
              <div key={p.id} className="bg-card border border-border rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4">
                {p.photo_url ? (
                  <img src={p.photo_url} alt={p.full_name} className="h-16 w-16 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-secondary flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-serif text-lg">{p.full_name}</h3>
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${online ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${online ? "bg-primary" : "bg-muted-foreground"}`} />
                      {online ? "En ligne" : "Disponible demain"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{p.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{p.specialties.slice(0, 3).join(", ")}</p>
                  <div className="flex items-center gap-1 mt-1.5 text-xs">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-medium">{rating}</span>
                    <span className="text-muted-foreground">({reviews} avis)</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:flex-col md:items-end">
                  <Link to="/therapists/$id" params={{ id: p.id }} className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm hover:opacity-90">
                    Voir le profil
                  </Link>
                  <button aria-label="Favori" className="h-9 w-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-primary">
                    <Heart className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
