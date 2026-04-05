"use client";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100vh", display: "grid", placeItems: "center", background: "#080f1a", color: "#e0f0ff", fontFamily: "Space Grotesk, sans-serif" }}>
        <div style={{ textAlign: "center", maxWidth: "24rem", padding: "1.5rem" }}>
          <h2 style={{ fontSize: "1.4rem", marginBottom: "0.6rem" }}>Something went wrong</h2>
          <p style={{ color: "#9db6cf", marginBottom: "1rem" }}>Please try again.</p>
          <button
            onClick={() => reset()}
            style={{
              border: "none",
              borderRadius: "999px",
              padding: "0.75rem 1rem",
              background: "#00b4d8",
              color: "#e0f0ff",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Retry
          </button>
        </div>
      </body>
    </html>
  );
}
