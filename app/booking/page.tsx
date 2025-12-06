"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

type Court = {
  id: string;
  name: string;
  sport?: string;
  complexId: string;
  location?: string;
  pricePerHour?: number;
  imageUrl?: string;
};

const MOCK_COURTS: Court[] = [
  { id: "1", name: "Cancha 1", sport: "Fútbol", complexId: "demo-complex", location: "Sede Centro", pricePerHour: 6000 },
  { id: "2", name: "Cancha 2", sport: "Fútbol", complexId: "demo-complex", location: "Sede Norte",  pricePerHour: 6500 },
  { id: "3", name: "Cancha Tech", sport: "Paddle", complexId: "demo-complex", location: "Sede Sur", pricePerHour: 7000 },
];

export default function BookingPage() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sport, setSport] = useState<string>("all");
  const [date, setDate] = useState<string>(
    () => new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/courts", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (!alive) return;
        if (Array.isArray(data) && data.length > 0) {
          setCourts(data);
        } else {
          // fallback en desarrollo para no dejar la UI vacía
          if (process.env.NODE_ENV === "development") {
            setCourts(MOCK_COURTS);
          } else {
            setCourts([]);
          }
        }
      } catch (e: any) {
        if (!alive) return;
        setError("No se pudo cargar /api/courts");
        if (process.env.NODE_ENV === "development") {
          setCourts(MOCK_COURTS);
        } else {
          setCourts([]);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const sports = useMemo(() => {
    const set = new Set<string>();
    courts.forEach((c) => c.sport && set.add(c.sport));
    return ["all", ...Array.from(set)];
  }, [courts]);

  const filtered = useMemo(() => {
    const base =
      sport === "all" ? courts : courts.filter((c) => c.sport === sport);
    // Aquí podrías filtrar por disponibilidad según "date" si el backend lo soporta.
    return base;
  }, [courts, sport, date]);

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto w-full max-w-5xl">
        {/* Barra superior estilo equipo */}
        <div className="mb-4 h-2 w-full grid grid-cols-4 rounded-lg overflow-hidden">
          <div className="bg-[var(--brand-green)]" />
          <div className="bg-[var(--brand-yellow)]" />
          <div className="bg-[var(--brand-orange)]" />
          <div className="bg-[var(--brand-brown)]" />
        </div>

        <header className="mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-[color:color-mix(in_srgb,var(--brand-green)_25%,transparent)] text-2xl">
              ⚽
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-[var(--brand-brown)]">
                Reservá tu cancha
              </h1>
              <p className="text-xs tracking-wide text-[color:color-mix(in_srgb,var(--brand-brown)_65%,transparent)] uppercase">
                Filtros por deporte y fecha
              </p>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex items-center gap-3">
            <Select value={sport} onValueChange={setSport}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Deporte" />
              </SelectTrigger>
              <SelectContent>
                {sports.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === "all" ? "Todos" : s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-[160px]"
            />
          </div>
        </header>

        {/* Grid de canchas */}
        {loading ? (
          <p className="text-sm text-[var(--brand-brown)]/70">
            Cargando canchas…
          </p>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-[var(--brand-brown)]/10 bg-white/70 backdrop-blur p-6 text-center">
            <p className="text-[var(--brand-brown)]">
              No encontramos canchas para tu búsqueda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((c) => (
              <Card
                key={c.id}
                className="overflow-hidden border-[var(--brand-brown)]/10 bg-white/90 backdrop-blur shadow-soft"
              >
                {/* Header con imagen o césped */}
                <div
                  className="h-28 w-full bg-[length:24px_24px] bg-[radial-gradient(circle_at_12px_12px,rgba(255,255,255,0.06)_1px,transparent_1px)]"
                  style={{ backgroundColor: "#1f533e" }}
                />
                <CardHeader className="pb-2">
                  <CardTitle className="text-[var(--brand-brown)]">
                    {c.name || `Cancha ${c.id}`}
                  </CardTitle>
                  <CardDescription className="text-[var(--brand-brown)]/70">
                    {c.sport || "Fútbol"} • {c.location || "Complejo deportivo"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--brand-brown)]/70">
                      {new Date(date).toLocaleDateString()}
                    </span>
                    <span className="font-medium text-[var(--brand-brown)]">
                      {c.pricePerHour
                        ? `$${c.pricePerHour}/h`
                        : "Consulta valor"}
                    </span>
                  </div>
                  <div className="mt-3 h-1 w-full rounded-full bg-[linear-gradient(to_right,var(--brand-green),var(--brand-yellow),var(--brand-orange))]" />
                </CardContent>
                <CardFooter className="flex items-center justify-between">
                  <span className="text-xs text-[var(--brand-brown)]/60">
                    Turnos por hora
                  </span>
                  <Button
                    asChild
                    className="bg-[var(--brand-brown)] hover:opacity-90 text-white"
                  >
                    <Link
                      href={{
                        pathname: `/booking/${c.id}`,
                        query: { complexId: c.complexId, date },
                      }}
                    >
                      Reservar
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
