const WEB_API_URL = process.env.ANIMARIA_WEB_API_URL || "";
const WEB_API_TOKEN = process.env.ANIMARIA_WEB_API_TOKEN || "";

async function enviar(path: string, body: any) {
  if (!WEB_API_URL) return { skipped: true };

  try {
    const res = await fetch(`${WEB_API_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(WEB_API_TOKEN ? { "x-animaria-token": WEB_API_TOKEN } : {}),
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.log("No se pudo sincronizar con Animaria Web", path, await res.text());
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.log("Error sincronizando con Animaria Web", error);
    return { success: false };
  }
}

export async function sincronizarProductoConWeb(producto: any) {
  return enviar("/api/integracion/system/producto", producto);
}

export async function sincronizarClienteConWeb(cliente: any) {
  return enviar("/api/integracion/system/cliente", cliente);
}

export async function sincronizarVentaConWeb(venta: any) {
  return enviar("/api/integracion/system/venta", venta);
}
