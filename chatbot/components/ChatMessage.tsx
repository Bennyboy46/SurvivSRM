"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export interface Message {
  id: string;
  role: "user" | "assistant" | "error";
  content: string;
}

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isError = message.role === "error";

  return (
    <div
      className={`animate-fade-up message-row ${isUser ? "message-row--user" : ""}`}
    >
      {!isUser && (
        <div
          className={`message-avatar ${isError ? "message-avatar--error" : "message-avatar--assistant"}`}
        >
          {isError ? "!" : <span aria-hidden style={{ width: "0.5rem", height: "0.5rem", borderRadius: "999px", background: "rgba(255,255,255,0.9)" }} />}
        </div>
      )}

      <div
        className={`msg-content message-bubble ${isUser ? "message-bubble--user" : ""} ${isError ? "message-bubble--error" : ""}`}
      >
        {isUser ? (
          <span style={{ whiteSpace: "pre-wrap" }}>{message.content}</span>
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => (
                <p style={{ margin: "0 0 0.65rem", lineHeight: "1.72" }}>{children}</p>
              ),
              strong: ({ children }) => (
                <strong style={{ color: "var(--accent)", fontWeight: 600 }}>{children}</strong>
              ),
              em: ({ children }) => (
                <em style={{ color: "var(--accent-secondary)" }}>{children}</em>
              ),
              h1: ({ children }) => (
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--accent)", margin: "0.8rem 0 0.35rem" }}>{children}</h2>
              ),
              h2: ({ children }) => (
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--accent-secondary)", margin: "0.7rem 0 0.3rem" }}>{children}</h3>
              ),
              h3: ({ children }) => (
                <h4 style={{ fontSize: "0.95rem", fontWeight: 600, color: "#74c5ed", margin: "0.55rem 0 0.25rem" }}>{children}</h4>
              ),
              ul: ({ children }) => (
                <ul style={{ paddingLeft: "1.25rem", margin: "0.35rem 0", listStyleType: "disc" }}>{children}</ul>
              ),
              ol: ({ children }) => (
                <ol style={{ paddingLeft: "1.25rem", margin: "0.35rem 0" }}>{children}</ol>
              ),
              li: ({ children }) => (
                <li style={{ marginBottom: "0.25rem", lineHeight: "1.55" }}>{children}</li>
              ),
              code: ({ children, className }) => {
                const isBlock = !!className;
                return isBlock ? (
                  <code style={{ display: "block", fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.82rem", color: "#c9ecff" }}>
                    {children}
                  </code>
                ) : (
                  <code style={{ fontFamily: "'IBM Plex Mono', monospace", background: "rgba(20,32,48,0.85)", padding: "0.14em 0.4em", borderRadius: "6px", fontSize: "0.83em", color: "#74c5ed" }}>
                    {children}
                  </code>
                );
              },
              pre: ({ children }) => (
                <pre style={{ background: "rgba(2, 8, 20, 0.58)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "0.9rem 1rem", overflowX: "auto", margin: "0.55rem 0", fontSize: "0.85rem" }}>
                  {children}
                </pre>
              ),
              blockquote: ({ children }) => (
                <blockquote style={{ borderLeft: "3px solid var(--accent)", paddingLeft: "0.85rem", margin: "0.55rem 0", color: "var(--text-secondary)", fontStyle: "italic" }}>
                  {children}
                </blockquote>
              ),
              hr: () => (
                <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.08)", margin: "0.8rem 0" }} />
              ),
              table: ({ children }) => (
                <div style={{ overflowX: "auto", margin: "0.65rem 0" }}>
                  <table style={{ borderCollapse: "collapse", width: "100%", fontSize: "0.85rem" }}>
                    {children}
                  </table>
                </div>
              ),
              thead: ({ children }) => <thead>{children}</thead>,
              tbody: ({ children }) => <tbody>{children}</tbody>,
              tr: ({ children }) => <tr>{children}</tr>,
              th: ({ children }) => (
                <th style={{ border: "1px solid rgba(255,255,255,0.08)", padding: "0.45rem 0.75rem", background: "rgba(0,180,216,0.14)", color: "#c9ecff", fontWeight: 600, textAlign: "left", whiteSpace: "nowrap" }}>
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td style={{ border: "1px solid rgba(255,255,255,0.06)", padding: "0.45rem 0.75rem", textAlign: "left" }}>
                  {children}
                </td>
              ),
              a: ({ href, children }) => (
                <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", textDecoration: "underline", textUnderlineOffset: "2px" }}>
                  {children}
                </a>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}

// Typing indicator shown while fetching
export function TypingIndicator() {
  return (
    <div
      className="animate-fade-in message-row"
    >
      <div
        className="message-avatar message-avatar--assistant"
      >
        <span aria-hidden style={{ width: "0.5rem", height: "0.5rem", borderRadius: "999px", background: "rgba(255,255,255,0.9)" }} />
      </div>
      <div
        className="message-bubble"
        style={{ display: "flex", gap: "6px", alignItems: "center" }}
      >
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}
