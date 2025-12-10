"use client";

import { useMemo } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  telefono: z.string().min(1, "El teléfono es obligatorio"),
  fecha: z.string().min(1, "La fecha es obligatoria"),
  tiempo: z.string().min(1, "La hora es obligatoria"),
});

type ReservationFormValues = z.infer<typeof formSchema>;

type Reserva = {
  courtId: string;
  startTime: string;
  clientName: string;
};

type ReservationFormProps = {
  complexId: string;
  courtId: string;
  initialDate: string;
  reservas: Reserva[];
  onSuccess?: () => void;
  onError?: (msg: string) => void;
};

export default function ReservationForm({
  complexId,
  courtId,
  initialDate,
  reservas,
  onSuccess,
  onError,
}: ReservationFormProps) {
  const minDate = useMemo(
    () => new Date().toISOString().split("T")[0],
    []
  );

  const form = useForm<ReservationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      telefono: "",
      fecha: initialDate,
      tiempo: "",
    },
  });

  // fecha que está seleccionada actualmente en el form
  const fechaSel = form.watch("fecha") || initialDate;

  // genera slots (08:00 a 23:00)
  const slots = useMemo(() => {
    const out: string[] = [];
    for (let h = 8; h <= 23; h++) {
      const hh = String(h).padStart(2, "0");
      out.push(`${hh}:00`);
    }
    return out;
  }, []);

  // horas ocupadas según reservas + fecha seleccionada
  const horasOcupadasSet = useMemo(() => {
    const sameDay = reservas.filter((r) => {
      const d = new Date(r.startTime);
      const isoDay = new Date(fechaSel + "T00:00:00").toDateString();
      return r.courtId === courtId && d.toDateString() === isoDay;
    });

    const set = new Set<string>();
    sameDay.forEach((r) => {
      const d = new Date(r.startTime);
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      set.add(`${hh}:${mm}`);
    });
    return set;
  }, [reservas, fechaSel, courtId]);

  const createReservation = async (values: ReservationFormValues) => {
    const parsed = formSchema.parse(values);

    if (!complexId) {
      throw new Error("Falta el Complex ID. Volvé a la lista y reintentá.");
    }

    const startTime = new Date(`${parsed.fecha}T${parsed.tiempo}:00`);
    if (isNaN(startTime.getTime())) {
      throw new Error("Completá una fecha y hora válidas.");
    }
    if (startTime < new Date()) {
      throw new Error("No podés reservar en el pasado.");
    }

    const payload = {
      complexId,
      courtId,
      startTime: startTime.toISOString(),
      clientName: parsed.nombre.trim(),
      clientPhone: parsed.telefono.trim(),
    };

    const resp = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await resp.json().catch(() => ({} as any));

    if (resp.status === 409) {
      throw new Error(data?.error || "Ese horario ya está reservado.");
    }
    if (!resp.ok) {
      throw new Error(data?.error || "Error al crear la reserva.");
    }

    return data;
  };

  const { mutate, isPending } = useMutation({
    mutationFn: createReservation,
    onSuccess: () => {
      form.reset({
        nombre: "",
        telefono: "",
        fecha: initialDate,
        tiempo: "",
      });
      onSuccess?.();
    },
    onError: (e: any) => {
      onError?.(e?.message ?? "Error inesperado al crear la reserva.");
    },
  });

  const onSubmit = (data: ReservationFormValues) => {
    mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="Nombre y apellido"
                  required
                  className="bg-[#f5f7ff] text-brand-brown placeholder:text-brand-brown/40"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs text-red-500" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="telefono"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="Teléfono"
                  required
                  className="bg-[#f5f7ff] text-brand-brown placeholder:text-brand-brown/40"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs text-red-500" />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="fecha"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="date"
                    required
                    min={minDate}
                    className="bg-[#f5f7ff] text-brand-brown"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tiempo"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full bg-[#f5f7ff] text-brand-brown">
                      <SelectValue placeholder="Elegí hora" />
                    </SelectTrigger>
                    <SelectContent>
                      {slots.map((h) => {
                        const disabled =
                          horasOcupadasSet.has(h) ||
                          new Date(`${fechaSel}T${h}:00`) < new Date();

                        return (
                          <SelectItem
                            key={h}
                            value={h}
                            disabled={disabled}
                            className="text-brand-brown"
                          >
                            {h}
                            {horasOcupadasSet.has(h)
                              ? " — ocupado"
                              : ""}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-[var(--brand-brown)] hover:opacity-90 text-white"
          disabled={isPending || !complexId}
        >
          {isPending ? "Reservando..." : "Confirmar reserva"}
        </Button>
      </form>
    </Form>
  );
}
