import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// GET /api/courts
// Ejemplo de uso: /api/courts?complexId=12345&sport=Padel
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const complexId = searchParams.get('complexId');
    const sport = searchParams.get('sport'); //filtrar por deporte

    //Si no mandan el ID del complejo, no podemos devolver canchas al azar
    if (!complexId) {
      return NextResponse.json(
        { error: 'Complex ID is required' },
        { status: 400 } // 400 = Bad Request
      );
    }

    // Preparamos el filtro
    const conditions: Prisma.CourtWhereInput = {
        complexId: complexId
    };

    // Si también pidieron filtrar por deporte (ej: solo futbol)
    if (sport) {
      conditions.sport = {
        equals: sport,
        mode: 'insensitive'
      };
    }

    const courts = await prisma.court.findMany({
      where: conditions,
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(courts, { status: 200 });

  } catch (error) {
    console.error("Error fetching courts:", error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}