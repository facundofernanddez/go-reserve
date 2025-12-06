"use client";

import React, { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function CourtBookingPage() {
  const params = useParams<{ courtId: string }>();
  const courtId = params.courtId;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const minDate = useMemo(() => new Date().toISOString().split("T")[0], []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting) return;
    setMsg(null);

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
      complexId: "demo-complex",
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
    } catch {
      setMsg({ type: "error", text: "No se pudo conectar con el servidor" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">
        Reserva de la cancha {courtId}
      </h2>

      {msg && (
        <Alert
          className="mb-3"
          variant={msg.type === "success" ? "default" : "destructive"}
        >
          <AlertTitle>{msg.type === "success" ? "Listo" : "Error"}</AlertTitle>
          <AlertDescription>{msg.text}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input name="nombre" placeholder="Nombre y apellido" required />
        <Input name="telefono" type="tel" placeholder="Teléfono" required />
        <Input name="fecha" type="date" required min={minDate} />
        <Input name="hora" type="time" required />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : "Confirmar reserva"}
        </Button>
      </form>
    </main>
  );
}
