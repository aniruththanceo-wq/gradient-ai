"use client";

import { useEffect, useState } from "react";
import { apiFetch, getStoredToken, setStoredToken } from "@/lib/api";
import type { AuthSession } from "@/types/api";

export function useAuth() {
  const [session, setSessionState] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function setSession(newSession: AuthSession | null) {
    if (newSession?.session_token) {
      setStoredToken(newSession.session_token);
    } else if (newSession === null) {
      // Explicitly clear token on logout or session reset
      setStoredToken(null);
    }
    // If newSession is non-null but has no session_token, preserve existing token
    setSessionState(newSession);
  }

  useEffect(() => {
    let active = true;
    apiFetch<AuthSession>("/auth/me")
      .then((data) => {
        if (active) {
          if (data.session_token) {
            setStoredToken(data.session_token);
          }
          setSessionState(data);
        }
      })
      .catch((err: Error) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { session, loading, error, setSession };
}
