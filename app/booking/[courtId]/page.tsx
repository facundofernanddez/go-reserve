"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function CourtBookingPage() {
  const params = useParams<{ courtId: string }>();
  const courtId = params.courtId;
  const search = useSearchParams();
  const complexId = search.get("complexId") || "";
  const initialDate =
    search.get("date") || new Date().toISOString().split("T")[0];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [reservas, setReservas] = useState<
    { courtId: string; startTime: string; clientName: string }[]
  >([]);

  const minDate = useMemo(() => new Date().toISOString().split("T")[0], []);

  async function loadReservas() {
    try {
      const resp = await fetch("/api/reservations");
      const data = await resp.json();
      setReservas(
        Array.isArray(data) ? data.filter((r) => r.courtId === courtId) : []
      );
    } catch {
      // silenciar
    }
  }

  useEffect(() => {
    loadReservas();
  }, [courtId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    if (!complexId) {
      setMsg({
        type: "error",
        text: "Falta el Complex ID. Volvé a la lista y reintentá.",
      });
      return;
    }

    const form = e.currentTarget;
    const fd = new FormData(form);
    const nombre = String(fd.get("nombre") || "").trim();
    const telefono = String(fd.get("telefono") || "").trim();
    const fecha = String(fd.get("fecha") || "");
    const hora = String(fd.get("hora") || "");

    if (!nombre || !telefono || !fecha || !hora) {
      setMsg({ type: "error", text: "Completá todos los campos" });
      return;
    }

    const startTime = new Date(`${fecha}T${hora}:00`);
    if (isNaN(startTime.getTime())) {
      setMsg({ type: "error", text: "Completá una fecha y hora válidas" });
      return;
    }
    if (startTime < new Date()) {
      setMsg({ type: "error", text: "No podés reservar en el pasado" });
      return;
    }

    const payload = {
      complexId,
      courtId,
      startTime: startTime.toISOString(),
      clientName: nombre,
      clientPhone: telefono,
    };

    try {
      setIsSubmitting(true);
      const resp = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await resp.json().catch(() => ({} as any));

      if (resp.status === 409) {
        setMsg({
          type: "error",
          text: data?.error || "Ese horario ya está reservado",
        });
        return;
      }
      if (!resp.ok) {
        setMsg({
          type: "error",
          text: data?.error || "Error al crear la reserva",
        });
        return;
      }

      setMsg({ type: "success", text: "Reserva creada con éxito" });
      form.reset();
      await loadReservas(); // refresca la lista
    } catch {
      setMsg({ type: "error", text: "No se pudo conectar con el servidor" });
    } finally {
      setIsSubmitting(false);
    }
  }

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
          {/* Icono balón simple (emoji o SVG) */}
          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-brand-green/20 text-2xl">
            ⚽
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-brand-brown">
              Reserva de cancha {courtId}
            </h2>
            <p className="text-xs tracking-wide text-brand-brown/60 uppercase">
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
          <div className="mb-4 rounded-lg border border-brand-brown/10 bg-brand-green/10 p-3">
            <p className="text-sm text-brand-brown/80">
              Completá los datos para confirmar tu turno. Elegí fecha y horario
              disponible.
            </p>
            <div className="mt-3 h-1 w-full rounded-full bg-[linear-gradient(to_right,var(--brand-green),var(--brand-yellow),var(--brand-orange))]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              name="nombre"
              placeholder="Nombre y apellido"
              required
              className="focus:ring-brand-orange"
            />
            <Input
              name="telefono"
              type="tel"
              placeholder="Teléfono"
              required
              className="focus:ring-brand-orange"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                name="fecha"
                type="date"
                required
                min={minDate}
                defaultValue={initialDate}
              />
              <Input name="hora" type="time" required />
            </div>
            <Button
              type="submit"
              className="w-full bg-[var(--brand-brown)] hover:opacity-90 text-white"
              disabled={isSubmitting || !complexId}
            >
              {isSubmitting ? "Reservando..." : "Confirmar reserva"}
            </Button>
          </form>

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
                    className="text-sm text-brand-brown flex items-center gap-2"
                  >
                    <span className="inline-block h-2 w-2 rounded-full bg-brand-green" />
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
