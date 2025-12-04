"use client";

import { useParams } from "next/navigation";
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const form = e.target as HTMLFormElement;

    const datos = {
      courtId,
      nombre: form.nombre.value,
      telefono: form.telefono.value,
      fecha: form.fecha.value,
      hora: form.hora.value,
    };

    console.log("Datos de la reserva:", datos);
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
            <Button type="submit" className="w-full">
              Confirmar reserva
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
