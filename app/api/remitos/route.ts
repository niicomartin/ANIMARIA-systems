import { NextResponse } from "next/server";

import pool from "@/lib/mysql";

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT *
      FROM remitos
      ORDER BY id DESC
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { error: "Error al obtener remitos" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { ventaId, numero, tipo, cliente, fecha, total, productos } = body;

    await pool.query(
      `
      INSERT INTO remitos
      (
        ventaId,
        numero,
        tipo,
        cliente,
        fecha,
        total,
        productos
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        ventaId,
        numero,
        tipo,
        cliente,
        fecha,
        total,
        JSON.stringify(productos),
      ],
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { error: "Error al guardar remito" },
      { status: 500 },
    );
  }
}