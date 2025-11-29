import { NextResponse } from "next/server";
import prisma from '@/lib/prisma';
import { ReservationStatus } from '@prisma/client';

//Recibo los datos para crear una nueva reserva
export async function POST(request: Request) {
    try {
        //leo el body y extraigo los datos que necesito
        const bodyRequest = await request.json();
        const {complexId, courtId, startTime, clientName, clientPhone} = bodyRequest;
        
        const existingReservation = await prisma.reservation.findFirst({
            where: {
                courtId: courtId,
                startTime: new Date(startTime),
                status: {
                    not: ReservationStatus.CANCELED
                }
            }
        });

        if (existingReservation) {
            return NextResponse.json({ error: 'Turno ocupado' }, { status: 409 });
        }

        //Evito datos vacios
        if(!complexId || !courtId || !startTime || !clientName || !clientPhone) {
            return NextResponse.json(
                {error: "Faltan datos obligatorios"},
                {status: 400}
            );
        }

        //Creo en la BD
        const newReservation = await prisma.reservation.create({
            data: {
                startTime: new Date(startTime),
                clientName: clientName,
                clientPhone: clientPhone,
                status: ReservationStatus.PENDING, //estado inicial

                complex: {connect: {id: complexId}},
                court: {connect: {id: courtId}}
            }
        });

        //respondo con exito
        return NextResponse.json(newReservation, {status: 201}); // 201 = Created (Creado)
    } catch(error) {
        console.error("Error al crear la reservación:", error);
        return NextResponse.json(
            {error: "No se pudo crear la reserva"},
            {status: 500}
        );
    }

}