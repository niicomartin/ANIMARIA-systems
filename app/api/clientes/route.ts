import { NextResponse } from "next/server";

import pool from "@/lib/mysql";
import { sincronizarClienteConWeb } from "@/lib/web-sync";

// =========================
// OBTENER CLIENTES
// =========================

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT
        c.*,
        COALESCE(SUM(v.deuda), 0) AS deuda
      FROM clientes c
      LEFT JOIN ventas v
        ON LOWER(TRIM(v.cliente)) = LOWER(TRIM(c.nombre))
      GROUP BY c.id
      ORDER BY c.id DESC
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        error: "Error al obtener clientes",
      },
      {
        status: 500,
      },
    );
  }
}

// =========================
// CREAR CLIENTE
// =========================

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      codigo,
      nombre,
      telefono,
      direccion,
      ciudad,
      provincia,
      deuda,
    } = body;

    const [result]: any = await pool.query(
      `
      INSERT INTO clientes
      (
        codigo,
        nombre,
        telefono,
        direccion,
        ciudad,
        provincia,
        deuda
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        codigo,
        nombre,
        telefono,
        direccion,
        ciudad,
        provincia,
        deuda || 0,
      ],
    );

    await sincronizarClienteConWeb({
      accion: "cliente",
      id: result.insertId,
      codigo,
      nombre,
      telefono,
      direccion,
      ciudad,
      provincia,
      origen: "SYSTEM",
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        error: "Error al crear cliente",
      },
      {
        status: 500,
      },
    );
  }
}

// =========================
// EDITAR CLIENTE
// =========================

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const {
      id,
      codigo,
      nombre,
      telefono,
      direccion,
      ciudad,
      provincia,
      deuda,
    } = body;

    await pool.query(
      `
      UPDATE clientes
      SET
        codigo = ?,
        nombre = ?,
        telefono = ?,
        direccion = ?,
        ciudad = ?,
        provincia = ?,
        deuda = ?
      WHERE id = ?
      `,
      [
        codigo,
        nombre,
        telefono,
        direccion,
        ciudad,
        provincia,
        deuda || 0,
        id,
      ],
    );

    await sincronizarClienteConWeb({
      accion: "cliente",
      id,
      codigo,
      nombre,
      telefono,
      direccion,
      ciudad,
      provincia,
      origen: "SYSTEM",
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        error: "Error al editar cliente",
      },
      {
        status: 500,
      },
    );
  }
}

// =========================
// ELIMINAR CLIENTE
// =========================

export async function DELETE(req: Request) {
  try {
    const body = await req.json();

    const { id } = body;

    await pool.query(
      `
      DELETE FROM clientes
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
        error: "Error al eliminar cliente",
      },
      {
        status: 500,
      },
    );
  }
}
