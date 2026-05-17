import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SECTIONS, type Answers } from "@/lib/questionnaire";
import { saveAssessment } from "@/lib/assessment.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/assessment")({
  head: () => ({ meta: [{ title: "Faire le point — Alyora" }] }),
  component: Assessment,
});

function Assessment() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const save = useServerFn(saveAssessment);

  const m = useMutation({
    mutationFn: () => save({ data: { answers } }),
    onSuccess: () => { toast.success("Dossier enregistré."); navigate({ to: "/app/history" }); },
    onError: (e) => toast.error(e.message),
  });

  const section = SECTIONS[step];
  const isLast = step === SECTIONS.length - 1;
  const allAnswered = section.questions.every((q) => answers[q.id] !== undefined);

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="text-xs text-muted-foreground mb-2">Étape {step + 1} sur {SECTIONS.length}</div>
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
                  <button key={o.value} onClick={() => setAnswers({ ...answers, [q.id]: o.value })}
                    className={`px-3 py-2.5 rounded-xl text-sm border transition-colors ${selected ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}>
                    {o.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-between">
        <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="px-5 py-2.5 rounded-full border border-border disabled:opacity-40">
          Précédent
        </button>
        {isLast ? (
          <button onClick={() => m.mutate()} disabled={!allAnswered || m.isPending} className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground disabled:opacity-40">
            {m.isPending ? "Enregistrement..." : "Valider mon dossier"}
          </button>
        ) : (
          <button onClick={() => setStep(step + 1)} disabled={!allAnswered} className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground disabled:opacity-40">
            Suivant
          </button>
        )}
      </div>
    </div>
  );
}
