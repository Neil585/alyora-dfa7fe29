// Questionnaire d'évaluation inspiré des instruments validés
// PHQ-9 (dépression), GAD-7 (anxiété), MBI (burnout), PSS (stress), qualité du sommeil
// Ce n'est pas un diagnostic médical, juste un repère de scoring.

export type QuestionScale = {
  id: string;
  label: string;
  options: { label: string; value: number }[];
};

const FREQ_OPTIONS = [
  { label: "Jamais", value: 0 },
  { label: "Quelques jours", value: 1 },
  { label: "Plus de la moitié des jours", value: 2 },
  { label: "Presque tous les jours", value: 3 },
];

export type Section = {
  key: "phq9" | "gad7" | "burnout" | "stress" | "sleep";
  title: string;
  description: string;
  questions: QuestionScale[];
};

export const SECTIONS: Section[] = [
  {
    key: "phq9",
    title: "Ces dernières semaines",
    description:
      "Pensez aux deux dernières semaines. À quelle fréquence avez-vous été gêné par ce qui suit ?",
    questions: [
      "Peu d'intérêt ou de plaisir à faire les choses",
      "Sentiment d'être triste, déprimé ou désespéré",
      "Difficultés à dormir ou sommeil trop long",
      "Fatigue ou manque d'énergie",
      "Manque d'appétit ou trop manger",
      "Mauvaise opinion de vous-même",
      "Difficultés à se concentrer",
      "Lenteur ou agitation visible",
      "Pensées qu'il vaudrait mieux que vous soyez mort",
    ].map((label, i) => ({ id: `phq9_${i}`, label, options: FREQ_OPTIONS })),
  },
  {
    key: "gad7",
    title: "Anxiété",
    description:
      "Toujours sur les deux dernières semaines, à quelle fréquence avez-vous été gêné par ce qui suit ?",
    questions: [
      "Se sentir nerveux ou tendu",
      "Être incapable d'arrêter de s'inquiéter",
      "S'inquiéter trop à propos de différentes choses",
      "Avoir du mal à se détendre",
      "Être tellement agité qu'il est difficile de rester en place",
      "Devenir facilement contrarié ou irritable",
      "Avoir peur que quelque chose de terrible arrive",
    ].map((label, i) => ({ id: `gad7_${i}`, label, options: FREQ_OPTIONS })),
  },
  {
    key: "burnout",
    title: "Énergie au travail",
    description: "Comment vous sentez-vous par rapport à votre travail ou vos études en ce moment ?",
    questions: [
      "Je me sens vidé à la fin de la journée",
      "Je dois faire un effort pour m'investir dans ce que je fais",
      "Je me sens cynique par rapport à mon travail",
      "Mes performances ont baissé",
    ].map((label, i) => ({ id: `burnout_${i}`, label, options: FREQ_OPTIONS })),
  },
  {
    key: "stress",
    title: "Stress quotidien",
    description: "Ces dernières semaines, à quelle fréquence avez-vous ressenti ce qui suit ?",
    questions: [
      "J'ai eu l'impression que les choses échappaient à mon contrôle",
      "Je me suis senti dépassé par ce que j'avais à faire",
      "J'ai eu du mal à faire face aux choses du quotidien",
    ].map((label, i) => ({ id: `stress_${i}`, label, options: FREQ_OPTIONS })),
  },
  {
    key: "sleep",
    title: "Sommeil",
    description: "Et côté sommeil ?",
    questions: [
      "J'ai eu du mal à m'endormir",
      "Je me suis réveillé pendant la nuit",
      "Je me suis réveillé fatigué le matin",
    ].map((label, i) => ({ id: `sleep_${i}`, label, options: FREQ_OPTIONS })),
  },
];

export type Answers = Record<string, number>;

export function computeScores(answers: Answers) {
  const sum = (prefix: string) =>
    Object.entries(answers)
      .filter(([k]) => k.startsWith(prefix))
      .reduce((acc, [, v]) => acc + (v ?? 0), 0);

  return {
    phq9_score: sum("phq9_"),
    gad7_score: sum("gad7_"),
    burnout_score: sum("burnout_"),
    stress_score: sum("stress_"),
    sleep_score: sum("sleep_"),
  };
}

export type Category =
  | "anxiété"
  | "dépression légère"
  | "burnout"
  | "stress professionnel"
  | "sommeil"
  | "fatigue mentale";

export function deriveCategories(s: ReturnType<typeof computeScores>): Category[] {
  const cats: Category[] = [];
  if (s.gad7_score >= 8) cats.push("anxiété");
  if (s.phq9_score >= 10) cats.push("dépression légère");
  if (s.burnout_score >= 6) cats.push("burnout");
  if (s.stress_score >= 5) cats.push("stress professionnel");
  if (s.sleep_score >= 5) cats.push("sommeil");
  if (s.phq9_score >= 5 && s.burnout_score >= 4) cats.push("fatigue mentale");
  return cats;
}

export function buildSummary(s: ReturnType<typeof computeScores>, cats: Category[]) {
  const parts: string[] = [];
  const sev = (n: number, low: number, mid: number) =>
    n < low ? "léger" : n < mid ? "modéré" : "marqué";
  parts.push(`Indice de baisse de moral : ${sev(s.phq9_score, 5, 15)} (${s.phq9_score}/27).`);
  parts.push(`Indice d'anxiété : ${sev(s.gad7_score, 5, 15)} (${s.gad7_score}/21).`);
  parts.push(`Tension au travail : ${sev(s.burnout_score, 4, 9)} (${s.burnout_score}/12).`);
  if (cats.length) {
    parts.push(`Points qui semblent mériter de l'attention : ${cats.join(", ")}.`);
  } else {
    parts.push("Aucun signal fort ne ressort cette fois.");
  }
  return parts.join(" ");
}
