import type { Metadata, Viewport } from "next";
import { AmbientBackground } from "@/components/layout/ambient-background";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Gradient AI — Student Academic & Career Intelligence",
    template: "%s | Gradient AI",
  },
  description:
    "Personalized IA trajectory analytics, CGPA prediction, timetable solver, placement readiness radar, and career intelligence for engineering students.",
  keywords: ["student analytics", "CGPA prediction", "academic intelligence", "placement readiness", "IA marks tracker"],
  robots: "index, follow",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body>
        <AmbientBackground />
        {children}
      </body>
    </html>
  );
}
