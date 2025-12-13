import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Go-Reserve",
  description: "Reserva tu cancha al instante",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-slate-950 text-slate-100 h-full`}
      >
        {/*<main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <NavBar />
          {children}
        </main>*/}
        {children}
      </body>
    </html>
  );
}
