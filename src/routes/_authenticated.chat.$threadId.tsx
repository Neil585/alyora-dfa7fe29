import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import ReactMarkdown from "react-markdown";
import { Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getThread, listThreads, createThread } from "@/lib/chat.functions";

export const Route = createFileRoute("/_authenticated/chat/$threadId")({
  component: ChatPage,
});

function ChatPage() {
  const { threadId } = Route.useParams();
  const fetchThread = useServerFn(getThread);
  const fetchThreads = useServerFn(listThreads);
  const newThread = useServerFn(createThread);
  const [token, setToken] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setToken(data.session?.access_token ?? null));
  }, []);

  const { data: threadData } = useQuery({
    queryKey: ["thread", threadId],
    queryFn: () => fetchThread({ data: { threadId } }),
  });
  const { data: threads = [] } = useQuery({ queryKey: ["threads"], queryFn: () => fetchThreads() });

  const initial: UIMessage[] = (threadData?.messages ?? []).map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant",
    parts: (m.parts as { type: string; text: string }[]) ?? [{ type: "text", text: m.content }],
  })) as UIMessage[];

  const transport = new DefaultChatTransport({
    api: "/api/chat",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: { threadId },
  });

  const { messages, sendMessage, status } = useChat({
    id: threadId,
    messages: initial,
    transport,
  });

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => { textareaRef.current?.focus(); }, [threadId]);
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

  return (
    <div className="mx-auto max-w-6xl px-6 py-6 grid md:grid-cols-[260px_1fr] gap-6 h-[calc(100vh-4rem)]">
      <aside className="hidden md:flex flex-col border-r border-border pr-4 overflow-y-auto">
        <button
          onClick={async () => { const t = await newThread({ data: {} }); window.location.href = `/chat/${t.id}`; }}
          className="mb-4 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm"
        >
          Nouvelle conversation
        </button>
        <div className="space-y-1">
          {threads.map((t) => (
            <Link key={t.id} to="/chat/$threadId" params={{ threadId: t.id }} className={`block px-3 py-2 rounded-lg text-sm hover:bg-secondary ${t.id === threadId ? "bg-secondary" : ""}`}>
              <div className="truncate">{t.title}</div>
              <div className="text-xs text-muted-foreground">{new Date(t.updated_at).toLocaleDateString("fr-FR")}</div>
            </Link>
          ))}
        </div>
      </aside>

      <section className="flex flex-col min-h-0">
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-5 pr-2">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <h2 className="font-serif text-2xl mb-2">Bonjour.</h2>
              <p className="text-muted-foreground">Dites-moi comment vous allez aujourd'hui.</p>
            </div>
          )}
          {messages.map((m) => {
            const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
            if (m.role === "user") {
              return (
                <div key={m.id} className="flex justify-end">
                  <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-4 py-2.5">{text}</div>
                </div>
              );
            }
            return (
              <div key={m.id} className="text-foreground leading-relaxed prose-chat max-w-[85%]">
                <ReactMarkdown
                  components={{
                    a: ({ href, children }) => href?.startsWith("/")
                      ? <Link to={href} className="underline text-primary">{children}</Link>
                      : <a href={href} target="_blank" rel="noreferrer" className="underline text-primary">{children}</a>,
                  }}
                >{text}</ReactMarkdown>
              </div>
            );
          })}
          {status === "submitted" && <div className="text-sm text-muted-foreground italic">Alyora réfléchit...</div>}
        </div>

        <form onSubmit={onSubmit} className="mt-4 border-t border-border pt-4 flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSubmit(e); } }}
            rows={1}
            placeholder="Écrivez..."
            className="flex-1 resize-none bg-secondary rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring max-h-40"
          />
          <button type="submit" disabled={isLoading || !input.trim()} className="h-11 w-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </form>
      </section>
    </div>
  );
}
