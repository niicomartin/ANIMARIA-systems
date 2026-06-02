"use client";

import { useEffect, useState } from "react";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function RemitosPage() {
  const [ventas, setVentas] = useState<any[]>([]);

  const [remitos, setRemitos] = useState<any[]>([]);

  const [busqueda, setBusqueda] = useState("");

  const [tipoComprobante, setTipoComprobante] = useState("Remito");

  const obtenerVentas = async () => {
    try {
      const res = await fetch("/api/ventas");

      const data = await res.json();

      setVentas(data);
    } catch (error) {
      console.log(error);
    }
  };

  const obtenerRemitos = async () => {
    try {
      const res = await fetch("/api/remitos");

      const data = await res.json();

      setRemitos(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    obtenerVentas();

    obtenerRemitos();
  }, []);

  const leerProductos = (productos: any) => {
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
  };

  const generarPDF = async (venta: any, tipo: string) => {
    const numero = `${tipo.replace(" ", "-")}-${Math.floor(
      100000 + Math.random() * 900000,
    )}`;

    const productos = leerProductos(venta.productos);

    const doc = new jsPDF();

    doc.setFontSize(24);
    doc.text("ANIMARIA", 14, 20);

    doc.setFontSize(16);
    doc.text(tipo.toUpperCase(), 14, 32);

    doc.setFontSize(12);
    doc.text(`N°: ${numero}`, 14, 42);
    doc.text(`Cliente: ${venta.cliente}`, 14, 52);
    doc.text(`Fecha: ${venta.fecha}`, 14, 60);
    doc.text(`Método de Pago: ${venta.metodoPago}`, 14, 68);

    autoTable(doc, {
      startY: 80,
      head: [["Código", "Producto", "Cantidad", "Precio", "Total"]],
      body: productos.map((item: any) => [
        item.id || item.codigo || "",
        item.producto || item.nombre || "",
        item.cantidad,
        `$${item.precio}`,
        `$${item.total}`,
      ]),
    });

    const finalY = (doc as any).lastAutoTable.finalY + 12;

    doc.setFontSize(14);
    doc.text(`TOTAL: $${venta.total}`, 14, finalY);

    if (Number(venta.deuda || 0) > 0) {
      doc.text(`DEUDA: $${venta.deuda}`, 14, finalY + 10);
    }

    await fetch("/api/remitos", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        ventaId: venta.id,
        numero,
        tipo,
        cliente: venta.cliente,
        fecha: new Date().toLocaleString(),
        total: venta.total,
        productos,
      }),
    });

    await obtenerRemitos();

    doc.autoPrint();

    window.open(doc.output("bloburl"));

    doc.save(`${numero}.pdf`);
  };

  const reimprimirPDF = (remito: any) => {
    const productos = leerProductos(remito.productos);

    const doc = new jsPDF();

    doc.setFontSize(24);
    doc.text("ANIMARIA", 14, 20);

    doc.setFontSize(16);
    doc.text(remito.tipo.toUpperCase(), 14, 32);

    doc.setFontSize(12);
    doc.text(`N°: ${remito.numero}`, 14, 42);
    doc.text(`Cliente: ${remito.cliente}`, 14, 52);
    doc.text(`Fecha: ${remito.fecha}`, 14, 60);

    autoTable(doc, {
      startY: 75,
      head: [["Código", "Producto", "Cantidad", "Precio", "Total"]],
      body: productos.map((item: any) => [
        item.id || item.codigo || "",
        item.producto || item.nombre || "",
        item.cantidad,
        `$${item.precio}`,
        `$${item.total}`,
      ]),
    });

    const finalY = (doc as any).lastAutoTable.finalY + 12;

    doc.setFontSize(14);
    doc.text(`TOTAL: $${remito.total}`, 14, finalY);

    doc.autoPrint();

    window.open(doc.output("bloburl"));

    doc.save(`${remito.numero}.pdf`);
  };

  const ventasFiltradas = ventas.filter((venta) => {
    const texto = busqueda.toLowerCase();

    return (
      venta.cliente?.toLowerCase().includes(texto) ||
      venta.fecha?.toLowerCase().includes(texto) ||
      venta.id?.toString().includes(texto)
    );
  });

  return (
    <main className="pt-[120px] min-h-screen bg-gray-100 p-10">
      <h1 className="text-4xl font-bold text-black mb-8">Remitos y Facturas</h1>

      <div className="bg-white rounded-2xl shadow p-6 mb-8">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Buscar venta por cliente, fecha o ID..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="border p-3 rounded-xl text-black"
          />

          <select
            value={tipoComprobante}
            onChange={(e) => setTipoComprobante(e.target.value)}
            className="border p-3 rounded-xl text-black"
          >
            <option value="Remito">Remito</option>
            <option value="Factura A">Factura A</option>
            <option value="Factura B">Factura B</option>
            <option value="Factura C">Factura C</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-8 mb-10">
        <h2 className="text-2xl font-bold text-black mb-6">
          Ventas para generar comprobante
        </h2>

        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3 text-black">Venta</th>
              <th className="text-left p-3 text-black">Cliente</th>
              <th className="text-left p-3 text-black">Fecha</th>
              <th className="text-left p-3 text-black">Total</th>
              <th className="text-left p-3 text-black">Acción</th>
            </tr>
          </thead>

          <tbody>
            {ventasFiltradas.map((venta) => (
              <tr key={venta.id} className="border-b">
                <td className="p-3 text-black">#{venta.id}</td>

                <td className="p-3 text-black font-bold">{venta.cliente}</td>

                <td className="p-3 text-black">{venta.fecha}</td>

                <td className="p-3 text-green-600 font-bold">${venta.total}</td>

                <td className="p-3">
                  <button
                    onClick={() => generarPDF(venta, tipoComprobante)}
                    className="bg-black text-white px-4 py-2 rounded-xl hover:bg-gray-800"
                  >
                    Generar {tipoComprobante}
                  </button>
                </td>
              </tr>
            ))}

            {ventasFiltradas.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-gray-500 p-6">
                  No hay ventas cargadas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-2xl shadow p-8">
        <h2 className="text-2xl font-bold text-black mb-6">
          Historial de Comprobantes
        </h2>

        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3 text-black">Número</th>
              <th className="text-left p-3 text-black">Tipo</th>
              <th className="text-left p-3 text-black">Cliente</th>
              <th className="text-left p-3 text-black">Fecha</th>
              <th className="text-left p-3 text-black">Total</th>
              <th className="text-left p-3 text-black">Acción</th>
            </tr>
          </thead>

          <tbody>
            {remitos.map((remito) => (
              <tr key={remito.id} className="border-b">
                <td className="p-3 text-black">#{remito.numero}</td>

                <td className="p-3 text-black font-bold">{remito.tipo}</td>

                <td className="p-3 text-black">{remito.cliente}</td>

                <td className="p-3 text-black">{remito.fecha}</td>

                <td className="p-3 text-green-600 font-bold">
                  ${remito.total}
                </td>

                <td className="p-3">
                  <button
                    onClick={() => reimprimirPDF(remito)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
                  >
                    Reimprimir
                  </button>
                </td>
              </tr>
            ))}

            {remitos.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-gray-500 p-6">
                  No hay comprobantes generados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
