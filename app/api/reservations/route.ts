import { NextResponse } from "next/server";

// Simulación en memoria para probar. Reemplaza con DB real.
const reservas: Array<{
  complexId: string;
  courtId: string;
  startTime: string; // ISO
  clientName: string;
  clientPhone: string;
}> = [];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { complexId, courtId, startTime, clientName, clientPhone } =
      body || {};

    // Validaciones mínimas
    if (!complexId || !courtId || !startTime || !clientName || !clientPhone) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Normalizar fecha/hora
    const inicio = new Date(startTime);
    if (isNaN(inicio.getTime())) {
      return NextResponse.json(
        { error: "startTime inválido" },
        { status: 400 }
      );
    }

    // Regla de conflicto: misma cancha y mismo horario exacto
    const existeConflicto = reservas.some(
      (r) => r.courtId === courtId && r.startTime === inicio.toISOString()
    );
    if (existeConflicto) {
      return NextResponse.json(
        { error: "Ese horario ya está reservado" },
        { status: 409 }
      );
    }

    const nueva = {
      complexId,
      courtId,
      startTime: inicio.toISOString(),
      clientName,
      clientPhone,
    };
    reservas.push(nueva);

    return NextResponse.json(nueva, { status: 201 });
  } catch (e) {
    console.error("Error en POST /api/reservations:", e);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
