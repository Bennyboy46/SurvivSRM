"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ChatMessage, { Message, TypingIndicator } from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import DayOrderNavbar from "@/components/DayOrderNavbar";

type TimetableSlot = {
  code?: string;
  name?: string;
  slot?: string;
};

type TimetableDay = {
  day?: number;
  table?: Array<TimetableSlot | null>;
};

interface ChatClientProps {
  schedule?: TimetableDay[];
  batch?: string;
}

const SUGGESTIONS = [
  "Can I bunk tomorrow without getting detained? 🙏",
  "How screwed is my attendance rn?",
  "Which subject is ruining my life the most?",
  "Is there any chance I can pass this sem? 😢",
];

export default function ChatClient({ schedule = [], batch }: ChatClientProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesPaneRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);

  useEffect(() => {
    if (!stickToBottomRef.current) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  const sendMessage = useCallback(async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: msg,
    };

    setMessages((prev) => [...prev, userMsg]);
    stickToBottomRef.current = true;
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/q", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ m: msg }),
      });

      const data = (await res.json()) as { r?: string };

      if (res.status === 401) {
        router.replace("/");
        return;
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: res.ok ? "assistant" : "error",
        content: data.r ?? "Request failed",
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "error",
          content: "Request failed",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, router]);

  async function logout() {
    try {
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ a: "logout" }),
      });
    } finally {
      router.replace("/");
    }
  }

  function handleMessagesScroll() {
    const pane = messagesPaneRef.current;
    if (!pane) return;

    const distanceFromBottom = pane.scrollHeight - pane.scrollTop - pane.clientHeight;
    stickToBottomRef.current = distanceFromBottom < 120;
  }

  const isEmpty = messages.length === 0;

  return (
    <main className="page-shell aurora-shell">
      <div aria-hidden>
        <div className="orb orb--teal" style={{ top: "-6rem", left: "-4rem", width: "22rem", height: "22rem" }} />
        <div className="orb orb--amber" style={{ right: "-8rem", bottom: "-10rem", width: "28rem", height: "28rem" }} />
      </div>

      <div className="chat-layout">
        <header className="glass-card chat-header animate-fade-in" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.9rem", minWidth: 0 }}>
            <div style={{ width: "3.05rem", height: "3.05rem", display: "grid", placeItems: "center", flexShrink: 0 }}>
              <Image src="/logo-minimal.svg" alt="SurvivSRM logo" width={46} height={46} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="eyebrow" style={{ fontSize: "0.82rem", marginBottom: "0.1rem" }}>SurvivSRM</div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                {batch ? `Batch ${batch}` : "Batch detected from backend"}
              </div>
            </div>
          </div>

          <button id="logoutBtn" onClick={logout} className="btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", padding: "0.6rem 0.9rem" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign out
          </button>
        </header>

        <DayOrderNavbar schedule={schedule} batch={batch} />

        <section className="chat-stage glass-card animate-fade-up">
          <div className="chat-area">
            <div className="mini-divider" />

            <div id="messagesArea" ref={messagesPaneRef} onScroll={handleMessagesScroll} className="chat-surface">
              {isEmpty && (
                <div className="chat-empty animate-fade-in">
                  <div className="chat-empty-card">
                    <div style={{ marginBottom: "1.35rem" }}>
                      <div style={{ width: "4.5rem", height: "4.5rem", margin: "0 auto 1rem", display: "grid", placeItems: "center" }}>
                        <Image src="/logo-minimal.svg" alt="SurvivSRM logo" width={68} height={68} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                      </div>
                      <div className="eyebrow" style={{ marginBottom: "0.5rem" }}>Ready when you are</div>
                      <h2 style={{ fontSize: "clamp(1.4rem, 2vw, 2rem)", fontWeight: 700, marginBottom: "0.4rem" }}>
                        Ask the one thing Academia never tells you straight.
                      </h2>
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.65, maxWidth: "42rem", margin: "0 auto" }}>
                        Start with attendance, marks, or timetable questions.
                      </p>
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.7rem", justifyContent: "center", maxWidth: "42rem", margin: "0 auto" }}>
                      {SUGGESTIONS.map((s, i) => (
                        <button key={i} onClick={() => sendMessage(s)} className="chip chip--solid" style={{ whiteSpace: "nowrap" }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div style={{ padding: "1.15rem 1.15rem 0.5rem", minHeight: 0 }}>
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
                ))}

                {loading && <TypingIndicator />}

                <div ref={bottomRef} />
              </div>
            </div>

            <div className="chat-dock">
              <ChatInput
                value={input}
                onChange={setInput}
                onSend={() => sendMessage()}
                disabled={loading}
              />
              <p className="chat-caption" style={{ marginTop: "0.75rem" }}>
                Data fetched live from SRM Academia · Never stored on our servers
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
