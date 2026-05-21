import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Home, Activity, Lightbulb, Users, LayoutDashboard, Settings, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/alyora-mark.png";

const items = [
  { title: "Accueil", to: "/app", icon: Home, exact: true },
  { title: "Tracker", to: "/app/assessment", icon: Activity },
  { title: "Conseils", to: "/articles", icon: Lightbulb },
  { title: "Praticiens", to: "/therapists", icon: Users },
  { title: "Tableau de bord", to: "/app/history", icon: LayoutDashboard },
  { title: "Espace praticien", to: "/practitioner-space", icon: Settings },
] as const;

export function AppSidebar() {
  const { user } = useAuth();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();
  const [openMobile, setOpenMobile] = useState(false);

  const isActive = (to: string, exact?: boolean) => (exact ? pathname === to : pathname.startsWith(to));

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  const initials = (user?.user_metadata?.full_name || user?.email || "U").slice(0, 1).toUpperCase();

  const navList = (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {items.map((it) => {
        const active = isActive(it.to, "exact" in it ? it.exact : false);
        return (
          <Link
            key={it.to}
            to={it.to}
            onClick={() => setOpenMobile(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
              active ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <it.icon className="h-4 w-4" />
            <span>{it.title}</span>
          </Link>
        );
      })}
    </nav>
  );

  const profile = (
    <div className="border-t border-border p-3 flex items-center gap-3">
      <div className="h-9 w-9 rounded-full bg-primary/15 text-primary flex items-center justify-center font-medium">{initials}</div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium truncate">{user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Mon profil"}</div>
        <button onClick={signOut} className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
          <LogOut className="h-3 w-3" /> Se déconnecter
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-30 bg-background/90 backdrop-blur border-b border-border flex items-center justify-between px-4 h-14">
        <Link to="/app" className="flex items-center gap-2">
          <img src={logo} alt="Alyora" className="h-7 w-7" />
          <span className="font-serif text-xl">alyora</span>
        </Link>
        <button onClick={() => setOpenMobile((v) => !v)} className="p-2" aria-label="Menu">
          {openMobile ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {openMobile && (
        <div className="md:hidden fixed inset-0 z-40 bg-background flex flex-col pt-14">
          {navList}
          {profile}
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 lg:w-72 flex-col border-r border-border bg-card sticky top-0 h-screen">
        <Link to="/app" className="flex items-center gap-2 px-5 h-16 border-b border-border">
          <img src={logo} alt="Alyora" className="h-8 w-8" />
          <span className="font-serif text-2xl tracking-tight">alyora</span>
        </Link>
        {navList}
        {profile}
      </aside>
    </>
  );
}
