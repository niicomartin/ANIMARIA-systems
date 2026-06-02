import { NextResponse } from "next/server";

import pool from "@/lib/mysql";

// =========================
// OBTENER CAJA
// =========================

export async function GET() {
  try {
    const [cajas]: any = await pool.query(`
      SELECT *
      FROM caja_diaria
      WHERE fecha = CURDATE()
      ORDER BY id DESC
      LIMIT 1
    `);

    const caja = cajas[0] || null;

    const [movimientos]: any = await pool.query(`
      SELECT *
      FROM caja_movimientos
      ${caja ? "WHERE cajaId = ?" : ""}
      ORDER BY id DESC
    `, caja ? [caja.id] : []);

    const [ventas]: any = await pool.query(`
      SELECT *
      FROM ventas
      WHERE DATE(created_at) = CURDATE()
      ORDER BY id DESC
    `);

    const efectivo = ventas
      .filter((v: any) => v.metodoPago === "Efectivo")
      .reduce((acc: number, v: any) => acc + Number(v.total || 0), 0);

    const transferencia = ventas
      .filter((v: any) => v.metodoPago === "Transferencia")
      .reduce((acc: number, v: any) => acc + Number(v.total || 0), 0);

    const debito = ventas
      .filter((v: any) => v.metodoPago === "Débito")
      .reduce((acc: number, v: any) => acc + Number(v.total || 0), 0);

    const credito = ventas
      .filter((v: any) => v.metodoPago === "Crédito")
      .reduce((acc: number, v: any) => acc + Number(v.total || 0), 0);

    const entregas = ventas
      .filter((v: any) => v.metodoPago === "Entrega")
      .reduce((acc: number, v: any) => acc + Number(v.entrega || 0), 0);

    const ingresos = movimientos
      .filter((m: any) => m.tipo === "Ingreso")
      .reduce((acc: number, m: any) => acc + Number(m.monto || 0), 0);

    const egresos = movimientos
      .filter((m: any) => m.tipo === "Egreso")
      .reduce((acc: number, m: any) => acc + Number(m.monto || 0), 0);

    const cajaInicial = Number(caja?.montoInicial || 0);

    const ventasHoy = efectivo + transferencia + debito + credito + entregas;

    const cajaEsperada = cajaInicial + efectivo + entregas + ingresos - egresos;

    return NextResponse.json({
      caja,

      movimientos,

      ventas,

      totales: {
        cajaInicial,

        ventasHoy,

        cajaEsperada,

        efectivo,

        transferencia,

        debito,

        credito,

        entregas,

        ingresos,

        egresos,
      },
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        error: "Error al obtener caja",
      },
      {
        status: 500,
      },
    );
  }
}

// =========================
// ABRIR CAJA / MOVIMIENTO
// =========================

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { accion } = body;

    if (accion === "abrir") {
      const { montoInicial } = body;

      const [existe]: any = await pool.query(`
        SELECT *
        FROM caja_diaria
        WHERE fecha = CURDATE()
        ORDER BY id DESC
        LIMIT 1
      `);

      if (existe.length > 0) {
        return NextResponse.json(
          {
            error: "La caja de hoy ya está abierta",
          },
          {
            status: 400,
          },
        );
      }

      await pool.query(
        `
        INSERT INTO caja_diaria
        (
          fecha,
          montoInicial,
          estado
        )
        VALUES (CURDATE(), ?, 'Abierta')
        `,
        [Number(montoInicial || 0)],
      );

      return NextResponse.json({
        success: true,
      });
    }

    if (accion === "movimiento") {
      const { cajaId, descripcion, tipo, monto, fecha } = body;

      await pool.query(
        `
        INSERT INTO caja_movimientos
        (
          cajaId,
          descripcion,
          tipo,
          monto,
          fecha
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          cajaId,
          descripcion,
          tipo,
          Number(monto || 0),
          fecha,
        ],
      );

      return NextResponse.json({
        success: true,
      });
    }

    return NextResponse.json(
      {
        error: "Acción inválida",
      },
      {
        status: 400,
      },
    );
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        error: "Error al guardar caja",
      },
      {
        status: 500,
      },
    );
  }
}

// =========================
// CERRAR CAJA
// =========================

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    const { id, cajaReal, cajaEsperada } = body;

    const diferencia = Number(cajaReal || 0) - Number(cajaEsperada || 0);

    await pool.query(
      `
      UPDATE caja_diaria
      SET
        cajaReal = ?,
        diferencia = ?,
        estado = 'Cerrada'
      WHERE id = ?
      `,
      [
        Number(cajaReal || 0),
        diferencia,
        id,
      ],
    );

    return NextResponse.json({
      success: true,
      diferencia,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        error: "Error al cerrar caja",
      },
      {
        status: 500,
      },
    );
  }
}

// =========================
// ELIMINAR MOVIMIENTO
// =========================

export async function DELETE(req: Request) {
  try {
    const body = await req.json();

    const { id } = body;

    await pool.query(
      `
      DELETE FROM caja_movimientos
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
        error: "Error al eliminar movimiento",
      },
      {
        status: 500,
      },
    );
  }
}