import type { Metadata, Viewport } from "next";
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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body>{children}</body>
    </html>
  );
}
