import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppProviders from "./providers";
import NavBar from "./(components)/Navbar";

// Configura fuentes y variables CSS
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata del sitio (solo en Server Components)
export const metadata: Metadata = {
  title: "Go-Reserve",
  description: "Reservas de complejos deportivos",
};

/**
 * Root layout (Server Component)
 * - Envuelve con Providers (cliente) para React Query y otros contextos.
 * - Renderiza barra de navegación y children.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <AppProviders>
          <NavBar />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
