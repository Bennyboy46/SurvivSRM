"use client";

import { KeyboardEvent, useRef } from "react";

interface ChatInputProps {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  disabled?: boolean;
}

export default function ChatInput({ value, onChange, onSend, disabled }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim()) onSend();
    }
  }

  function handleInput() {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  }

  return (
    <div
      className="glass-card"
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: "0.75rem",
        padding: "0.8rem",
        borderRadius: "22px",
      }}
    >
      <textarea
        id="chatInput"
        ref={textareaRef}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          handleInput();
        }}
        onKeyDown={handleKeyDown}
        placeholder="Ask about your attendance, marks, or timetable…"
        disabled={disabled}
        rows={1}
        className="text-input"
        style={{
          flex: 1,
          resize: "none",
          background: "transparent",
          border: "none",
          outline: "none",
          lineHeight: "1.5",
          padding: "0.2rem 0.35rem",
          fontFamily: "inherit",
          minHeight: "24px",
          maxHeight: "160px",
          overflowY: "auto",
          caretColor: "var(--accent)",
        }}
      />
      <button
        id="sendBtn"
        onClick={onSend}
        disabled={disabled || !value.trim()}
        aria-label="Send message"
        className={disabled || !value.trim() ? "btn-ghost" : "btn-primary"}
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "14px",
          border: "none",
          color: disabled || !value.trim() ? "var(--text-muted)" : "white",
          cursor: disabled || !value.trim() ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </div>
  );
}
