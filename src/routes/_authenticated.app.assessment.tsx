import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SECTIONS, type Answers } from "@/lib/questionnaire";
import { saveAssessment } from "@/lib/assessment.functions";
import { createThread } from "@/lib/chat.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/assessment")({
  head: () => ({ meta: [{ title: "Faire le point — Alyora" }] }),
  component: Assessment,
});

type SavedRow = Awaited<ReturnType<typeof saveAssessment>>;

function Assessment() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [result, setResult] = useState<SavedRow | null>(null);
  const save = useServerFn(saveAssessment);
  const newThread = useServerFn(createThread);

  const m = useMutation({
    mutationFn: () => save({ data: { answers } }),
    onSuccess: (row) => {
      toast.success("Dossier enregistré.");
      setResult(row);
    },
    onError: (e) => toast.error(e.message),
  });

  const discuss = useMutation({
    mutationFn: () =>
      newThread({
        data: { title: `Bilan du ${new Date().toLocaleDateString("fr-FR")}` },
      }),
    onSuccess: (t) => navigate({ to: "/chat/$threadId", params: { threadId: t.id } }),
    onError: (e) => toast.error(e.message),
  });

  // === Result screen ===
  if (result) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
          Votre bilan
        </div>
        <h1 className="font-serif text-4xl mb-6">Voici ce qui ressort.</h1>
        <p className="leading-relaxed text-lg mb-8">{result.summary}</p>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm mb-8">
          {[
            { label: "Moral", value: result.phq9_score, max: 27 },
            { label: "Anxiété", value: result.gad7_score, max: 21 },
            { label: "Burnout", value: result.burnout_score, max: 12 },
            { label: "Stress", value: result.stress_score, max: 9 },
            { label: "Sommeil", value: result.sleep_score, max: 9 },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-2xl p-4">
              <div className="text-xs text-muted-foreground">{s.label}</div>
              <div className="font-serif text-2xl mt-1">
                {s.value}
                <span className="text-sm text-muted-foreground">/{s.max}</span>
              </div>
            </div>
          ))}
        </div>

        {result.categories.length > 0 && (
          <div className="mb-8">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Points à regarder
            </div>
            <div className="flex flex-wrap gap-2">
              {result.categories.map((c) => (
                <span
                  key={c}
                  className="text-sm px-3 py-1 rounded-full bg-accent text-accent-foreground"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="bg-secondary/50 border border-border rounded-2xl p-5 mb-8 text-sm text-muted-foreground">
          Ceci n'est pas un diagnostic médical. C'est un repère, basé sur des
          questionnaires reconnus (PHQ-9, GAD-7), pour vous aider à mettre des
          mots sur ce que vous vivez.
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => discuss.mutate()}
            disabled={discuss.isPending}
            className="flex-1 px-5 py-3 rounded-full bg-primary text-primary-foreground disabled:opacity-50"
          >
            {discuss.isPending ? "Ouverture..." : "En parler avec Alyora"}
          </button>
          <Link
            to="/app/history"
            className="flex-1 text-center px-5 py-3 rounded-full border border-border hover:bg-secondary"
          >
            Voir mon évolution
          </Link>
        </div>

        {result.categories.length > 0 && (
          <Link
            to="/therapists"
            className="block mt-4 text-sm text-center text-muted-foreground underline"
          >
            Voir des praticiens spécialisés
          </Link>
        )}
      </div>
    );
  }

  // === Questionnaire ===
  const section = SECTIONS[step];
  const isLast = step === SECTIONS.length - 1;
  const allAnswered = section.questions.every((q) => answers[q.id] !== undefined);
  const progress = ((step + (allAnswered ? 1 : 0)) / SECTIONS.length) * 100;

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
        <span>Étape {step + 1} sur {SECTIONS.length}</span>
        <span>{Math.round(progress)} %</span>
      </div>
      <div className="h-1 bg-secondary rounded-full overflow-hidden mb-8">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <h1 className="font-serif text-3xl mb-2">{section.title}</h1>
      <p className="text-muted-foreground mb-8">{section.description}</p>

      <div className="space-y-6">
        {section.questions.map((q) => (
          <div key={q.id} className="bg-card border border-border rounded-2xl p-5">
            <p className="mb-4">{q.label}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {q.options.map((o) => {
                const selected = answers[q.id] === o.value;
                return (
                  <button
                    key={o.value}
                    onClick={() => setAnswers({ ...answers, [q.id]: o.value })}
                    className={`px-3 py-2.5 rounded-xl text-sm border transition-colors ${
                      selected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:bg-secondary"
                    }`}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="px-5 py-2.5 rounded-full border border-border disabled:opacity-40"
        >
          Précédent
        </button>
        {isLast ? (
          <button
            onClick={() => m.mutate()}
            disabled={!allAnswered || m.isPending}
            className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground disabled:opacity-40"
          >
            {m.isPending ? "Enregistrement..." : "Voir mon bilan"}
          </button>
        ) : (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!allAnswered}
            className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground disabled:opacity-40"
          >
            Suivant
          </button>
        )}
      </div>
    </div>
  );
}
