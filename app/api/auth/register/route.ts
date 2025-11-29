import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

/**
 * Registra un nuevo Complejo Deportivo (Admin).
 * 
 * @param {Request} request - Body JSON
 * @returns {Promise<NextResponse>} 201 Created o Error.
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {name, email, password, location, address, phone} = body;

        if (!email || !password || !name) {
            return NextResponse.json(
                { error: 'Faltan datos obligatorios (email, password, name)' },
                { status: 400 }
            );
        }

        //Check if the user already exists
        const existingUser = await prisma.complex.findUnique({
            where: 
            {email: email}
        });

        if(existingUser) {
            return NextResponse.json(
                {error: "Este email ya está registrado"},
                {status: 400}
            );
        }

        //Encrypt password
        const hashedPassword = await bcrypt.hash(password, 10);

        //Create a new complex in the db
        const newComplex = await prisma.complex.create({
            data: {
                name,
                email,
                password: hashedPassword,
                location: location || "Desconocida",
                address: address || "Sin dirección",
                phone: phone || "",
            }
        });

        const userWithoutPassword = {
            id: newComplex.id,
            name: newComplex.name,
            email: newComplex.email,
            location: newComplex.location,
            address: newComplex.address,
            phone: newComplex.phone
        };

        //Response
        return NextResponse.json(userWithoutPassword, {status: 201});

    } catch (error) {
        console.error("Error en registro:", error);
        return NextResponse.json(
            { error: 'Error al registrar el complejo' },
            { status: 500 }
        );
    }
}