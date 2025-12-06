import { NextResponse } from "next/server";

export const runtime = "nodejs"; // evita Edge
export const dynamic = "force-dynamic";

type Reserva = {
  complexId: string;
  courtId: string;
  startTime: string; // ISO
  clientName: string;
  clientPhone: string;
};

const reservas: Reserva[] = [];

export async function GET() {
  return NextResponse.json(reservas);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<Reserva>;
    if (
      !body?.complexId ||
      !body?.courtId ||
      !body?.startTime ||
      !body?.clientName ||
      !body?.clientPhone
    ) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    // conflicto si ya existe misma cancha y horario
    if (
      reservas.some(
        (r) => r.courtId === body.courtId && r.startTime === body.startTime
      )
    ) {
      return NextResponse.json(
        { error: "Horario ya reservado" },
        { status: 409 }
      );
    }

    reservas.push(body as Reserva);
    return NextResponse.json(body, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }
}
