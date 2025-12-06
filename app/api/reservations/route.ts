import { NextResponse } from "next/server";

const reservas: any[] = [];

export async function GET() {
  return NextResponse.json(reservas);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  reservas.push(body);
  return NextResponse.json(body, { status: 201 });
}
