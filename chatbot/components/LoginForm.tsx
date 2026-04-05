"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [netId, setNetId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ u: netId, p: password }),
      });

      const data = await res.json();

      if (!data.success) {
        setError("Request failed");
        setLoading(false);
        return;
      }

      router.push("/chat");
    } catch {
      setError("Request failed");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
      <div className="field">
        <label htmlFor="netId" className="field-label">
          Net ID
        </label>
        <input
          id="netId"
          type="text"
          value={netId}
          onChange={(e) => setNetId(e.target.value)}
          placeholder="bb6767@srmist.edu.in"
          required
          autoComplete="username"
          className="text-input input-glow"
        />
      </div>

      <div className="field">
        <label htmlFor="password" className="field-label">
          Password
        </label>
        <div style={{ position: "relative" }}>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
            className="text-input input-glow"
            style={{ paddingRight: "2.9rem" }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="btn-ghost"
            style={{
              position: "absolute",
              right: "0.45rem",
              top: "50%",
              transform: "translateY(-50%)",
              width: "2.1rem",
              height: "2.1rem",
              borderRadius: "10px",
              display: "grid",
              placeItems: "center",
              padding: 0,
            }}
          >
            {showPassword ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.8 21.8 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.8 21.8 0 0 1-3.16 4.19" />
                <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          className="animate-fade-in"
          style={{
            background: "rgba(255, 143, 135, 0.08)",
            border: "1px solid rgba(255, 143, 135, 0.22)",
            borderRadius: "14px",
            padding: "0.8rem 0.95rem",
            color: "var(--danger)",
            fontSize: "0.875rem",
          }}
        >
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        id="loginBtn"
        type="submit"
        disabled={loading}
        className="btn-primary"
        style={{ width: "100%", padding: "0.92rem", fontSize: "0.95rem" }}
      >
        {loading ? (
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </span>
        ) : (
          "Sign In to Academia"
        )}
      </button>

      <p className="chat-caption" style={{ marginTop: "0.15rem" }}>
        Uses your SRM Academia credentials · Never stored
      </p>
    </form>
  );
}
