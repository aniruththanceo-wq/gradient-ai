"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  GraduationCap,
  Briefcase,
  FileText,
  LayoutDashboard,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { devLogin, getFeatureAccess, logout } from "@/services/gradient-api";
import { setStoredToken } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import type { FeatureAccess } from "@/types/api";

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { session, loading, setSession } = useAuth();
  const [features, setFeatures] = useState<FeatureAccess | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [personaOpen, setPersonaOpen] = useState(false);
  const personaRef = useRef<HTMLDivElement>(null);

  // Close persona dropdown on outside click
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (personaRef.current && !personaRef.current.contains(e.target as Node)) {
        setPersonaOpen(false);
      }
    }
    if (personaOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [personaOpen]);

  useEffect(() => {
    if (session?.profile) {
      getFeatureAccess()
        .then(setFeatures)
        .catch(() => setFeatures(null));
    }
  }, [session]);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // ignore API error — still clear local state
    }
    setStoredToken(null);
    setSession(null);
    router.push("/");
  }

  async function switchPersona(persona: string) {
    try {
      const nextSession = await devLogin(persona);
      if (nextSession.session_token) {
        setStoredToken(nextSession.session_token);
      }
      setSession(nextSession);
      setPersonaOpen(false);
      if (nextSession.onboarding_required) {
        router.push("/onboarding");
      } else {
        router.push("/dashboard");
      }
    } catch {
      // silently ignore dev login errors in nav
    }
  }

  const isPlacement = features?.placement_intelligence ?? (session?.profile ? session.profile.academic_year >= 3 : false);

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={17} /> },
    { href: "/academic", label: "Academic", icon: <GraduationCap size={17} /> },
    ...(isPlacement
      ? [{ href: "/placement", label: "Placement", icon: <Briefcase size={17} /> }]
      : []),
    { href: "/reports", label: "Reports", icon: <FileText size={17} /> },
  ];

  return (
    <header className="app-header">
      <div className="container app-header-inner">
        {/* Brand */}
        <Link className="brand-link" href={session?.profile ? "/dashboard" : "/"}>
          <div className="brand-logo-icon">G</div>
          <span>Gradient AI</span>
        </Link>

        {/* Desktop Navigation */}
        {session?.profile && (
          <nav className="nav-links">
            {links.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link ${active ? "active" : ""}`}
                  style={{ display: "inline-flex", alignItems: "center", gap: 7 }}
                >
                  {link.icon}
                  {link.label}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right Action / Profile Menu */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Quick Dev Persona Switcher */}
          <div style={{ position: "relative" }} ref={personaRef}>
            <button
              onClick={() => setPersonaOpen(!personaOpen)}
              className="btn btn-secondary btn-sm"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.8rem" }}
              title="Switch persona for testing Year 1 vs Year 4 flows"
            >
              <Sparkles size={13} color="var(--primary)" />
              <span>
                {session?.profile
                  ? `Year ${session.profile.academic_year}`
                  : session
                  ? "New Student"
                  : "Try Demo"}
              </span>
              <ChevronDown size={13} />
            </button>

            {personaOpen && (
              <div
                className="gradient-card-elevated"
                style={{
                  position: "absolute",
                  right: 0,
                  top: "calc(100% + 6px)",
                  width: 240,
                  padding: "6px",
                  zIndex: 100,
                  background: "var(--surface)",
                }}
              >
                <div
                  style={{
                    padding: "6px 10px 8px",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: "var(--ink-tertiary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    borderBottom: "1px solid var(--line)",
                    marginBottom: 4,
                  }}
                >
                  Switch Test Persona
                </div>
                {[
                  {
                    persona: "year_1_student",
                    name: "Alex Chen — Year 1",
                    desc: "Academic Intelligence only",
                  },
                  {
                    persona: "year_4_student",
                    name: "Maya Patel — Year 4",
                    desc: "Academic + Career Suite",
                  },
                  {
                    persona: "new_student",
                    name: "New Student",
                    desc: "Triggers onboarding flow",
                  },
                ].map(({ persona, name, desc }) => (
                  <button
                    key={persona}
                    type="button"
                    onClick={() => switchPersona(persona)}
                    className="btn btn-ghost btn-sm"
                    style={{
                      width: "100%",
                      justifyContent: "flex-start",
                      textAlign: "left",
                      padding: "7px 10px",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--ink)" }}>{name}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--ink-tertiary)" }}>{desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Profile / Logout */}
          {session ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {session.profile ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "4px 10px",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--surface-subtle)",
                    border: "1px solid var(--line-subtle)",
                  }}
                >
                  <UserIcon size={14} color="var(--primary)" />
                  <span style={{ fontSize: "0.84rem", fontWeight: 600 }}>{session.profile.full_name}</span>
                </div>
              ) : null}
              <button
                onClick={handleLogout}
                className="btn btn-ghost btn-sm"
                title="Sign out"
                style={{ padding: "6px 8px" }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link href="/" className="btn btn-primary btn-sm">
              Sign In
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="btn btn-ghost btn-sm mobile-menu-btn"
            style={{ display: "none" }}
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {menuOpen && session?.profile && (
        <div
          style={{
            padding: "12px 16px 16px",
            borderTop: "1px solid var(--line)",
            background: "var(--surface)",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`nav-link ${pathname.startsWith(link.href) ? "active" : ""}`}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px" }}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
          <div style={{ borderTop: "1px solid var(--line)", marginTop: 8, paddingTop: 8 }}>
            <button
              onClick={handleLogout}
              className="btn btn-ghost btn-sm"
              style={{ width: "100%", justifyContent: "flex-start", gap: 10, padding: "10px 12px" }}
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
