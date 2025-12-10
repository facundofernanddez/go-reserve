"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ReservationForm from "@/app/(components)/ReservationForm";

type Reserva = {
  courtId: string;
  startTime: string;
  clientName: string;
};

export default function CourtBookingPage() {
  const params = useParams<{ courtId: string }>();
  const courtId = params.courtId;

  const search = useSearchParams();
  const complexId = search.get("complexId") || "";
  const initialDate =
    search.get("date") || new Date().toISOString().split("T")[0];

  const [msg, setMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [reservas, setReservas] = useState<Reserva[]>([]);

  async function loadReservas() {
    try {
      const resp = await fetch("/api/reservations");
      const data = await resp.json();
      setReservas(
        Array.isArray(data) ? data.filter((r) => r.courtId === courtId) : []
      );
    } catch {
      // silencioso
    }
  }

  useEffect(() => {
    loadReservas();
  }, [courtId]);

  const tituloCancha = useMemo(
    () => `Reserva de cancha ${courtId}`,
    [courtId]
  );

  return (
    <main className="min-h-screen p-6 flex items-center justify-center">
      <div className="w-full max-w-md rounded-2xl bg-white/90 backdrop-blur shadow-soft border border-brand-brown/10 overflow-hidden">
        {/* Barra superior estilo equipo */}
        <div className="h-2 w-full grid grid-cols-4">
          <div className="bg-[var(--brand-green)]" />
          <div className="bg-[var(--brand-yellow)]" />
          <div className="bg-[var(--brand-orange)]" />
          <div className="bg-[var(--brand-brown)]" />
        </div>

        <header className="px-6 pt-6 pb-2 flex items-center gap-3">
          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-[color:color-mix(in_srgb,var(--brand-green)_25%,transparent)] text-2xl">
            ⚽
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-brand-brown">
              {tituloCancha}
            </h2>
            <p className="text-xs tracking-wide text-[color:color-mix(in_srgb,var(--brand-brown)_65%,transparent)] uppercase">
              Futbol • Turnos por hora
            </p>
          </div>
        </header>

        <section className="px-6 py-4">
          {!complexId && (
            <Alert className="mb-3" variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Falta el Complex ID. Abrí la reserva desde la lista de canchas.
              </AlertDescription>
            </Alert>
          )}

          {msg && (
            <Alert
              className="mb-3 border-brand-brown/20"
              variant={msg.type === "success" ? "default" : "destructive"}
            >
              <AlertDescription className="text-brand-brown/80">
                {msg.text}
              </AlertDescription>
            </Alert>
          )}

          {/* Bloque informativo con líneas de cancha */}
          <div className="mb-4 rounded-lg border border-[color:color-mix(in_srgb,var(--brand-brown)_10%,transparent)] bg-[color:color-mix(in_srgb,var(--brand-green)_15%,transparent)] p-3">
            <p className="text-sm text-[color:color-mix(in_srgb,var(--brand-brown)_80%,transparent)]">
              Completá los datos para confirmar tu turno. Elegí fecha y horario
              disponible.
            </p>
            <div className="mt-3 h-1 w-full rounded-full bg-[linear-gradient(to_right,var(--brand-green),var(--brand-yellow),var(--brand-orange))]" />
          </div>

          {/* 👉 Form con TanStack + shadcn */}
          <ReservationForm
            complexId={complexId}
            courtId={courtId}
            initialDate={initialDate}
            reservas={reservas}
            onSuccess={async () => {
              await loadReservas();
              setMsg({
                type: "success",
                text: "Reserva creada con éxito",
              });
            }}
            onError={(text) => {
              setMsg({
                type: "error",
                text,
              });
            }}
          />

          {/* Reservas existentes con íconos */}
          <section className="mt-6">
            <h3 className="font-medium text-brand-brown mb-2 flex items-center gap-2">
              <span className="text-lg">📅</span> Reservas existentes
            </h3>
            <ul className="space-y-2">
              {reservas.length === 0 ? (
                <li className="text-sm text-brand-brown/60">
                  No hay reservas para esta cancha.
                </li>
              ) : (
                reservas.map((r, i) => (
                  <li
                    key={i}
                    className="text-sm text-[var(--brand-brown)] flex items-center gap-2"
                  >
                    <span className="inline-block h-2 w-2 rounded-full bg-[var(--brand-green)]" />
                    {new Date(r.startTime).toLocaleString()} — {r.clientName}
                  </li>
                ))
              )}
            </ul>
          </section>
        </section>
      </div>
    </main>
  );
}
