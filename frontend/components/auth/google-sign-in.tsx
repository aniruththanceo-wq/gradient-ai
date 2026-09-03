"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Sparkles, ShieldCheck } from "lucide-react";
import { devLogin, signInWithGoogleCredential } from "@/services/gradient-api";
import { setStoredToken } from "@/lib/api";
import { Button } from "@/components/ui/button";

export function GoogleSignIn({ compact = false }: { compact?: boolean }) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loadingPersona, setLoadingPersona] = useState<string | null>(null);

  function initialize() {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || clientId.includes("your-google-oauth") || !window.google || !buttonRef.current) {
      return;
    }
    window.google.accounts.id.initialize({
      client_id: clientId,
      ux_mode: "popup",
      callback: async ({ credential }) => {
        try {
          const session = await signInWithGoogleCredential(credential);
          // Store the session token for Bearer auth fallback
          if (session.session_token) {
            setStoredToken(session.session_token);
          }
          router.push(session.onboarding_required ? "/onboarding" : "/dashboard");
        } catch (err) {
          setError(err instanceof Error ? err.message : "Google authentication failed.");
        }
      },
    });
    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: "outline",
      size: "large",
      shape: "rectangular",
      text: "signin_with",
    });
  }

  async function handleDevLogin(persona: string) {
    setLoadingPersona(persona);
    setError(null);
    try {
      const session = await devLogin(persona);
      // Store the session token for Bearer auth fallback
      if (session.session_token) {
        setStoredToken(session.session_token);
      }
      router.push(session.onboarding_required ? "/onboarding" : "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Dev login failed. Make sure the backend is running on port 8000.");
    } finally {
      setLoadingPersona(null);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={initialize}
      />
      <div ref={buttonRef} />

      {/* Development Persona Quick-Logins */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div
          style={{
            fontSize: "0.78rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "var(--ink-tertiary)",
            paddingBottom: 4,
            borderBottom: "1px solid var(--line)",
          }}
        >
          Quick Demo Access
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Button
            type="button"
            variant="primary"
            size={compact ? "sm" : "md"}
            isLoading={loadingPersona === "year_1_student"}
            onClick={() => handleDevLogin("year_1_student")}
            leftIcon={<Sparkles size={16} />}
          >
            Year 1 — Academic Focus
          </Button>
          <Button
            type="button"
            variant="secondary"
            size={compact ? "sm" : "md"}
            isLoading={loadingPersona === "year_4_student"}
            onClick={() => handleDevLogin("year_4_student")}
            leftIcon={<ShieldCheck size={16} />}
          >
            Year 4 — Full Career Suite
          </Button>
        </div>
        <div style={{ fontSize: "0.75rem", color: "var(--ink-tertiary)", lineHeight: 1.5 }}>
          Instant demo — no account required. For production use, sign in with your institutional Google account above.
        </div>
      </div>

      {error && (
        <p
          style={{
            margin: 0,
            padding: "10px 14px",
            background: "var(--danger-subtle)",
            border: "1px solid rgba(184,51,44,0.25)",
            borderRadius: "var(--radius-sm)",
            color: "var(--danger)",
            fontSize: "0.85rem",
            fontWeight: 600,
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
