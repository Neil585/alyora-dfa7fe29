import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/alyora-mark.png";

export function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const signOut = async () => {
    await supabase.auth.signOut();
    setOpen(false);
    navigate({ to: "/" });
  };

  const close = () => setOpen(false);

  return (
    <header className="border-b border-border/60 bg-background/80 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <Link to={user ? "/app" : "/"} className="flex items-center gap-2" onClick={close}>
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

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <button onClick={signOut} className="text-sm text-muted-foreground hover:text-foreground">
              Se déconnecter
            </button>
          ) : (
            <>
              <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground">
                Se connecter
              </Link>
              <Link to="/auth" search={{ mode: "signup" }} className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-full hover:opacity-90 transition-opacity">
                Commencer
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden p-2 -mr-2 text-foreground"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur">
          <nav className="px-6 py-4 flex flex-col gap-1 text-sm">
            <Link to="/therapists" onClick={close} className="py-2 text-muted-foreground hover:text-foreground">Praticiens</Link>
            <Link to="/articles" onClick={close} className="py-2 text-muted-foreground hover:text-foreground">Lectures</Link>
            {user && <Link to="/app" onClick={close} className="py-2 text-muted-foreground hover:text-foreground">Mon espace</Link>}
            <div className="h-px bg-border/60 my-2" />
            {user ? (
              <button onClick={signOut} className="py-2 text-left text-muted-foreground hover:text-foreground">
                Se déconnecter
              </button>
            ) : (
              <>
                <Link to="/auth" onClick={close} className="py-2 text-muted-foreground hover:text-foreground">Se connecter</Link>
                <Link to="/auth" search={{ mode: "signup" }} onClick={close} className="py-2 text-primary font-medium">Commencer</Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
