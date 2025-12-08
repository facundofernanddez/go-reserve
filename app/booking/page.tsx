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

/**
 * Página de reserva:
 * - Carga complejos (GET /api/complexes) y permite seleccionar uno.
 * - Carga canchas del complejo (GET /api/courts?complexId=...&sport=...).
 * - Navega al detalle /booking/[courtId] con complexId y date en query.
 */
export default function BookingPage() {
  const sp = useSearchParams();
  const complexIdFromQuery = sp.get("complexId") || "";
  const [complexId, setComplexId] = useState<string>(complexIdFromQuery);
  const [sport, setSport] = useState<string>("all");
  const [date, setDate] = useState<string>(
    () => new Date().toISOString().split("T")[0]
  );

  // Lista de complejos
  const complexesQ = useQuery({
    queryKey: ["complexes"],
    queryFn: async (): Promise<Complex[]> => {
      const res = await fetch("/api/complexes", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    staleTime: 60_000,
  });

  // Lista de canchas del complejo seleccionado
  const courtsQ = useQuery({
    queryKey: ["courts", complexId, sport],
    enabled: !!complexId, // no consulta sin complexId
    queryFn: async (): Promise<Court[]> => {
      const url = `/api/courts?complexId=${encodeURIComponent(complexId)}${
        sport !== "all" ? `&sport=${encodeURIComponent(sport)}` : ""
      }`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
  });

  const complexes = Array.isArray(complexesQ.data) ? complexesQ.data : [];
  const courts = Array.isArray(courtsQ.data) ? courtsQ.data : [];

  // Lista de deportes disponibles (derivada de las canchas)
  const sports = useMemo(() => {
    const set = new Set<string>();
    courts.forEach((c) => c.sport && set.add(c.sport));
    return ["all", ...Array.from(set)];
  }, [courts]);

  // Filtro de canchas por deporte
  const filtered = useMemo(
    () => (sport === "all" ? courts : courts.filter((c) => c.sport === sport)),
    [courts, sport]
  );

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto w-full max-w-5xl">
        {/* Barra de colores */}
        <div className="mb-4 h-2 w-full grid grid-cols-4 rounded-lg overflow-hidden">
          <div className="bg-green-500" />
          <div className="bg-orange-400" />
          <div className="bg-green-700" />
          <div className="bg-gray-900" />
        </div>

        {/* Encabezado y filtros */}
        <header className="mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-green-100 text-2xl">
              ⚽
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Reservá tu cancha
              </h1>
              <p className="text-xs tracking-wide text-gray-500 uppercase">
                Filtros por complejo, deporte y fecha
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Selector de complejo */}
            <Select value={complexId || ""} onValueChange={setComplexId}>
              <SelectTrigger className="w-[220px] border-gray-200 bg-white text-gray-900">
                <SelectValue
                  placeholder={
                    complexesQ.isLoading ? "Cargando..." : "Elegí complejo"
                  }
                />
              </SelectTrigger>
              <SelectContent className="bg-white text-gray-900 border border-gray-200">
                {complexes.map((cx) => (
                  <SelectItem
                    key={cx.id}
                    value={cx.id}
                    className="text-gray-900 focus:bg-green-50 focus:text-green-700"
                  >
                    {cx.name} {cx.location ? `— ${cx.location}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Selector de deporte */}
            <Select value={sport} onValueChange={setSport}>
              <SelectTrigger className="w-[160px] border-gray-200 bg-white text-gray-900">
                <SelectValue placeholder="Deporte" />
              </SelectTrigger>
              <SelectContent className="bg-white text-gray-900 border border-gray-200">
                {sports.map((s) => (
                  <SelectItem
                    key={s}
                    value={s}
                    className="text-gray-900 focus:bg-green-50 focus:text-green-700"
                  >
                    {s === "all" ? "Todos" : s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Fecha */}
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-[160px] border-gray-200 bg-white text-gray-900"
            />
          </div>
        </header>

        {/* Estados de carga y resultados */}
        {!complexId ? (
          <div className="mb-4 rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-700">
            Seleccioná un complejo para ver canchas.
          </div>
        ) : courtsQ.isLoading ? (
          <p className="text-sm text-gray-600">Cargando canchas…</p>
        ) : courtsQ.isError ? (
          <div className="mb-4 rounded-lg border border-orange-300 bg-orange-50 p-3 text-sm text-orange-800">
            No se pudo cargar /api/courts
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
            <p className="text-gray-900">
              No encontramos canchas para tu búsqueda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((c) => (
              <Card
                key={c.id}
                className="overflow-hidden border-gray-200 bg-white shadow-sm transition hover:shadow-md"
              >
                {/* Imagen/encabezado (mantiene textura) */}
                <div
                  className="h-28 w-full bg-[length:24px_24px] bg-[radial-gradient(circle_at_12px_12px,rgba(0,0,0,0.04)_1px,transparent_1px)]"
                  style={{ backgroundColor: "#eef3ee" }}
                />

                <CardHeader className="pb-2">
                  <CardTitle className="text-gray-900">
                    {c.name || `Cancha ${c.id}`}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {c.sport || "Football"} • {c.location || "Complejo"}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--brand-brown)]/70">
                      {new Date(date).toLocaleDateString()}
                    </span>
                    <span className="font-semibold text-orange-600">
                      {c.price ? `$${c.price}/h` : "Consulta valor"}
                    </span>
                  </div>
                  {/* Barra cromática: verde/verde oscuro/naranja */}
                  <div className="mt-3 h-1 w-full rounded-full bg-[linear-gradient(to_right,#22c55e,#15803d,#fb923c)]" />
                </CardContent>

                <CardFooter className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Turnos por hora</span>
                  <Button
                    asChild
                    className="bg-green-600 hover:bg-green-700 text-white"
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
