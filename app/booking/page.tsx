"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
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

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.10),transparent_55%),radial-gradient(circle_at_bottom,_rgba(249,115,22,0.10),transparent_55%)] px-4 py-8 md:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        {/* Encabezado general */}
        <header className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-brand-brown shadow-sm ring-1 ring-brand-brown/10 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-green)]" />
            GoReserve · Reservá tu cancha en segundos
          </div>
          <h1 className="text-2xl font-semibold text-brand-brown sm:text-3xl">
            Elegí un complejo y reservá tu turno
          </h1>
          <p className="max-w-2xl text-sm text-brand-brown/70">
            Explorá complejos disponibles, descubrí sus canchas y confirmá tu
            reserva con pocos clics. Visual moderno y pensado para deportes.
          </p>
        </header>

        {/* 1. Selector de complejos */}
        <section className="rounded-2xl border border-brand-brown/10 bg-white/90 p-4 shadow-sm backdrop-blur-sm sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-brand-brown">
                1. Elegí un complejo
              </h2>
              <p className="text-xs text-brand-brown/60">
                Seleccioná el complejo donde querés jugar. Después vas a ver
                todas sus canchas disponibles.
              </p>
            </div>
            {selectedComplexId && (
              <Badge className="hidden bg-[var(--brand-green)]/10 text-xs font-medium text-[var(--brand-brown)] ring-1 ring-[var(--brand-green)]/40 sm:inline-flex">
                Complejo seleccionado
              </Badge>
            )}
          </div>

          <Separator className="my-4 bg-brand-brown/10" />

          {loadingComplexes && (
            <div className="grid gap-3 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card
                  key={i}
                  className="border-brand-brown/10 bg-white/80 p-3 shadow-sm"
                >
                  <Skeleton className="mb-2 h-4 w-3/4" />
                  <Skeleton className="mb-3 h-3 w-1/2" />
                  <Skeleton className="h-1 w-full rounded-full" />
                </Card>
              ))}
            </div>
          )}

          {errorComplexes && (
            <div className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              Ocurrió un error cargando los complejos. Probá nuevamente.
            </div>
          )}

          {!loadingComplexes && complexes.length === 0 && !errorComplexes && (
            <p className="mt-2 text-sm text-brand-brown/70">
              No encontramos complejos para mostrar en este momento.
            </p>
          )}

          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {complexes.map((c) => {
              const isSelected = selectedComplexId === c.id;
              return (
                <HoverCard key={c.id}>
                  <HoverCardTrigger asChild>
                    <button
                      type="button"
                      onClick={() => setSelectedComplexId(c.id)}
                      className="text-left"
                    >
                      <Card
                        className={[
                          "group relative w-full cursor-pointer overflow-hidden rounded-2xl border-2 bg-white/95 p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
                          isSelected
                            ? "border-[var(--brand-green)]/80 bg-[linear-gradient(to_bottom_right,rgba(34,197,94,0.08),white)]"
                            : "border-brand-brown/10 hover:border-[var(--brand-green)]/60",
                        ].join(" ")}
                      >
                        <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(to_right,var(--brand-green),var(--brand-yellow),var(--brand-orange))] opacity-80" />
                        <div className="mt-1 flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-semibold text-brand-brown">
                                {c.name}
                              </h3>
                              {isSelected && (
                                <Badge className="bg-[var(--brand-green)]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--brand-brown)] ring-1 ring-[var(--brand-green)]/50">
                                  Seleccionado
                                </Badge>
                              )}
                            </div>
                            {c.location && (
                              <p className="text-xs text-brand-brown/60">
                                {c.location}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="rounded-full bg-[var(--brand-green)]/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--brand-brown)]">
                              Complejo
                            </span>
                            <span className="text-[10px] text-brand-brown/50">
                              Click para ver canchas
                            </span>
                          </div>
                        </div>
                      </Card>
                    </button>
                  </HoverCardTrigger>
                  <HoverCardContent
                    side="top"
                    align="start"
                    className="w-64 border-brand-brown/10 bg-white/95 text-xs text-brand-brown shadow-lg"
                  >
                    <p className="font-medium">Detalle del complejo</p>
                    <p className="mt-1 text-[11px] text-brand-brown/70">
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
        <section className="rounded-2xl border border-brand-brown/10 bg-white/90 p-4 shadow-sm backdrop-blur-sm sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-brand-brown">
                2. Canchas del complejo seleccionado
              </h2>
              <p className="text-xs text-brand-brown/60">
                Elegí la cancha donde querés jugar y avanzá a la reserva del
                horario.
              </p>
            </div>
          </div>

          <Separator className="my-4 bg-brand-brown/10" />

          {!selectedComplexId && (
            <div className="rounded-xl border border-dashed border-brand-brown/20 bg-brand-green/5 px-4 py-3 text-sm text-brand-brown/70">
              Primero seleccioná un complejo para ver sus canchas disponibles.
            </div>
          )}

          {selectedComplexId && loadingCourts && (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card
                  key={i}
                  className="border-brand-brown/10 bg-white/80 p-3 shadow-sm"
                >
                  <Skeleton className="mb-2 h-4 w-2/3" />
                  <Skeleton className="mb-3 h-3 w-1/3" />
                  <Skeleton className="h-8 w-full rounded-full" />
                </Card>
              ))}
            </div>
          )}

          {selectedComplexId && errorCourts && (
            <div className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              Ocurrió un error cargando las canchas. Probá nuevamente.
            </div>
          )}

          {selectedComplexId && !loadingCourts && courts.length === 0 && (
            <p className="text-sm text-brand-brown/70">
              No hay canchas registradas para este complejo.
            </p>
          )}

          {selectedComplexId && courts.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {courts.map((court) => (
                <Card
                  key={court.id}
                  className="flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-brand-brown/15 bg-white/95 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative p-3 pb-2">
                    <div className="absolute inset-x-3 top-0 h-1 rounded-b-full bg-[linear-gradient(to_right,var(--brand-green),var(--brand-yellow),var(--brand-orange))]" />
                    <div className="mt-2 flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold text-brand-brown">
                          {court.name}
                        </h3>
                        <p className="mt-1 text-[11px] uppercase tracking-wide text-brand-brown/60">
                          {court.sport}
                        </p>
                      </div>
                      <Badge className="bg-[var(--brand-orange)]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--brand-brown)] ring-1 ring-[var(--brand-orange)]/40">
                        Cancha
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-brand-brown/10 bg-brand-green/5 px-3 py-2">
                    <span className="text-[11px] text-brand-brown/70">
                      Seleccioná para continuar con la reserva.
                    </span>
                    <a
                      href={`/booking/${court.id}?complexId=${court.complexId}`}
                      className="inline-flex items-center rounded-full bg-[var(--brand-brown)] px-3 py-1 text-xs font-semibold text-white shadow-sm transition-all duration-150 hover:scale-[1.03] hover:bg-[color:color-mix(in_srgb,var(--brand-brown)_90%,black_10%)] hover:shadow-md active:scale-95"
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
