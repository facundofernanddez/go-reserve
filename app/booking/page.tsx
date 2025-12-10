"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import { Skeleton } from "@/components/ui/skeleton";

type Complex = {
  id: string;
  name: string;
  location: string | null;
};

type Court = {
  id: string;
  name: string;
  sport: string;
  complexId: string;
};

export default function BookingPage() {
  const [selectedComplexId, setSelectedComplexId] = useState<string | null>(
    null
  );
  const [selectedSport, setSelectedSport] = useState<string>(""); // "" = todos

  // 1) Traer complejos
  const {
    data: complexes = [],
    isLoading: loadingComplexes,
    isError: errorComplexes,
  } = useQuery({
    queryKey: ["complexes"],
    queryFn: async (): Promise<Complex[]> => {
      const res = await fetch("/api/complexes", { cache: "no-store" });
      if (!res.ok) throw new Error("Error cargando complejos");
      return res.json();
    },
  });

  // 2) Traer canchas del complejo seleccionado
  const {
    data: courts = [],
    isLoading: loadingCourts,
    isError: errorCourts,
  } = useQuery({
    queryKey: ["courts", { complexId: selectedComplexId }],
    queryFn: async (): Promise<Court[]> => {
      if (!selectedComplexId) return [];
      const res = await fetch(
        `/api/courts?complexId=${encodeURIComponent(selectedComplexId)}`,
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error("Error cargando canchas");
      return res.json();
    },
    enabled: !!selectedComplexId,
  });

  const filteredCourts = useMemo(() => {
    if (!selectedSport) return courts;
    return courts.filter(
      (c) => c.sport?.toLowerCase() === selectedSport.toLowerCase()
    );
  }, [courts, selectedSport]);

  return (
    <main className="min-h-screen bg-transparent px-4 py-8 md:px-8">
      <div className="mx-auto w-full max-w-6xl flex flex-col gap-6">
        {/* Encabezado general - SaaS dark glass header */}
        <header className="rounded-2xl p-4 sm:p-6 bg-white/5 backdrop-blur-md border border-white/6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              Elegí un complejo y reservá tu turno
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-300">
              Explorá complejos disponibles, descubrí sus canchas y confirmá tu
              reserva con pocos clics. Visual moderno y pensado para deportes.
            </p>
          </div>

          <div className="flex items-center gap-3 mt-3 sm:mt-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/6 backdrop-blur px-3 py-1 text-xs font-medium text-gray-200 ring-1 ring-white/6 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[var(--brand-green)] shadow-[0_0_8px_rgba(111,207,151,0.35)]" />
              Reservá tu cancha en segundos
            </div>
          </div>
        </header>

        {/* 1. Selector de complejos - glass cards */}
        <section className="rounded-2xl border border-white/6 bg-white/5 backdrop-blur-md p-4 shadow-xl sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-white">
                1. Elegí un complejo
              </h2>
              <p className="text-xs text-gray-300">
                Seleccioná el complejo donde querés jugar. Después vas a ver
                todas sus canchas disponibles.
              </p>
            </div>

            {/* eliminado badge visual "Complejo seleccionado" por petición */}
          </div>

          <Separator className="my-4 border-white/6" />

          {loadingComplexes && (
            <div className="grid gap-3 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card
                  key={i}
                  className="border border-white/5 bg-white/5 backdrop-blur-md rounded-2xl p-4 shadow-xl animate-pulse"
                >
                  <Skeleton className="mb-2 h-4 w-3/4" />
                  <Skeleton className="mb-3 h-3 w-1/2" />
                  <Skeleton className="h-1 w-full rounded-full" />
                </Card>
              ))}
            </div>
          )}

          {errorComplexes && (
            <div className="mt-2 rounded-lg border border-white/6 bg-white/6 px-3 py-2 text-xs text-gray-200">
              Ocurrió un error cargando los complejos. Probá nuevamente.
            </div>
          )}

          {!loadingComplexes && complexes.length === 0 && !errorComplexes && (
            <p className="mt-2 text-sm text-gray-300">
              No encontramos complejos para mostrar en este momento.
            </p>
          )}

          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {complexes.map((c) => {
              return (
                <HoverCard key={c.id}>
                  <HoverCardTrigger asChild>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedComplexId(c.id);
                        setSelectedSport(""); // reset filtro al cambiar complejo
                      }}
                      className="text-left w-full"
                    >
                      <Card
                        className={[
                          "group relative w-full cursor-pointer overflow-hidden rounded-2xl border bg-white/6 backdrop-blur-md p-4 shadow-xl transition-transform duration-200 hover:-translate-y-1 hover:shadow-2xl",
                        ].join(" ")}
                      >
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--brand-green)] via-[var(--brand-yellow)] to-[var(--brand-orange)] opacity-95" />
                        <div className="mt-2 flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-semibold text-white">
                                {c.name}
                              </h3>
                            </div>
                            <p className="text-xs text-gray-300">
                              {c.location ?? "Dirección no disponible"}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </button>
                  </HoverCardTrigger>
                  <HoverCardContent
                    side="top"
                    align="start"
                    className="w-64 border border-white/6 bg-white/6 text-xs text-gray-200 shadow-lg backdrop-blur-md"
                  >
                    <p className="font-medium text-white">
                      Detalle del complejo
                    </p>
                    <p className="mt-1 text-[11px] text-gray-300">
                      Vas a ver solo las canchas asociadas a este complejo y
                      podrás reservar horarios disponibles.
                    </p>
                  </HoverCardContent>
                </HoverCard>
              );
            })}
          </div>
        </section>

        {/* 2. Canchas del complejo seleccionado */}
        <section className="rounded-2xl p-4 sm:p-6 bg-white/5 backdrop-blur-md border border-white/6 shadow-xl">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-white">
                2. Canchas del complejo seleccionado
              </h2>
              <p className="text-xs text-gray-300">
                Elegí la cancha donde querés jugar y avanzá a la reserva del
                horario.
              </p>
            </div>

            {/* Filtro por deporte */}
            <div className="flex items-center gap-2">
              <div className="text-xs text-gray-300 mr-2">Mostrar:</div>
              <div className="inline-flex rounded-full bg-white/6 p-1 shadow-sm">
                <button
                  onClick={() => setSelectedSport("")}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedSport === ""
                      ? "bg-[var(--brand-green)]/20 text-white ring-1 ring-[var(--brand-green)]/25"
                      : "text-gray-200 hover:bg-white/5"
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setSelectedSport("Futbol")}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedSport?.toLowerCase() === "futbol"
                      ? "bg-[var(--brand-green)]/20 text-white ring-1 ring-[var(--brand-green)]/25"
                      : "text-gray-200 hover:bg-white/5"
                  }`}
                >
                  Futbol
                </button>
                <button
                  onClick={() => setSelectedSport("Padel")}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedSport?.toLowerCase() === "padel"
                      ? "bg-[var(--brand-green)]/20 text-white ring-1 ring-[var(--brand-green)]/25"
                      : "text-gray-200 hover:bg-white/5"
                  }`}
                >
                  Padel
                </button>
              </div>
            </div>
          </div>

          <Separator className="my-4 border-white/6" />

          {!selectedComplexId && (
            <div className="rounded-xl border border-white/6 bg-white/6 px-4 py-3 text-sm text-gray-200">
              Primero seleccioná un complejo para ver sus canchas disponibles.
            </div>
          )}

          {selectedComplexId && loadingCourts && (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card
                  key={i}
                  className="border border-white/6 bg-white/6 backdrop-blur-md rounded-2xl p-4 shadow-xl animate-pulse"
                >
                  <Skeleton className="mb-2 h-4 w-2/3" />
                  <Skeleton className="mb-3 h-3 w-1/3" />
                  <Skeleton className="h-8 w-full rounded-full" />
                </Card>
              ))}
            </div>
          )}

          {selectedComplexId && errorCourts && (
            <div className="mt-2 rounded-lg border border-white/6 bg-[rgba(255,255,255,0.03)] px-3 py-2 text-xs text-gray-200">
              Ocurrió un error cargando las canchas. Probá nuevamente.
            </div>
          )}

          {selectedComplexId &&
            !loadingCourts &&
            filteredCourts.length === 0 && (
              <p className="text-sm text-gray-300">
                No hay canchas registradas para la selección actual.
              </p>
            )}

          {selectedComplexId && filteredCourts.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredCourts.map((court) => (
                <Card
                  key={court.id}
                  className="flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-white/6 bg-white/6 backdrop-blur-md shadow-xl transition-transform duration-200 hover:-translate-y-1 hover:shadow-2xl"
                >
                  <div className="relative p-4 pb-3">
                    <div className="absolute inset-x-4 top-0 h-1 rounded-b-full bg-gradient-to-r from-[var(--brand-green)] via-[var(--brand-yellow)] to-[var(--brand-orange)] opacity-95" />
                    <div className="mt-3 flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold text-white">
                          {court.name}
                        </h3>
                        <p className="mt-1 text-[11px] uppercase tracking-wide text-gray-300">
                          {court.sport}
                        </p>
                      </div>
                      <Badge className="bg-[var(--brand-orange)]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--brand-brown)] ring-1 ring-[var(--brand-orange)]/30">
                        Cancha
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/6 bg-[rgba(255,255,255,0.02)] px-3 py-3">
                    <span className="text-[11px] text-gray-300">
                      Seleccioná para continuar con la reserva.
                    </span>
                    <a
                      href={`/booking/${court.id}?complexId=${court.complexId}`}
                      className="inline-flex items-center rounded-full bg-gradient-to-r from-[var(--brand-green)] via-[var(--brand-yellow)] to-[var(--brand-orange)] px-3 py-1 text-xs font-semibold text-white shadow-lg transition-all duration-150 hover:scale-[1.03] active:scale-95"
                    >
                      Reservar
                    </a>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
