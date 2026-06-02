import { NextResponse } from "next/server";

import pool from "@/lib/mysql";

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

    const [clientes]: any = await pool.query(`
      SELECT *
      FROM clientes
      ORDER BY id DESC
    `);

    const [deudas]: any = await pool.query(`
      SELECT *
      FROM deudas
      ORDER BY id DESC
    `);

    const [gastos]: any = await pool.query(`
      SELECT *
      FROM gastos
      ORDER BY id DESC
    `);

    const [proveedores]: any = await pool.query(`
      SELECT *
      FROM proveedores
      ORDER BY id DESC
    `);

    const totalVentas = redondear(
      ventas.reduce((acc: number, venta: any) => acc + Number(venta.total || 0), 0),
    );

    const totalCompras = redondear(
      compras.reduce((acc: number, compra: any) => acc + Number(compra.total || 0), 0),
    );

    const totalGastos = redondear(
      gastos.reduce((acc: number, gasto: any) => acc + Number(gasto.monto || 0), 0),
    );

    const totalDeudas = redondear(
      deudas
        .filter((deuda: any) => deuda.estado !== "Pagada")
        .reduce((acc: number, deuda: any) => acc + Number(deuda.total || 0), 0),
    );

    const deudaProveedores = redondear(
      proveedores.reduce(
        (acc: number, proveedor: any) => acc + Number(proveedor.deuda || 0),
        0,
      ),
    );

    const gananciaProductos = redondear(
      ventas.reduce(
        (acc: number, venta: any) => acc + Number(venta.gananciaTotal || 0),
        0,
      ),
    );

    const gananciaReal = redondear(gananciaProductos - totalGastos);

    const totalProductos = productos.length;
    const totalClientes = clientes.length;
    const totalProveedores = proveedores.length;
    const cantidadVentas = ventas.length;
    const cantidadCompras = compras.length;

    const efectivo = redondear(
      ventas
        .filter((venta: any) => venta.metodoPago === "Efectivo")
        .reduce((acc: number, venta: any) => acc + Number(venta.total || 0), 0),
    );

    const transferencia = redondear(
      ventas
        .filter((venta: any) => venta.metodoPago === "Transferencia")
        .reduce((acc: number, venta: any) => acc + Number(venta.total || 0), 0),
    );

    const debito = redondear(
      ventas
        .filter((venta: any) => venta.metodoPago === "Débito")
        .reduce((acc: number, venta: any) => acc + Number(venta.total || 0), 0),
    );

    const credito = redondear(
      ventas
        .filter((venta: any) => venta.metodoPago === "Crédito")
        .reduce((acc: number, venta: any) => acc + Number(venta.total || 0), 0),
    );

    const entregas = redondear(
      ventas
        .filter((venta: any) => venta.metodoPago === "Entrega")
        .reduce((acc: number, venta: any) => acc + Number(venta.entrega || 0), 0),
    );

    const stockBajo = productos.filter(
      (producto: any) => Number(producto.stock || 0) <= 5,
    );

    const productosAgotados = productos.filter(
      (producto: any) => Number(producto.stock || 0) <= 0,
    );

    return NextResponse.json({
      ventas,
      productos,
      compras,
      clientes,
      deudas,
      gastos,
      proveedores,

      totalVentas,
      totalCompras,
      inversionStock: totalCompras,
      totalGastos,
      totalDeudas,
      deudaProveedores,
      gananciaProductos,
      gananciaReal,
      ganancia: gananciaReal,

      totalProductos,
      totalClientes,
      totalProveedores,
      cantidadVentas,
      cantidadCompras,

      efectivo,
      transferencia,
      debito,
      credito,
      entregas,

      stockBajo,
      productosAgotados,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { error: "Error al obtener dashboard" },
      { status: 500 },
    );
  }
}