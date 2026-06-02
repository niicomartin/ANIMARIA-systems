import { NextResponse } from "next/server";
import pool from "@/lib/mysql";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const proveedorId = searchParams.get("proveedorId");

    if (proveedorId) {
      const [pagos] = await pool.query(
        `
        SELECT *
        FROM proveedor_pagos
        WHERE proveedorId = ?
        ORDER BY id DESC
        `,
        [proveedorId],
      );

      return NextResponse.json(pagos);
    }

    const [rows] = await pool.query(`
      SELECT *
      FROM proveedores
      ORDER BY id DESC
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { error: "Error al obtener proveedores" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      nombre,
      telefono,
      direccion,
      ciudad,
      provincia,
      cuit,
      observaciones,
      deuda,
      saldoFavor,
    } = body;

    await pool.query(
      `
      INSERT INTO proveedores
      (
        nombre,
        telefono,
        direccion,
        ciudad,
        provincia,
        cuit,
        observaciones,
        deuda,
        saldoFavor
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        nombre,
        telefono,
        direccion,
        ciudad,
        provincia,
        cuit,
        observaciones,
        Number(deuda || 0),
        Number(saldoFavor || 0),
      ],
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { error: "Error al crear proveedor" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const body = await req.json();

    const {
      id,
      nombre,
      telefono,
      direccion,
      ciudad,
      provincia,
      cuit,
      observaciones,
      deuda,
      saldoFavor,
      pagarDeuda,
      fechaPago,
    } = body;

    if (pagarDeuda) {
      const [rows]: any = await connection.query(
        `
        SELECT *
        FROM proveedores
        WHERE id = ?
        `,
        [id],
      );

      if (rows.length === 0) {
        await connection.rollback();

        return NextResponse.json(
          { error: "Proveedor no encontrado" },
          { status: 404 },
        );
      }

      const proveedor = rows[0];
      const deudaActual = Number(proveedor.deuda || 0);
      const saldoFavorActual = Number(proveedor.saldoFavor || 0);
      const montoPago = Number(pagarDeuda || 0);

      if (montoPago <= 0) {
        await connection.rollback();

        return NextResponse.json(
          { error: "Monto inválido" },
          { status: 400 },
        );
      }

      let saldoPago = montoPago;

      const [comprasPendientes]: any = await connection.query(
        `
        SELECT id, deuda
        FROM compras
        WHERE LOWER(TRIM(proveedor)) = LOWER(TRIM(?))
          AND deuda > 0
        ORDER BY id ASC
        `,
        [proveedor.nombre],
      );

      for (const compra of comprasPendientes) {
        if (saldoPago <= 0) break;

        const deudaCompra = Number(compra.deuda || 0);
        const pagoAplicado =
          saldoPago >= deudaCompra ? deudaCompra : saldoPago;

        const nuevaDeudaCompra =
          deudaCompra - pagoAplicado <= 0 ? 0 : deudaCompra - pagoAplicado;

        const nuevoEstadoCompra =
          nuevaDeudaCompra <= 0 ? "Pagado" : "Pendiente";

        await connection.query(
          `
          UPDATE compras
          SET
            deuda = ?,
            estadoPago = ?
          WHERE id = ?
          `,
          [nuevaDeudaCompra, nuevoEstadoCompra, compra.id],
        );

        saldoPago -= pagoAplicado;
      }

      const diferencia = deudaActual - montoPago;

      const nuevaDeuda = diferencia > 0 ? diferencia : 0;

      const saldoFavorGenerado = diferencia < 0 ? Math.abs(diferencia) : 0;

      const nuevoSaldoFavor = saldoFavorActual + saldoFavorGenerado;

      await connection.query(
        `
        UPDATE proveedores
        SET
          deuda = ?,
          saldoFavor = ?
        WHERE id = ?
        `,
        [nuevaDeuda, nuevoSaldoFavor, id],
      );

      await connection.query(
        `
        INSERT INTO proveedor_pagos
        (
          proveedorId,
          proveedor,
          monto,
          fecha
        )
        VALUES (?, ?, ?, ?)
        `,
        [
          id,
          proveedor.nombre,
          montoPago,
          fechaPago || new Date().toLocaleString(),
        ],
      );

      await connection.commit();

      return NextResponse.json({
        success: true,
        deuda: nuevaDeuda,
        saldoFavorGenerado,
        saldoFavor: nuevoSaldoFavor,
      });
    }

    await connection.query(
      `
      UPDATE proveedores
      SET
        nombre = ?,
        telefono = ?,
        direccion = ?,
        ciudad = ?,
        provincia = ?,
        cuit = ?,
        observaciones = ?,
        deuda = ?,
        saldoFavor = ?
      WHERE id = ?
      `,
      [
        nombre,
        telefono,
        direccion,
        ciudad,
        provincia,
        cuit,
        observaciones,
        Number(deuda || 0),
        Number(saldoFavor || 0),
        id,
      ],
    );

    await connection.commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    await connection.rollback();

    console.log(error);

    return NextResponse.json(
      { error: "Error al editar proveedor" },
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

    await connection.query(
      `
      DELETE FROM proveedor_pagos
      WHERE proveedorId = ?
      `,
      [id],
    );

    await connection.query(
      `
      DELETE FROM proveedores
      WHERE id = ?
      `,
      [id],
    );

    await connection.commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    await connection.rollback();

    console.log(error);

    return NextResponse.json(
      { error: "Error al eliminar proveedor" },
      { status: 500 },
    );
  } finally {
    connection.release();
  }
}

