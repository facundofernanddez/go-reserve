import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/complexes
 * Obtiene una lista de complejos deportivos.
 * Permite filtrar por localidad a través de parámetros de URL.
 * 
 * @param {Request} request - La petición HTTP con query params opcionales (?location=...)
 * @returns {Promise<NextResponse>} JSON con array de complejos o error.
 */
export async function GET(request: Request) {
    try {
        //Get data form the url
        const {searchParams} = new URL (request.url);
        const queryLocation = searchParams.get('location'); //ej. "Corrientes"

        //Empty object to store search conditions
        let conditions = {};

        if(queryLocation) {
            conditions = {
                location: {
                    contains: queryLocation, //Search for partial matches
                    mode: 'insensitive' //Ignore uppercase/lowercase
                }
            };
        }

        //Consult the database
        const listOfComplexs = await prisma.complex.findMany({
            where: conditions, //trae todos los complejos de "Corrientes"
            orderBy: {
                name: 'asc'//ordenados alfabeticamente
            }
        });

        return NextResponse.json(listOfComplexs, {status: 200});

    } catch (error) {
        console.error("Error fetching complexes:", error);
    
        return NextResponse.json(
            { error: 'Internal Server Error' }, 
            { status: 500 }
        );

    }
    

}

