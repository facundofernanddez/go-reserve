"use client";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
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

type Complex = { id: string; name: string; location?: string };
type Court = {
  id: string;
  name: string;
  sport: string;
  price?: number;
  complexId: string;
  location?: string;
};

export default function BookingPage() {
  const sp = useSearchParams();
  const complexIdFromQuery = sp.get("complexId") || "";
  const [complexId, setComplexId] = useState<string>(complexIdFromQuery);
  const [sport, setSport] = useState<string>("all");
  const [date, setDate] = useState<string>(
    () => new Date().toISOString().split("T")[0]
  );

  const complexesQ = useQuery({
    queryKey: ["complexes"],
    queryFn: async () => {
      const res = await fetch("/api/complexes", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json() as Promise<Complex[]>;
    },
    staleTime: 60_000,
  });

  const courtsQ = useQuery({
    queryKey: ["courts", complexId, sport],
    enabled: !!complexId,
    queryFn: async () => {
      const url = `/api/courts?complexId=${encodeURIComponent(complexId)}${
        sport !== "all" ? `&sport=${encodeURIComponent(sport)}` : ""
      }`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json() as Promise<Court[]>;
    },
  });

  const complexes = Array.isArray(complexesQ.data) ? complexesQ.data : [];
  const courts = Array.isArray(courtsQ.data) ? courtsQ.data : [];
  const sports = useMemo(() => {
    const set = new Set<string>();
    courts.forEach((c) => c.sport && set.add(c.sport));
    return ["all", ...Array.from(set)];
  }, [courts]);
  const filtered = useMemo(
    () => (sport === "all" ? courts : courts.filter((c) => c.sport === sport)),
    [courts, sport]
  );

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto w-full max-w-5xl">
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
                Filtros por complejo, deporte y fecha
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Select value={complexId || ""} onValueChange={setComplexId}>
              <SelectTrigger className="w-[220px]">
                <SelectValue
                  placeholder={
                    complexesQ.isLoading ? "Cargando..." : "Elegí complejo"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {complexes.map((cx) => (
                  <SelectItem key={cx.id} value={cx.id}>
                    {cx.name} {cx.location ? `— ${cx.location}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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

        {!complexId ? (
          <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
            Seleccioná un complejo para ver canchas.
          </div>
        ) : courtsQ.isLoading ? (
          <p className="text-sm text-[var(--brand-brown)]/70">
            Cargando canchas…
          </p>
        ) : courtsQ.isError ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            No se pudo cargar /api/courts
          </div>
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
                <div
                  className="h-28 w-full bg-[length:24px_24px] bg-[radial-gradient(circle_at_12px_12px,rgba(255,255,255,0.06)_1px,transparent_1px)]"
                  style={{ backgroundColor: "#1f533e" }}
                />
                <CardHeader className="pb-2">
                  <CardTitle className="text-[var(--brand-brown)]">
                    {c.name || `Cancha ${c.id}`}
                  </CardTitle>
                  <CardDescription className="text-[var(--brand-brown)]/70">
                    {c.sport || "Football"} • {c.location || "Complejo"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--brand-brown)]/70">
                      {new Date(date).toLocaleDateString()}
                    </span>
                    <span className="font-medium text-[var(--brand-brown)]">
                      {c.price ? `$${c.price}/h` : "Consulta valor"}
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
