import { useEffect } from "react";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "sonner";
import { Header } from "@/components/Header";
import { ChatPopup } from "@/components/ChatPopup";
import { supabase } from "@/integrations/supabase/client";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-6xl">404</h1>
        <p className="mt-2 text-muted-foreground">Cette page n'existe pas.</p>
        <Link to="/" className="mt-6 inline-block underline">Retour à l'accueil</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-3xl">Quelque chose s'est mal passé</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button onClick={() => { router.invalidate(); reset(); }} className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-full">
          Réessayer
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Alyora , Soutien psychologique au quotidien" },
      { name: "description", content: "Faites le point, suivez votre évolution, et trouvez un praticien qui vous corresponde. Un compagnon doux, jamais un diagnostic." },
      { property: "og:title", content: "Alyora , Soutien psychologique au quotidien" },
      { name: "twitter:title", content: "Alyora , Soutien psychologique au quotidien" },
      { property: "og:description", content: "Faites le point, suivez votre évolution, et trouvez un praticien qui vous corresponde. Un compagnon doux, jamais un diagnostic." },
      { name: "twitter:description", content: "Faites le point, suivez votre évolution, et trouvez un praticien qui vous corresponde. Un compagnon doux, jamais un diagnostic." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/eb9245ef-7ca5-4252-b7d0-d04891f44269/id-preview-4d5a5820--2af8822d-74fc-4b8f-9995-e0ca1198bf90.lovable.app-1779034615005.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/eb9245ef-7ca5-4252-b7d0-d04891f44269/id-preview-4d5a5820--2af8822d-74fc-4b8f-9995-e0ca1198bf90.lovable.app-1779034615005.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function AuthSync() {
  const router = useRouter();
  const qc = useQueryClient();
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      router.invalidate();
      qc.invalidateQueries();
    });
    return () => subscription.unsubscribe();
  }, [router, qc]);
  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const pathname = router.state.location.pathname;
  const hideHeader = pathname.startsWith("/app") || pathname.startsWith("/practitioner-space") || pathname.startsWith("/chat/");
  return (
    <QueryClientProvider client={queryClient}>
      <AuthSync />
      <div className="min-h-screen flex flex-col">
        {!hideHeader && <Header />}
        <main className="flex-1"><Outlet /></main>
      </div>
      <ChatPopup />
      <Toaster position="top-center" />
    </QueryClientProvider>
  );
}
