"use client";

import React, { useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type Reserva = {
  courtId: string;
  startTime: string;
  clientName: string;
  clientPhone?: string;
};

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
  const [fechaSel, setFechaSel] = useState(initialDate);
  const [horaSel, setHoraSel] = useState<string>("");

  const minDate = useMemo(() => new Date().toISOString().split("T")[0], []);

  const qc = useQueryClient();

  // Query: reservas (filtradas por courtId en el client)
  const reservasQ = useQuery({
    queryKey: ["reservations", courtId],
    enabled: !!courtId,
    queryFn: async (): Promise<Reserva[]> => {
      const resp = await fetch("/api/reservations", { cache: "no-store" });
      const data = await resp.json();
      return Array.isArray(data)
        ? data.filter((r) => r.courtId === courtId)
        : [];
    },
  });

  const reservas = Array.isArray(reservasQ.data) ? reservasQ.data : [];

  // Slots 08:00 a 23:00
  const slots = useMemo(() => {
    const out: string[] = [];
    for (let h = 8; h <= 23; h++) out.push(String(h).padStart(2, "0") + ":00");
    return out;
  }, []);

  // Horas ocupadas del día seleccionado para esta cancha
  const horasOcupadas = useMemo(() => {
    const isoDay = new Date(fechaSel + "T00:00:00").toDateString();
    const sameDay = reservas.filter(
      (r) => new Date(r.startTime).toDateString() === isoDay
    );
    const set = new Set<string>();
    sameDay.forEach((r) => {
      const d = new Date(r.startTime);
      set.add(
        `${String(d.getHours()).padStart(2, "0")}:${String(
          d.getMinutes()
        ).padStart(2, "0")}`
      );
    });
    return set;
  }, [reservas, fechaSel]);

  // Mutation: crear reserva
  const crearReserva = useMutation({
    mutationFn: async (payload: {
      complexId: string;
      courtId: string;
      startTime: string;
      clientName: string;
      clientPhone: string;
    }) => {
      const resp = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await resp.json().catch(() => ({} as any));
      if (resp.status === 409)
        throw new Error(data?.error || "Ese horario ya está reservado");
      if (!resp.ok) throw new Error(data?.error || "Error al crear la reserva");
      return data;
    },
    onMutate: () => {
      setIsSubmitting(true);
      setMsg(null);
    },
    onSuccess: async () => {
      setMsg({ type: "success", text: "Reserva creada con éxito" });
      setHoraSel("");
      await qc.invalidateQueries({ queryKey: ["reservations", courtId] });
    },
    onError: (err: any) => {
      setMsg({
        type: "error",
        text: err?.message || "No se pudo crear la reserva",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  // Normaliza fecha y limpia hora si pasa a inválida
  function onFechaChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    const clamped = val < minDate ? minDate : val;
    setFechaSel(clamped);
    if (horaSel) {
      const candidate = new Date(`${clamped}T${horaSel}:00`);
      if (candidate < new Date()) setHoraSel("");
    }
  }

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
    const fd = new FormData(e.currentTarget);
    const nombre = String(fd.get("nombre") || "").trim();
    const telefono = String(fd.get("telefono") || "").trim();
    const hora = horaSel || String(fd.get("hora") || "");

    if (!nombre || !telefono || !fechaSel || !hora) {
      setMsg({ type: "error", text: "Completá todos los campos" });
      return;
    }
    const startTime = new Date(`${fechaSel}T${hora}:00`);
    if (isNaN(startTime.getTime())) {
      setMsg({ type: "error", text: "Completá una fecha y hora válidas" });
      return;
    }
    if (startTime < new Date()) {
      setMsg({ type: "error", text: "No podés reservar en el pasado" });
      return;
    }

    crearReserva.mutate({
      complexId,
      courtId,
      startTime: startTime.toISOString(),
      clientName: nombre,
      clientPhone: telefono,
    });
  }

  return (
    <main className="min-h-screen p-6 flex items-center justify-center">
      <div className="w-full max-w-md rounded-2xl bg-white/90 backdrop-blur shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-2 w-full grid grid-cols-4">
          <div className="bg-green-600" />
          <div className="bg-orange-400" />
          <div className="bg-green-700" />
          <div className="bg-gray-900" />
        </div>

        <header className="px-6 pt-6 pb-2 flex items-center gap-3">
          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-green-100 text-2xl">
            ⚽
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Reserva de cancha {courtId}
            </h2>
            <p className="text-xs tracking-wide text-gray-500 uppercase">
              Fútbol • Turnos por hora
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
              className="mb-3 border-gray-200"
              variant={msg.type === "success" ? "default" : "destructive"}
            >
              <AlertDescription className="text-gray-700">
                {msg.text}
              </AlertDescription>
            </Alert>
          )}

          <div className="mb-4 rounded-lg border border-gray-200 bg-green-50 p-3">
            <p className="text-sm text-gray-700">
              Completá los datos para confirmar tu turno. Elegí fecha y horario
              disponible.
            </p>
            <div className="mt-3 h-1 w-full rounded-full bg-[linear-gradient(to_right,#16a34a,#fb923c)]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <Input name="nombre" placeholder="Nombre y apellido" required />
            <Input name="telefono" type="tel" placeholder="Teléfono" required />
            <div className="grid grid-cols-2 gap-3">
              <Input
                name="fecha"
                type="date"
                required
                min={minDate}
                value={fechaSel}
                onChange={onFechaChange}
              />
              <Select value={horaSel} onValueChange={setHoraSel}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Elegí hora" />
                </SelectTrigger>
                <SelectContent>
                  {slots.map((h) => {
                    const disabled =
                      horasOcupadas.has(h) ||
                      new Date(`${fechaSel}T${h}:00`) < new Date();
                    return (
                      <SelectItem key={h} value={h} disabled={disabled}>
                        {h} {horasOcupadas.has(h) ? "— ocupado" : ""}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              disabled={isSubmitting || !complexId}
            >
              {isSubmitting || crearReserva.isPending
                ? "Reservando..."
                : "Confirmar reserva"}
            </Button>
          </form>

          <section className="mt-6">
            <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <span className="text-lg">📅</span> Reservas existentes
            </h3>
            <ul className="space-y-2">
              {reservasQ.isLoading ? (
                <li className="text-sm text-gray-600">Cargando…</li>
              ) : reservas.length === 0 ? (
                <li className="text-sm text-gray-500">
                  No hay reservas para esta cancha.
                </li>
              ) : (
                reservas.map((r, i) => (
                  <li
                    key={i}
                    className="text-sm text-gray-800 flex items-center gap-2"
                  >
                    <span className="inline-block h-2 w-2 rounded-full bg-green-600" />
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
