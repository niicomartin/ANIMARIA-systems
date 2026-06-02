import { NextResponse } from "next/server";

import pool from "@/lib/mysql";
import { sincronizarVentaConWeb } from "@/lib/web-sync";

const redondear = (numero: number) => {
  return Number(Number(numero || 0).toFixed(2));
};

const actualizarDeudaCliente = async (connection: any, cliente: string) => {
  const [deudaRows]: any = await connection.query(
    `
    SELECT COALESCE(SUM(deuda), 0) AS deudaTotal
    FROM ventas
    WHERE LOWER(TRIM(cliente)) = LOWER(TRIM(?))
    `,
    [cliente],
  );

  const deudaTotal = redondear(Number(deudaRows[0]?.deudaTotal || 0));

  await connection.query(
    `
    UPDATE clientes
    SET deuda = ?
    WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?))
    `,
    [deudaTotal, cliente],
  );

  return deudaTotal;
};

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT *
      FROM ventas
      ORDER BY id DESC
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { error: "Error al obtener ventas" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const body = await req.json();

    const {
      cliente,
      telefono,
      direccion,
      ciudad,
      provincia,
      metodoPago,
      subtotal,
      subtotalSinDescuento,
      descuentoPorcentaje,
      envio,
      entrega,
      deuda,
      total,
      productos,
      fecha,
    } = body;

    let costoTotal = 0;
    const productosConCosto = [];

    for (const item of productos) {
      const [productoRows]: any = await connection.query(
        `
        SELECT precioCosto
        FROM productos
        WHERE codigo = ?
        LIMIT 1
        `,
        [item.id],
      );

      if (!productoRows[0]) {
        await connection.rollback();

        return NextResponse.json(
          { error: `Producto no encontrado: ${item.producto || item.id}` },
          { status: 400 },
        );
      }

      const cantidad = Number(item.cantidad || 0);

      const [stockRows]: any = await connection.query(
        `
        SELECT stock
        FROM productos
        WHERE codigo = ?
        LIMIT 1
        `,
        [item.id],
      );

      if (Number(stockRows[0]?.stock || 0) < cantidad) {
        await connection.rollback();

        return NextResponse.json(
          { error: `Stock insuficiente para ${item.producto || item.id}` },
          { status: 400 },
        );
      }

      const precioCosto = Number(productoRows[0]?.precioCosto || 0);
      const costoProducto = redondear(precioCosto * cantidad);

      costoTotal += costoProducto;

      productosConCosto.push({
        ...item,
        precioCosto,
        costoTotal: costoProducto,
      });
    }

    costoTotal = redondear(costoTotal);

    const envioFinal = redondear(Number(envio || 0));
    const totalFinal = redondear(Number(total || 0));
    const gananciaTotal = redondear(totalFinal - costoTotal);

    const [ventaResult]: any = await connection.query(
      `
      INSERT INTO ventas
      (
        cliente,
        telefono,
        direccion,
        ciudad,
        provincia,
        metodoPago,
        subtotal,
        subtotalSinDescuento,
        descuentoPorcentaje,
        envio,
        entrega,
        deuda,
        total,
        costoTotal,
        gananciaTotal,
        productos,
        fecha
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        cliente,
        telefono,
        direccion,
        ciudad,
        provincia,
        metodoPago,
        redondear(Number(subtotal || totalFinal)),
        redondear(Number(subtotalSinDescuento || subtotal || totalFinal)),
        redondear(Number(descuentoPorcentaje || 0)),
        envioFinal,
        redondear(Number(entrega || 0)),
        redondear(Number(deuda || 0)),
        totalFinal,
        costoTotal,
        gananciaTotal,
        JSON.stringify(productosConCosto),
        fecha,
      ],
    );

    const ventaId = ventaResult.insertId;

    for (const item of productos) {
      await connection.query(
        `
        UPDATE productos
        SET stock = stock - ?
        WHERE codigo = ?
        `,
        [Number(item.cantidad), item.id],
      );
    }

    if (Number(deuda || 0) > 0) {
      await connection.query(
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
          ventaId,
          cliente,
          "",
          fecha,
          redondear(Number(deuda || 0)),
          "Pendiente",
        ],
      );
    }

    await actualizarDeudaCliente(connection, cliente);

    await connection.commit();

    await sincronizarVentaConWeb({
      accion: "venta",
      ventaId,
      cliente,
      telefono,
      direccion,
      ciudad,
      provincia,
      metodoPago,
      total: totalFinal,
      productos: productosConCosto,
      origen: "SYSTEM",
    });

    return NextResponse.json({
      success: true,
      ventaId,
      costoTotal,
      gananciaTotal,
    });
  } catch (error) {
    await connection.rollback();

    console.log(error);

    return NextResponse.json(
      { error: "Error al guardar venta" },
      { status: 500 },
    );
  } finally {
    connection.release();
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
      FROM ventas
      WHERE id = ?
      `,
      [id],
    );

    if (rows.length === 0) {
      await connection.rollback();

      return NextResponse.json(
        { error: "Venta no encontrada" },
        { status: 404 },
      );
    }

    const venta = rows[0];
    const deudaActual = Number(venta.deuda || 0);
    const montoPagado = Number(monto || 0);

    if (montoPagado <= 0) {
      await connection.rollback();

      return NextResponse.json(
        { error: "Monto inválido" },
        { status: 400 },
      );
    }

    const nuevaDeuda =
      deudaActual - montoPagado <= 0 ? 0 : redondear(deudaActual - montoPagado);

    await connection.query(
      `
      UPDATE ventas
      SET deuda = ?
      WHERE id = ?
      `,
      [nuevaDeuda, id],
    );

    const nuevoEstado = nuevaDeuda <= 0 ? "Pagada" : "Pendiente";

    await connection.query(
      `
      UPDATE deudas
      SET total = ?, estado = ?
      WHERE ventaId = ?
      `,
      [nuevaDeuda, nuevoEstado, id],
    );

    await actualizarDeudaCliente(connection, venta.cliente);

    await connection.commit();

    return NextResponse.json({
      success: true,
      deuda: nuevaDeuda,
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

    const [ventas]: any = await connection.query(
      `
      SELECT *
      FROM ventas
      WHERE id = ?
      `,
      [id],
    );

    if (ventas.length === 0) {
      await connection.rollback();

      return NextResponse.json(
        { error: "Venta no encontrada" },
        { status: 404 },
      );
    }

    const venta = ventas[0];

    const productos =
      typeof venta.productos === "string"
        ? JSON.parse(venta.productos || "[]")
        : venta.productos || [];

    for (const item of productos) {
      await connection.query(
        `
        UPDATE productos
        SET stock = stock + ?
        WHERE codigo = ?
        `,
        [Number(item.cantidad), item.id],
      );
    }

    await connection.query(
      `
      DELETE FROM deudas
      WHERE ventaId = ?
      `,
      [id],
    );

    await connection.query(
      `
      DELETE FROM remitos
      WHERE ventaId = ?
      `,
      [id],
    );

    await connection.query(
      `
      DELETE FROM ventas
      WHERE id = ?
      `,
      [id],
    );

    await actualizarDeudaCliente(connection, venta.cliente);

    await connection.commit();

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    await connection.rollback();

    console.log(error);

    return NextResponse.json(
      { error: "Error al eliminar venta" },
      { status: 500 },
    );
  } finally {
    connection.release();
  }
}
