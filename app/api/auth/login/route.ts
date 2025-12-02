import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * Autentica a un administrador del complejo.
 *
 * @param {Request} request - Body JSON
 * @returns {Promise<NextResponse>} 200 OK with user o 401 Unauthorized.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son obligatorios" },
        { status: 400 }
      );
    }

    //Find user in DB
    const user = await prisma.complex.findUnique({
      where: { email: email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    //Verify password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    const userWithoutPassword = {
      id: user.id,
      name: user.name,
      email: user.email,
      location: user.location,
      address: user.address,
    };

    //Response
    return NextResponse.json(
      { message: "Login exitoso", user: userWithoutPassword },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
