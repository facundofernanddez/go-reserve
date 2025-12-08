import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/courts
 * Lista canchas de un complejo. Filtro opcional por deporte.
 * Query:
 *  - complexId (string, requerido)
 *  - sport (string, opcional: igualdad o contains insensible si lo prefieres)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const complexId = searchParams.get("complexId");
    const sport = searchParams.get("sport");

    if (!complexId) {
      return NextResponse.json(
        { error: "Complex ID is required" },
        { status: 400 }
      );
    }

    const where: Prisma.CourtWhereInput = { complexId };
    if (sport && sport !== "all") {
      // Igualdad simple. Si quieres insensible:
      // where.sport = { contains: sport, mode: "insensitive" };
      where.sport = sport;
    }

    const courts = await prisma.court.findMany({
      where,
      orderBy: { name: "asc" },
    });
    return NextResponse.json(courts, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching courts:", error?.message, error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/courts
 * Crea una cancha dentro de un complejo.
 * Body:
 *  - name (string), sport (string), price (number), complexId (string) — requeridos
 *  - description (string), features (string[]) — opcionales
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, sport, price, complexId, description, features } = body;

    if (!name || !sport || price == null || !complexId) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios" },
        { status: 400 }
      );
    }

    const newCourt = await prisma.court.create({
      data: {
        name,
        sport,
        price: Number(price),
        description: description || "",
        features: features || [],
        isAvailable: true,
        complexId,
        // Si tu modelo no tiene campo complexId, usa la relación:
        // complex: { connect: { id: complexId } },
      },
    });

    return NextResponse.json(newCourt, { status: 201 });
  } catch (error: any) {
    console.error("Error al crear cancha:", error?.message, error);
    return NextResponse.json(
      { error: "Error al crear la cancha" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/courts
 * Actualiza una cancha existente por id.
 * Body:
 *  - courtId (string, requerido)
 *  - name, price, isAvailable, description, features — opcionales
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { courtId, name, price, isAvailable, description, features } = body;

    if (!courtId) {
      return NextResponse.json(
        { error: "Se requiere courtId" },
        { status: 400 }
      );
    }

    const data: Prisma.CourtUpdateInput = {
      ...(name != null ? { name } : {}),
      ...(price != null ? { price: Number(price) } : {}),
      ...(isAvailable != null ? { isAvailable } : {}),
      ...(description != null ? { description } : {}),
      ...(features != null ? { features } : {}),
    };

    const updatedCourt = await prisma.court.update({
      where: { id: courtId },
      data,
    });
    return NextResponse.json(updatedCourt, { status: 200 });
  } catch (error) {
    console.error("No se pudo actualizar la cancha:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar la cancha" },
      { status: 500 }
    );
  }
}
