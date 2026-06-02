import { NextResponse } from "next/server";

import pool from "@/lib/mysql";

// =========================
// OBTENER GASTOS
// =========================

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT *
      FROM gastos
      ORDER BY id DESC
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        error: "Error al obtener gastos",
      },
      {
        status: 500,
      },
    );
  }
}

// =========================
// CREAR GASTO
// =========================

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { servicio, monto, fecha } = body;

    await pool.query(
      `
      INSERT INTO gastos
      (
        servicio,
        monto,
        fecha
      )
      VALUES (?, ?, ?)
      `,
      [
        servicio,
        Number(monto || 0),
        fecha,
      ],
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        error: "Error al guardar gasto",
      },
      {
        status: 500,
      },
    );
  }
}

// =========================
// ELIMINAR GASTO
// =========================

export async function DELETE(req: Request) {
  try {
    const body = await req.json();

    const { id } = body;

    await pool.query(
      `
      DELETE FROM gastos
      WHERE id = ?
      `,
      [id],
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        error: "Error al eliminar gasto",
      },
      {
        status: 500,
      },
    );
  }
}