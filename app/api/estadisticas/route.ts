import { NextResponse } from "next/server";

import pool from "@/lib/mysql";

function leerProductos(productos: any) {
  try {
    if (!productos) return [];

    if (typeof productos === "string") {
      return JSON.parse(productos || "[]");
    }

    if (Array.isArray(productos)) {
      return productos;
    }

    return [];
  } catch {
    return [];
  }
}

const redondear = (numero: number) => {
  return Number(Number(numero || 0).toFixed(2));
};

export async function GET() {
  try {
    const [ventas]: any = await pool.query(`
      SELECT *
      FROM ventas
      ORDER BY id DESC
    `);

    const [clientes]: any = await pool.query(`
      SELECT *
      FROM clientes
      ORDER BY id DESC
    `);

    const [productos]: any = await pool.query(`
      SELECT *
      FROM productos
      ORDER BY id DESC
    `);

    const [compras]: any = await pool.query(`
      SELECT *
      FROM compras
      ORDER BY id DESC
    `);

    const [gastos]: any = await pool.query(`
      SELECT *
      FROM gastos
      ORDER BY id DESC
    `);

    const [deudas]: any = await pool.query(`
      SELECT *
      FROM deudas
      ORDER BY id DESC
    `);

    const [proveedores]: any = await pool.query(`
      SELECT *
      FROM proveedores
      ORDER BY id DESC
    `);

    const totalVentas = redondear(
      ventas.reduce(
        (acc: number, venta: any) => acc + Number(venta.total || 0),
        0,
      ),
    );

    const totalCompras = redondear(
      compras.reduce(
        (acc: number, compra: any) => acc + Number(compra.total || 0),
        0,
      ),
    );

    const totalGastos = redondear(
      gastos.reduce(
        (acc: number, gasto: any) => acc + Number(gasto.monto || 0),
        0,
      ),
    );

    const totalDeudas = redondear(
      deudas
        .filter((deuda: any) => deuda.estado !== "Pagada")
        .reduce(
          (acc: number, deuda: any) => acc + Number(deuda.total || 0),
          0,
        ),
    );

    const deudaProveedores = redondear(
      proveedores.reduce(
        (acc: number, proveedor: any) =>
          acc + Number(proveedor.deuda || 0),
        0,
      ),
    );

    const gananciaProductos = redondear(
      ventas.reduce(
        (acc: number, venta: any) =>
          acc + Number(venta.gananciaTotal || 0),
        0,
      ),
    );

    const ganancia = redondear(gananciaProductos - totalGastos);

    const stockBajo = productos.filter(
      (producto: any) => Number(producto.stock || 0) <= 5,
    );

    const productosAgotados = productos.filter(
      (producto: any) => Number(producto.stock || 0) <= 0,
    );

    const contadorProductos: Record<string, number> = {};

    ventas.forEach((venta: any) => {
      const productosVenta = leerProductos(venta.productos);

      productosVenta.forEach((producto: any) => {
        const nombre = producto.producto || producto.nombre || "Sin nombre";

        contadorProductos[nombre] =
          (contadorProductos[nombre] || 0) + Number(producto.cantidad || 0);
      });
    });

    let productoMasVendido = "Sin ventas";
    let cantidadMasVendida = 0;

    Object.entries(contadorProductos).forEach(([nombre, cantidad]) => {
      if (cantidad > cantidadMasVendida) {
        productoMasVendido = nombre;
        cantidadMasVendida = cantidad;
      }
    });

    return NextResponse.json({
      totalVentas,
      cantidadVentas: ventas.length,
      totalClientes: clientes.length,
      totalProductos: productos.length,

      totalCompras,
      inversionStock: totalCompras,

      totalGastos,
      totalDeudas,
      deudaProveedores,

      gananciaProductos,
      ganancia,

      stockBajo,
      productosAgotados,
      productoMasVendido,
      cantidadMasVendida,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        error: "Error al obtener estadísticas",
      },
      {
        status: 500,
      },
    );
  }
}