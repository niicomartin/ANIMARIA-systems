import { NextResponse } from "next/server";

import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("imagen") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No se recibió ninguna imagen" },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const extension = file.name.split(".").pop() || "jpg";

    const nombreArchivo = `producto-${Date.now()}.${extension}`;

    const carpetaDestino = path.join(process.cwd(), "public", "uploads", "productos");

    if (!fs.existsSync(carpetaDestino)) {
      fs.mkdirSync(carpetaDestino, { recursive: true });
    }

    const rutaArchivo = path.join(carpetaDestino, nombreArchivo);

    fs.writeFileSync(rutaArchivo, buffer);

    return NextResponse.json({
      success: true,
      imagen: `/uploads/productos/${nombreArchivo}`,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { error: "Error al subir imagen" },
      { status: 500 },
    );
  }
}