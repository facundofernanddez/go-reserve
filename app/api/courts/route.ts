import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/**
 *
 * @param request
 * @returns
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const complexId = searchParams.get("complexId");
    const sport = searchParams.get("sport"); //filtrar por deporte

    if (!complexId) {
      return NextResponse.json(
        { error: "Complex ID is required" },
        { status: 400 }
      );
    }

    // Preparamos el filtro
    const conditions: Prisma.CourtWhereInput = {
      complexId: complexId,
    };

    // Si también pidieron filtrar por deporte (ej: solo futbol)
    if (sport) {
      conditions.sport = {
        equals: sport,
        mode: "insensitive",
      };
    }

    const courts = await prisma.court.findMany({
      where: conditions,
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(courts, { status: 200 });
  } catch (error) {
    console.error("Error fetching courts:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, sport, price, complexId, description, features } = body;

    if (!name || !sport || !price || !complexId) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios" },
        { status: 400 }
      );
    }

    const newCourt = await prisma.court.create({
      data: {
        name: name,
        sport: sport,
        price: Number(price),
        description: description || "",
        features: features || [],
        isAvailable: true,
        complex: {
          connect: { id: complexId },
        },
      },
    });

    return NextResponse.json(newCourt, { status: 201 });
  } catch (error) {
    console.error("Error al crear cancha:", error);
    return NextResponse.json(
      { error: "Error al crear la cancha" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { courtId, name, price, isAvailable, description, features } = body;

    if (!courtId) {
      return NextResponse.json(
        { error: "Se requiere courtId" }, //no estoy segura de este mensaje!!!
        { status: 400 }
      );
    }

    //actualiza en bd
    const updatedCourt = await prisma.court.update({
      where: { id: courtId },
      data: {
        name: name,
        price: price ? Number(price) : undefined,
        isAvailable: isAvailable,
        description: description,
        features: features,
      },
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
