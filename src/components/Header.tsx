import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/alyora-mark.png";

export function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <header className="border-b border-border/60 bg-background/80 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Alyora" className="h-10 w-10" />
          <span className="font-serif text-2xl tracking-tight">Alyora</span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
          <Link to="/therapists" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>
            Praticiens
          </Link>
          <Link to="/articles" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>
            Lectures
          </Link>
          {user && (
            <Link to="/app" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>
              Mon espace
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <button
              onClick={signOut}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Se déconnecter
            </button>
          ) : (
            <>
              <Link
                to="/auth"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Se connecter
              </Link>
              <Link
                to="/auth"
                search={{ mode: "signup" }}
                className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
              >
                Commencer
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
