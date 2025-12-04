"use client";

import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const canchasMock = [
  { id: "1", nombre: "Cancha 1", deporte: "futbol" },
  { id: "2", nombre: "Cancha 2", deporte: "futbol" },
  { id: "3", nombre: "Cancha 3", deporte: "padel" },
];

export default function BookingPage() {
  return (
    <main className="max-w-4xl mx-auto min-h-screen p-6 space-y-6">
      <h1 className="text-3xl font-bold">Reservas</h1>

      {/* Filtros */}
      <section className="flex flex-wrap gap-4 items-end">
        <div className="space-y-2">
          <p className="text-sm font-medium">Deporte</p>
          <Select>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Seleccionar deporte" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="futbol">Fútbol</SelectItem>
              <SelectItem value="padel">Pádel</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Fecha</p>
          <Input type="date" className="w-48" />
        </div>
      </section>

      {/* Lista de canchas */}
      <section className="grid gap-4 md:grid-cols-2">
        {canchasMock.map((cancha) => (
          <Card key={cancha.id} className="flex flex-col justify-between">
            <CardHeader>
              <CardTitle>{cancha.nombre}</CardTitle>
              <CardDescription className="capitalize">
                Deporte: {cancha.deporte}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <p className="text-sm text-muted-foreground">
                horarios, precio, y mas cosa
              </p>
            </CardContent>

            <CardFooter>
              <Button asChild className="w-full">
                <Link href={`/booking/${cancha.id}`}>Reservar</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </section>
    </main>
  );
}
