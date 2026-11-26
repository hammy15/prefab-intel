import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "Prefab Intel — Luxury Prefab & Modular Home Rankings 2026",
  description: "Deep research rankings of the top 15 luxury prefab, modular, and innovative home companies. Walkable virtual tours, build speed metrics, real community sentiment. ZURU Tech, ICON, Dvele, Boxabl and 11 more — ranked and rated.",
  openGraph: {
    title: "Prefab Intel — Luxury Prefab Home Rankings 2026",
    description: "ZURU Tech, ICON, Dvele, Boxabl and 12 more — ranked with verified build times, real community quotes, and walkable tours.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        <NavBar />
        {children}
      </body>
    </html>
  );
}
