import { NextResponse } from "next/server";
import pool from "@/lib/mysql";

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT *
      FROM deudas
      ORDER BY id DESC
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { error: "Error al obtener deudas" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { ventaId, cliente, clienteId, fecha, total, estado } = body;

    await pool.query(
      `
      INSERT INTO deudas
      (
        ventaId,
        cliente,
        clienteId,
        fecha,
        total,
        estado
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        ventaId || null,
        cliente,
        clienteId || "",
        fecha,
        Number(total || 0),
        estado || "Pendiente",
      ],
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { error: "Error al guardar deuda" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const body = await req.json();

    const { id, monto } = body;

    const [rows]: any = await connection.query(
      `
      SELECT *
      FROM deudas
      WHERE id = ?
      `,
      [id],
    );

    if (rows.length === 0) {
      await connection.rollback();

      return NextResponse.json(
        { error: "Deuda no encontrada" },
        { status: 404 },
      );
    }

    const deuda = rows[0];

    const totalActual = Number(deuda.total || 0);

    const montoPago = Number(monto || 0);

    if (montoPago <= 0) {
      await connection.rollback();

      return NextResponse.json(
        { error: "Monto inválido" },
        { status: 400 },
      );
    }

    const nuevoSaldo =
      totalActual - montoPago <= 0 ? 0 : totalActual - montoPago;

    const nuevoEstado = nuevoSaldo <= 0 ? "Pagada" : "Pendiente";

    await connection.query(
      `
      UPDATE deudas
      SET total = ?, estado = ?
      WHERE id = ?
      `,
      [nuevoSaldo, nuevoEstado, id],
    );

    if (deuda.ventaId) {
      await connection.query(
        `
        UPDATE ventas
        SET deuda = ?
        WHERE id = ?
        `,
        [nuevoSaldo, deuda.ventaId],
      );
    }

    await connection.commit();

    return NextResponse.json({
      success: true,
      saldo: nuevoSaldo,
    });
  } catch (error) {
    await connection.rollback();

    console.log(error);

    return NextResponse.json(
      { error: "Error al pagar deuda" },
      { status: 500 },
    );
  } finally {
    connection.release();
  }
}

export async function DELETE(req: Request) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const body = await req.json();

    const { id } = body;

    const [rows]: any = await connection.query(
      `
      SELECT *
      FROM deudas
      WHERE id = ?
      `,
      [id],
    );

    if (rows.length === 0) {
      await connection.rollback();

      return NextResponse.json(
        { error: "Deuda no encontrada" },
        { status: 404 },
      );
    }

    const deuda = rows[0];

    if (deuda.ventaId) {
      await connection.query(
        `
        UPDATE ventas
        SET deuda = 0
        WHERE id = ?
        `,
        [deuda.ventaId],
      );
    }

    await connection.query(
      `
      DELETE FROM deudas
      WHERE id = ?
      `,
      [id],
    );

    await connection.commit();

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    await connection.rollback();

    console.log(error);

    return NextResponse.json(
      { error: "Error al eliminar deuda" },
      { status: 500 },
    );
  } finally {
    connection.release();
  }
}