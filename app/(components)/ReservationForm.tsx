"use client";

import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { Form, useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  telefono: z.string().min(1, "El teléfono es obligatorio"),
  fecha: z.string().min(1, "La fecha es obligatoria"),
  tiempo: z.string().min(1, "La hora es obligatoria"),
});

export default function ReservationForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      telefono: "",
      fecha: "",
      tiempo: "",
    },
  });

  const queryClient = useQueryClient();

  const createReservation = async (
    newRevervation: z.infer<typeof formSchema>
  ) => {
    const parseBody = formSchema.safeParse(newRevervation);

    if (!parseBody.success) {
      throw new Error(parseBody.error.message);
    }

    //post method to API
    return fetch("/api/reservations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parseBody.data),
    }).then((res) => {
      if (!res.ok) {
        throw new Error("Error creating reservation");
      }
      return res.json();
    });
  };

  const { mutate, isPending } = useMutation({
    mutationFn: createReservation,
    onSuccess: async () => {
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      alert("Reserva creada con éxito");
    },
    onError: (e: Error) => {
      alert(e.message);
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    mutate(data);
  };

  // genera slots (por ejemplo 08:00 a 23:00 cada 60 min)
  const slots = useMemo(() => {
    const out: string[] = [];
    for (let h = 8; h <= 23; h++) {
      const hh = String(h).padStart(2, "0");
      out.push(`${hh}:00`);
    }
    return out;
  }, []);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-3"
      >
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="Nombre y apellido"
                  required
                  className="focus:ring-brand-orange"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        ></FormField>

        <FormField
          control={form.control}
          name="telefono"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="Teléfono"
                  required
                  className="focus:ring-brand-orange"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        ></FormField>

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
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          ></FormField>

          <FormField
            control={form.control}
            name="tiempo"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Elegí hora" />
                    </SelectTrigger>
                    <SelectContent>
                      {slots.map((h, idx) => {
                        // const disabled =
                        //   horasOcupadas.has(h) ||
                        //   new Date(`${fechaSel}T${h}:00`) < new Date();
                        return (
                          <SelectItem
                            key={idx}
                            {...field}
                            // disabled={disabled}
                          >
                            {h}
                            {/* {horasOcupadas.has(h) ? "— ocupado" : ""} */}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          ></FormField>

          {/* Selector de hora con bloqueo */}
        </div>
        <Button
          type="submit"
          className="w-full bg-(--brand-brown) hover:opacity-90 text-white"
          disabled={isPending}
        >
          {isPending ? "Reservando..." : "Confirmar reserva"}
        </Button>
      </form>
    </Form>
  );
}
