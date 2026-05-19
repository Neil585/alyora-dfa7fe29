import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const search = z.object({ mode: z.enum(["signin", "signup"]).optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: search,
  head: () => ({ meta: [{ title: "Connexion , Alyora" }] }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSignup, setIsSignup] = useState(mode === "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/app" });
  }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: name }, emailRedirectTo: `${window.location.origin}/app` },
        });
        if (error) throw error;
        toast.success("Compte créé. Bienvenue.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/app" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <h1 className="font-serif text-4xl mb-2">{isSignup ? "Créer un compte" : "Bon retour"}</h1>
        <p className="text-muted-foreground mb-8">{isSignup ? "Quelques infos suffisent pour commencer." : "Reprenez là où vous en étiez."}</p>
        <form onSubmit={submit} className="space-y-4">
          {isSignup && (
            <div>
              <label className="text-sm text-muted-foreground">Prénom</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          )}
          <div>
            <label className="text-sm text-muted-foreground">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Mot de passe</label>
            <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full px-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-primary-foreground rounded-full hover:opacity-90 disabled:opacity-50">
            {loading ? "..." : isSignup ? "Créer mon compte" : "Se connecter"}
          </button>
        </form>
        <button onClick={() => setIsSignup(!isSignup)} className="mt-6 w-full text-sm text-muted-foreground hover:text-foreground">
          {isSignup ? "J'ai déjà un compte" : "Je n'ai pas encore de compte"}
        </button>
      </div>
    </div>
  );
}
