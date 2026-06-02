import { NextResponse } from "next/server";

import pool from "@/lib/mysql";

// =========================
// LOGIN
// =========================

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { usuario, password } = body;

    // =========================
    // BUSCAR USUARIO
    // =========================

    const [rows]: any = await pool.query(
      `
      SELECT * FROM usuarios
      WHERE usuario = ?
      `,
      [usuario],
    );

    // NO EXISTE

    if (rows.length === 0) {
      return NextResponse.json(
        {
          error: "Usuario no encontrado",
        },
        {
          status: 401,
        },
      );
    }

    const user = rows[0];

    // =========================
    // VALIDAR PASSWORD
    // =========================

    if (user.password !== password) {
      return NextResponse.json(
        {
          error: "Contraseña incorrecta",
        },
        {
          status: 401,
        },
      );
    }

    // =========================
    // RESPUESTA
    // =========================

    return NextResponse.json({
      success: true,

      usuario: user.usuario,

      rol: user.rol,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        error: "Error al iniciar sesión",
      },
      {
        status: 500,
      },
    );
  }
}