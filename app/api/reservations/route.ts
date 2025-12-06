import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Reserva = {
  complexId: string;
  courtId: string;
  startTime: string;
  clientName: string;
  clientPhone: string;
};

const dataFile = path.join(process.cwd(), "app", "data", "reservations.json");

async function readAll(): Promise<Reserva[]> {
  try {
    const buf = await fs.readFile(dataFile, "utf8");
    return JSON.parse(buf) as Reserva[];
  } catch {
    return [];
  }
}

async function writeAll(reservas: Reserva[]) {
  await fs.mkdir(path.dirname(dataFile), { recursive: true });
  await fs.writeFile(dataFile, JSON.stringify(reservas, null, 2), "utf8");
}

export async function GET() {
  const reservas = await readAll();
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
    const reservas = await readAll();
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
    const nueva = body as Reserva;
    reservas.push(nueva);
    await writeAll(reservas);
    return NextResponse.json(nueva, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }
}
