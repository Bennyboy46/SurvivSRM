import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Image from "next/image";
import LoginForm from "@/components/LoginForm";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/server";

export default async function HomePage() {
  const session = verifySessionToken((await cookies()).get(SESSION_COOKIE_NAME)?.value);
  if (session) {
    redirect("/chat");
  }

  return (
    <main className="page-shell aurora-shell" style={{ display: "grid", placeItems: "center", padding: "1rem" }}>
      <div aria-hidden>
        <div className="orb orb--teal" style={{ top: "-8rem", left: "-6rem", width: "24rem", height: "24rem" }} />
        <div className="orb orb--amber" style={{ right: "-8rem", bottom: "-8rem", width: "28rem", height: "28rem" }} />
      </div>

      <section className="auth-layout animate-fade-up">
        <div className="glass-card auth-copy">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.9rem", marginBottom: "1.4rem" }}>
              <div style={{ width: "3.65rem", height: "3.65rem", display: "grid", placeItems: "center" }}>
                <Image src="/logo-minimal.svg" alt="SurvivSRM logo" width={56} height={56} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              </div>
              <div>
                <div className="eyebrow" style={{ fontSize: "0.86rem" }}>SurvivSRM</div>
              </div>
            </div>

            <h1 className="hero-title">
              <span className="gradient-text">A sharper way</span> to talk to your academics.
            </h1>
            <p className="hero-copy" style={{ marginTop: "1.15rem" }}>
              Check attendance, marks, and timetable data through a cinematic chat interface built to feel fast,
              clear, and slightly futuristic.
            </p>
          </div>
        </div>

        <div className="glass-card auth-panel">
          <div className="auth-panel-inner">
            <div style={{ marginBottom: "0.35rem" }}>
              <div className="eyebrow" style={{ marginBottom: "0.55rem" }}>Sign in</div>
              <h2 style={{ fontSize: "1.55rem", lineHeight: 1.05, marginBottom: "0.55rem" }}>Enter the cockpit</h2>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.65 }}>
                Use your SRM Academia credentials to unlock the live assistant and begin querying your academic data.
              </p>
            </div>

            <LoginForm />
          </div>
        </div>
      </section>
    </main>
  );
}
