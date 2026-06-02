import { NextResponse } from "next/server";

import pool from "@/lib/mysql";
import { sincronizarProductoConWeb } from "@/lib/web-sync";

// =========================
// OBTENER PRODUCTOS
// =========================

export async function GET() {
  try {
    const [rows] = await pool.query(
      `
      SELECT *
      FROM productos
      ORDER BY id DESC
      `,
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        error: "Error al obtener productos",
      },
      {
        status: 500,
      },
    );
  }
}

// =========================
// CREAR PRODUCTO
// =========================

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      codigo,
      nombre,
      marca,
      kg,
      tipoMascota,
      etapa,
      stock,
      precioCosto,
      precio,
      imagen,
    } = body;

    const [result]: any = await pool.query(
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
        nombre,
        marca,
        kg,
        tipoMascota,
        etapa,
        Number(stock || 0),
        Number(precioCosto || 0),
        Number(precio || 0),
        imagen || "",
      ],
    );

    await sincronizarProductoConWeb({
      accion: "producto",
      id: result.insertId,
      codigo,
      nombre,
      marca,
      kg,
      tipoMascota,
      etapa,
      stock: Number(stock || 0),
      precioCosto: Number(precioCosto || 0),
      precio: Number(precio || 0),
      imagen: imagen || "",
      origen: "SYSTEM",
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        error: "Error al guardar producto",
      },
      {
        status: 500,
      },
    );
  }
}

// =========================
// EDITAR PRODUCTO
// =========================

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const {
      id,
      codigo,
      nombre,
      marca,
      kg,
      tipoMascota,
      etapa,
      stock,
      precioCosto,
      precio,
      imagen,
    } = body;

    await pool.query(
      `
      UPDATE productos
      SET
        codigo = ?,
        nombre = ?,
        marca = ?,
        kg = ?,
        tipoMascota = ?,
        etapa = ?,
        stock = ?,
        precioCosto = ?,
        precio = ?,
        imagen = ?
      WHERE id = ?
      `,
      [
        codigo,
        nombre,
        marca,
        kg,
        tipoMascota,
        etapa,
        Number(stock || 0),
        Number(precioCosto || 0),
        Number(precio || 0),
        imagen || "",
        id,
      ],
    );

    await sincronizarProductoConWeb({
      accion: "producto",
      id,
      codigo,
      nombre,
      marca,
      kg,
      tipoMascota,
      etapa,
      stock: Number(stock || 0),
      precioCosto: Number(precioCosto || 0),
      precio: Number(precio || 0),
      imagen: imagen || "",
      origen: "SYSTEM",
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        error: "Error al editar producto",
      },
      {
        status: 500,
      },
    );
  }
}

// =========================
// ELIMINAR PRODUCTO
// =========================

export async function DELETE(req: Request) {
  try {
    const body = await req.json();

    const { id } = body;

    await pool.query(
      `
      DELETE FROM productos
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
        error: "Error al eliminar producto",
      },
      {
        status: 500,
      },
    );
  }
}
