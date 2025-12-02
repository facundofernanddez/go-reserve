import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ReservationStatus } from "@prisma/client";

//Recibo los datos para crear una nueva reserva
export async function POST(request: Request) {
  try {
    //leo el body y extraigo los datos que necesito
    const body = await request.json();
    const { complexId, courtId, startTime, clientName, clientPhone } = body;

    const existingReservation = await prisma.reservation.findFirst({
      where: {
        courtId: courtId,
        startTime: new Date(startTime),
        status: {
          not: ReservationStatus.CANCELED,
        },
      },
    });

    if (existingReservation) {
      return NextResponse.json({ error: "Turno ocupado" }, { status: 409 });
    }

    //Evito datos vacios
    if (!complexId || !courtId || !startTime || !clientName || !clientPhone) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios" },
        { status: 400 }
      );
    }

    //Creo en la BD
    const newReservation = await prisma.reservation.create({
      data: {
        startTime: new Date(startTime),
        clientName: clientName,
        clientPhone: clientPhone,
        status: ReservationStatus.PENDING, //estado inicial

        complex: { connect: { id: complexId } },
        court: { connect: { id: courtId } },
      },
    });

    //respondo con exito
    return NextResponse.json(newReservation, { status: 201 }); // 201 = Created (Creado)
  } catch (error) {
    console.error("Error al crear la reservación:", error);
    return NextResponse.json(
      { error: "No se pudo crear la reserva" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { reservationId, newStatus } = body;

    if (!reservationId || !newStatus) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios." },
        { status: 400 }
      );
    }

    //Valida que el estado sea valido
    if (!Object.values(ReservationStatus).includes(newStatus)) {
      return NextResponse.json(
        {
          error:
            "Estado no válido. Usa: PENDING, CONFIRMED, CANCELED o COMPLETE",
        },
        { status: 400 }
      );
    }

    //Actualiza la bd
    const updatedReservation = await prisma.reservation.update({
      where: { id: reservationId },
      data: { status: newStatus },
    });

    //Notificacion
    if (newStatus === ReservationStatus.CONFIRMED) {
      console.log(`PAGO CONFIRMADO para la reserva ${reservationId}`);
    }
    if (newStatus === ReservationStatus.CANCELED) {
      console.log(
        `RESERVA CANCELADA: ${reservationId}. El horario queda libre.`
      );
    }

    return NextResponse.json(updatedReservation, { status: 200 });
  } catch (error) {
    console.error("Error al actualizar la reserva:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar la reserva" },
      { status: 500 }
    );
  }
}
