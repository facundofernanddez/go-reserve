"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function CourtBookingPage() {
  const params = useParams<{ courtId: string }>();
  const courtId = params.courtId;
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const form = e.target as HTMLFormElement;

    const fecha = form.fecha.value; // "2025-12-05"
    const hora = form.hora.value; // "20:00"

    // Combinamos fecha y hora 
    const startTime = new Date(`${fecha}T${hora}:00`);


    const complexId = "ID_DEL_COMPLEJO_POR_AHORA";

    const payload = {
      complexId, 
      courtId, 
      startTime: startTime.toISOString(), 
      clientName: form.nombre.value, 
      clientPhone: form.telefono.value, 
    };

    console.log("Voy a enviar este payload a /api/reservations:", payload);

    try {
      setIsSubmitting(true);

      const respuesta = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await respuesta.json().catch(() => ({}));

      if (respuesta.status === 409) {
        // caso "Turno ocupado"
        alert(data?.error || "Ese horario ya está reservado ❌");
        return;
      }

      if (!respuesta.ok) {
        console.error("Error HTTP:", respuesta.status, data);
        alert(data?.error || "Error al crear la reserva ❌");
        return;
      }

      // 201 Created
      console.log("Reserva creada:", data);
      alert("Reserva creada con éxito ✅");
      form.reset();
    } catch (error) {
      console.error("Error de red al crear la reserva:", error);
      alert("No se pudo conectar con el servidor ❌");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex justify-center items-start p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reserva de la cancha {courtId}</CardTitle>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Nombre y apellido</p>
              <Input name="nombre" placeholder="Ej: Cristian Díaz" required />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium">Teléfono</p>
              <Input
                name="telefono"
                type="tel"
                placeholder="Ej: 3794..."
                required
              />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium">Fecha</p>
              <Input name="fecha" type="date" required />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium">Hora</p>
              <Input name="hora" type="time" required />
            </div>
          </CardContent>

          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Confirmar reserva"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
