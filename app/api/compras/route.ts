import { NextResponse } from "next/server";

import pool from "@/lib/mysql";
import { sincronizarProductoConWeb } from "@/lib/web-sync";

const redondear = (numero: number) => {
  return Number(Number(numero || 0).toFixed(2));
};

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT *
      FROM compras
      ORDER BY id DESC
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { error: "Error al obtener compras" },
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
      proveedor,
      factura,
      metodoPago,
      entrega,
      deuda,
      estadoPago,
      total,
      productos,
      fecha,
    } = body;

    let deudaCompraFinal = Number(deuda || 0);
    let estadoPagoFinal = estadoPago;
    const productosParaSincronizarWeb: any[] = [];

    if (deudaCompraFinal > 0) {
      const [proveedorRows]: any = await connection.query(
        `
        SELECT *
        FROM proveedores
        WHERE nombre = ?
        LIMIT 1
        `,
        [proveedor],
      );

      const proveedorEncontrado = proveedorRows[0];

      if (proveedorEncontrado) {
        const saldoFavorDisponible = Number(proveedorEncontrado.saldoFavor || 0);
        const saldoUsado = Math.min(saldoFavorDisponible, deudaCompraFinal);

        if (saldoUsado > 0) {
          deudaCompraFinal = redondear(deudaCompraFinal - saldoUsado);

          await connection.query(
            `
            UPDATE proveedores
            SET saldoFavor = ?
            WHERE id = ?
            `,
            [
              redondear(saldoFavorDisponible - saldoUsado),
              proveedorEncontrado.id,
            ],
          );
        }
      }

      estadoPagoFinal = deudaCompraFinal <= 0 ? "Pagado" : "Pendiente";
    }

    await connection.query(
      `
      INSERT INTO compras
      (
        proveedor,
        factura,
        metodoPago,
        entrega,
        deuda,
        estadoPago,
        total,
        fecha,
        productos
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        proveedor,
        factura,
        metodoPago,
        Number(entrega || 0),
        deudaCompraFinal,
        estadoPagoFinal,
        total,
        fecha,
        JSON.stringify(productos),
      ],
    );

    if (deudaCompraFinal > 0) {
      await connection.query(
        `
        UPDATE proveedores
        SET deuda = deuda + ?
        WHERE nombre = ?
        `,
        [deudaCompraFinal, proveedor],
      );
    }

    for (const item of productos) {
      const cantidad = Number(item.cantidad);
      const codigo = item.codigo;
      const precioCosto = Number(item.precioCosto || 0);
      const precioVenta = Number(item.precioVenta || 0);
      const imagen = item.imagen || "";

      const [productoPorCodigo]: any = await connection.query(
        `
        SELECT *
        FROM productos
        WHERE codigo = ?
        LIMIT 1
        `,
        [codigo],
      );

      let productoExistente = productoPorCodigo;

      if (productoExistente.length === 0) {
        const [productoPorDatos]: any = await connection.query(
          `
          SELECT *
          FROM productos
          WHERE LOWER(nombre) = LOWER(?)
            AND LOWER(marca) = LOWER(?)
            AND COALESCE(kg, '') = COALESCE(?, '')
            AND COALESCE(tipoMascota, '') = COALESCE(?, '')
            AND COALESCE(etapa, '') = COALESCE(?, '')
          LIMIT 1
          `,
          [
            item.nombre || "",
            proveedor || "",
            item.kg || "",
            item.tipoMascota || "",
            item.etapa || "",
          ],
        );

        productoExistente = productoPorDatos;
      }

      if (productoExistente.length > 0) {
        await connection.query(
          `
          UPDATE productos
          SET
            stock = stock + ?,
            precioCosto = ?,
            precio = ?,
            kg = ?,
            tipoMascota = ?,
            etapa = ?,
            nombre = ?,
            marca = ?,
            imagen = ?
          WHERE id = ?
          `,
          [
            cantidad,
            precioCosto,
            precioVenta,
            item.kg || productoExistente[0].kg || "",
            item.tipoMascota || productoExistente[0].tipoMascota || "",
            item.etapa || productoExistente[0].etapa || "",
            item.nombre || productoExistente[0].nombre || "",
            proveedor || productoExistente[0].marca || "",
            imagen || productoExistente[0].imagen || "",
            productoExistente[0].id,
          ],
        );

        productosParaSincronizarWeb.push({
          accion: "producto",
          id: productoExistente[0].id,
          codigo,
          nombre: item.nombre || productoExistente[0].nombre || "",
          marca: proveedor || productoExistente[0].marca || "",
          kg: item.kg || productoExistente[0].kg || "",
          tipoMascota: item.tipoMascota || productoExistente[0].tipoMascota || "",
          etapa: item.etapa || productoExistente[0].etapa || "",
          ajusteStock: cantidad,
          precioCosto,
          precio: precioVenta,
          imagen: imagen || productoExistente[0].imagen || "",
          origen: "SYSTEM_COMPRA",
        });
      } else {
        const [insertProductoResult]: any = await connection.query(
          `
          INSERT INTO productos
          (
            codigo,
            nombre,
            marca,
            kg,
            tipoMascota,
            etapa,
            stock,
            precioCosto,
            precio,
            imagen
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            codigo,
            item.nombre,
            proveedor,
            item.kg || "",
            item.tipoMascota || "",
            item.etapa || "",
            cantidad,
            precioCosto,
            precioVenta,
            imagen,
          ],
        );

        productosParaSincronizarWeb.push({
          accion: "producto",
          id: insertProductoResult.insertId,
          codigo,
          nombre: item.nombre,
          marca: proveedor,
          kg: item.kg || "",
          tipoMascota: item.tipoMascota || "",
          etapa: item.etapa || "",
          stock: cantidad,
          precioCosto,
          precio: precioVenta,
          imagen,
          origen: "SYSTEM_COMPRA",
        });
      }
    }

    await connection.commit();

    for (const productoSync of productosParaSincronizarWeb) {
      await sincronizarProductoConWeb(productoSync);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    await connection.rollback();

    console.log(error);

    return NextResponse.json(
      { error: "Error al guardar compra" },
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

    const [compras]: any = await connection.query(
      `
      SELECT *
      FROM compras
      WHERE id = ?
      `,
      [id],
    );

    if (compras.length === 0) {
      await connection.rollback();

      return NextResponse.json(
        { error: "Compra no encontrada" },
        { status: 404 },
      );
    }

    const compra = compras[0];

    const productos =
      typeof compra.productos === "string"
        ? JSON.parse(compra.productos || "[]")
        : compra.productos || [];

    for (const item of productos) {
      await connection.query(
        `
        UPDATE productos
        SET stock = GREATEST(stock - ?, 0)
        WHERE codigo = ?
        `,
        [Number(item.cantidad), item.codigo],
      );
    }

    if (Number(compra.deuda || 0) > 0) {
      await connection.query(
        `
        UPDATE proveedores
        SET deuda = GREATEST(deuda - ?, 0)
        WHERE nombre = ?
        `,
        [Number(compra.deuda || 0), compra.proveedor],
      );
    }

    await connection.query(
      `
      DELETE FROM compras
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
      { error: "Error al eliminar compra" },
      { status: 500 },
    );
  } finally {
    connection.release();
  }
}
