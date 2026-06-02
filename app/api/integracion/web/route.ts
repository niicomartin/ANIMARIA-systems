import { NextResponse } from "next/server";

import { registrarPedidoWeb, upsertClienteWeb, upsertProductoWeb } from "@/lib/integracion";
import pool from "@/lib/mysql";

function autorizado(req: Request) {
  const tokenConfigurado = process.env.ANIMARIA_SYNC_TOKEN || "";

  if (!tokenConfigurado) return true;

  const token = req.headers.get("x-animaria-token") || req.headers.get("authorization")?.replace("Bearer ", "") || "";

  return token === tokenConfigurado;
}

export async function GET() {
  return NextResponse.json({
    success: true,
    servicio: "Animaria System Integration API",
    acciones: ["cliente", "producto", "pedido"],
  });
}

export async function POST(req: Request) {
  if (!autorizado(req)) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  const connection = await pool.getConnection();

  try {
    const body = await req.json();
    const accion = body.accion || body.tipo;

    if (accion === "cliente") {
      try {
        await connection.beginTransaction();
        const clienteId = await upsertClienteWeb(connection, body.cliente || body);
        await connection.commit();
        return NextResponse.json({ success: true, clienteId });
      } catch (error) {
        await connection.rollback();
        throw error;
      }
    }

    if (accion === "producto") {
      try {
        await connection.beginTransaction();
        const productoId = await upsertProductoWeb(connection, body.producto || body, Number(body.ajusteStock || 0));
        await connection.commit();
        return NextResponse.json({ success: true, productoId });
      } catch (error) {
        await connection.rollback();
        throw error;
      }
    }

    if (accion === "pedido" || accion === "compra" || accion === "venta_web") {
      const resultado = await registrarPedidoWeb(body.pedido || body);
      return NextResponse.json(resultado);
    }

    return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
  } catch (error: any) {
    console.log("Error integración web -> system:", error);

    return NextResponse.json(
      { error: error?.message || "Error en integración" },
      { status: 500 },
    );
  } finally {
    connection.release();
  }
}
