import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import ReactMarkdown from "react-markdown";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Link, useLocation } from "@tanstack/react-router";

export function ChatPopup() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const location = useLocation();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setToken(data.session?.access_token ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) =>
      setToken(s?.access_token ?? null),
    );
    return () => subscription.unsubscribe();
  }, [user?.id]);

  const transport = new DefaultChatTransport({
    api: "/api/chat",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  const { messages, sendMessage, status } = useChat({
    id: "popup",
    transport,
    messages: [
      {
        id: "welcome",
        role: "assistant",
        parts: [
          {
            type: "text",
            text: user
              ? "Bonjour, je suis Alyora Genius. Comment ça va, ces jours-ci ? On peut parler de ce que vous avez en tête, ou je peux vous orienter dans l'application."
              : "Bonjour, je suis Alyora Genius. Vous pouvez me poser une question, ou créer un compte pour que je garde le fil avec vous.",
          },
        ],
      } as UIMessage,
    ],
  });

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (open) setTimeout(() => textareaRef.current?.focus(), 100);
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input.trim() });
    setInput("");
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  // Hide popup on the full chat page to avoid double UI
  if (location.pathname.startsWith("/chat/")) return null;

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
          aria-label="Ouvrir la conversation"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[min(92vw,400px)] h-[min(80vh,600px)] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/50">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <div>
                <div className="font-serif text-lg leading-none">Alyora Genius</div>
                <div className="text-xs text-muted-foreground mt-0.5">À votre écoute</div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.map((m) => {
              const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
              if (m.role === "user") {
                return (
                  <div key={m.id} className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-4 py-2.5 text-sm">
                      {text}
                    </div>
                  </div>
                );
              }
              return (
                <div key={m.id} className="text-sm text-foreground prose-chat">
                  <ReactMarkdown
                    components={{
                      a: ({ href, children }) => {
                        if (href && href.startsWith("/")) {
                          return (
                            <Link to={href} className="underline text-primary">
                              {children}
                            </Link>
                          );
                        }
                        return (
                          <a href={href} target="_blank" rel="noreferrer" className="underline text-primary">
                            {children}
                          </a>
                        );
                      },
                    }}
                  >
                    {text}
                  </ReactMarkdown>
                </div>
              );
            })}
            {status === "submitted" && (
              <div className="text-sm text-muted-foreground italic">Alyora réfléchit...</div>
            )}
          </div>

          {!user && (
            <div className="px-4 py-2 text-xs text-muted-foreground border-t border-border">
              <Link to="/auth" className="underline">Créez un compte</Link> pour garder l'historique.
            </div>
          )}

          <form onSubmit={onSubmit} className="border-t border-border p-3 flex gap-2 items-end">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSubmit(e);
                }
              }}
              rows={1}
              placeholder={user ? "Écrivez ce que vous voulez..." : "Connectez-vous pour parler"}
              disabled={!user || isLoading}
              className="flex-1 resize-none bg-secondary rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring max-h-32"
            />
            <button
              type="submit"
              disabled={!user || isLoading || !input.trim()}
              className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 hover:opacity-90"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
